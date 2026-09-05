from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
from app.api.auth import get_current_user
from app.database.mongodb import get_db
from app.services.rag_service import rag_service

router = APIRouter(dependencies=[Depends(get_current_user)])

class ChatMessage(BaseModel):
    role: str
    content: str
    sources: Optional[List[Dict[str, Any]]] = None
    evidence: Optional[str] = None

class ConversationCreate(BaseModel):
    title: str = "New Chat"
    document_id: Optional[str] = None

class ChatQuery(BaseModel):
    query: str
    document_id: Optional[str] = None

@router.get("/")
def list_conversations(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_email = current_user["email"]
    convs = list(db["conversations"].find(
        {"user_id": user_email}, 
        {"messages": 0, "_id": 0}
    ).sort("updated_at", -1))
    return {"conversations": convs}

@router.post("/")
def create_conversation(req: ConversationCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    conv_id = f"conv_{uuid.uuid4().hex[:8]}"
    conv = {
        "id": conv_id,
        "user_id": current_user["email"],
        "title": req.title,
        "document_id": req.document_id,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "messages": []
    }
    db["conversations"].insert_one(conv)
    conv.pop("_id", None)
    return conv

@router.get("/{conv_id}")
def get_conversation(conv_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    conv = db["conversations"].find_one({"id": conv_id, "user_id": current_user["email"]}, {"_id": 0})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv

@router.delete("/{conv_id}")
def delete_conversation(conv_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    result = db["conversations"].delete_one({"id": conv_id, "user_id": current_user["email"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"message": "Conversation deleted"}

@router.post("/{conv_id}/chat")
def chat_in_conversation(conv_id: str, req: ChatQuery, current_user: dict = Depends(get_current_user)):
    db = get_db()
    conv = db["conversations"].find_one({"id": conv_id, "user_id": current_user["email"]})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Update title on first message
    new_title = conv["title"]
    if len(conv["messages"]) == 0 and req.query:
        # Generate a short title from the first query
        new_title = (req.query[:25] + '...') if len(req.query) > 25 else req.query
        db["conversations"].update_one(
            {"id": conv_id},
            {"$set": {"title": new_title}}
        )

    # 1. Append user message
    user_msg = {
        "role": "user",
        "content": req.query,
        "timestamp": datetime.utcnow().isoformat()
    }
    db["conversations"].update_one(
        {"id": conv_id},
        {"$push": {"messages": user_msg}}
    )

    # 2. Call RAG
    try:
        response = rag_service.generate_answer(
            query=req.query,
            document_id=req.document_id
        )
        
        # 3. Append AI message
        ai_msg = {
            "role": "assistant",
            "content": response["answer"],
            "sources": response["sources"],
            "evidence": response.get("evidence", "YES"),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        db["conversations"].update_one(
            {"id": conv_id},
            {
                "$push": {"messages": ai_msg},
                "$set": {"updated_at": datetime.utcnow().isoformat()}
            }
        )

        return {
            "answer": response["answer"],
            "sources": response["sources"],
            "evidence": response.get("evidence", "YES"),
            "title": new_title
        }
    except Exception as e:
        # We should still allow frontend to see error
        raise HTTPException(status_code=500, detail=str(e))
