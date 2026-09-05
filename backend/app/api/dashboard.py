from fastapi import APIRouter, Depends
from app.api.auth import get_current_user
from app.database.mongodb import get_db

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/stats")
def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_email = current_user["email"]
    
    total_docs = db["documents"].count_documents({})
    # If documents had a user_id we would filter by it. Since there isn't one clearly defined in the schema earlier, we will count all docs for now or assume docs belong to all. 
    # Wait, documents didn't save user_id. Let's just return total docs.
    
    total_conversations = db["conversations"].count_documents({"user_id": user_email})
    
    # Active documents (status="Ready")
    active_docs = db["documents"].count_documents({"status": "Ready"})
    
    # Total queries = sum of messages where role=user
    pipeline = [
        {"$match": {"user_id": user_email}},
        {"$unwind": "$messages"},
        {"$match": {"messages.role": "user"}},
        {"$count": "total_queries"}
    ]
    queries_result = list(db["conversations"].aggregate(pipeline))
    total_queries = queries_result[0]["total_queries"] if queries_result else 0

    # Recent activity
    recent_convs = list(db["conversations"].find(
        {"user_id": user_email}, 
        {"_id": 0, "title": 1, "updated_at": 1, "id": 1}
    ).sort("updated_at", -1).limit(5))
    
    recent_activity = []
    for c in recent_convs:
        recent_activity.append({
            "id": c["id"],
            "type": "chat",
            "title": c.get("title", "Chat"),
            "timestamp": c.get("updated_at")
        })

    return {
        "stats": {
            "total_documents": total_docs,
            "active_documents": active_docs,
            "total_conversations": total_conversations,
            "total_queries": total_queries
        },
        "recent_activity": recent_activity
    }
