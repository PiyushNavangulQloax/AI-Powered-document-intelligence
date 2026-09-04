from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.services.search_service import search_service

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    document_id: Optional[str] = None
    top_k: Optional[int] = 3

class SearchResponse(BaseModel):
    results: List[Dict[str, Any]]

@router.post("/search", response_model=SearchResponse)
def search_documents(request: SearchRequest):
    try:
        results = search_service.vector_search(
            query=request.query,
            document_id=request.document_id,
            top_k=request.top_k
        )
        return SearchResponse(results=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
