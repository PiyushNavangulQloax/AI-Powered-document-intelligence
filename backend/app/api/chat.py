from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.services.rag_service import rag_service
from app.api.auth import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])

class ChatRequest(BaseModel):
    query: str
    document_id: Optional[str] = None

class Source(BaseModel):
    document_id: str
    chunk_id: str
    title: Optional[str] = None
    page: Optional[int] = None
    score: float

class ChatResponse(BaseModel):
    answer: str
    sources: List[Source]
    evidence: str

@router.post("/chat", response_model=ChatResponse)
def chat_with_document(request: ChatRequest):
    try:
        response = rag_service.generate_answer(
            query=request.query,
            document_id=request.document_id
        )
        return ChatResponse(**response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat/stream")
async def chat_with_document_stream(request: ChatRequest):
    # To implement SSE streaming natively with Hugging Face transformers,
    # you'll need to use `TextIteratorStreamer` inside a separate thread 
    # and yield the output tokens asynchronously.
    # We are returning 501 for now to indicate it needs the threaded implementation.
    raise HTTPException(
        status_code=501, 
        detail="Streaming response is not yet implemented for the Qwen endpoint."
    )
