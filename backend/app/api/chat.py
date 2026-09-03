from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from typing import Optional

from app.schemas.chat import ChatMessageRequest, ChatMessageResponse, ChatCitation
from app.services.rag_service import RAGService
from app.services.user_service import UserService
from app.utils.security import get_current_user, decode_access_token

router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("", response_model=ChatMessageResponse)
def chat_with_documents(
    chat_req: ChatMessageRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    RAG-based question answering grounded in indexed documents with source citations.
    """
    try:
        result = RAGService.answer_question(
            question=chat_req.message,
            document_id=chat_req.document_id,
            history=chat_req.history,
            current_user=current_user
        )

        citations = [
            ChatCitation(
                document_id=c["document_id"],
                document_name=c["document_name"],
                page=c["page"],
                score=c["score"],
                snippet=c.get("snippet")
            )
            for c in result.get("citations", [])
        ]

        return ChatMessageResponse(
            id=result["id"],
            answer=result["answer"],
            citations=citations,
            grounded=result.get("grounded", True),
            has_insufficient_evidence=result.get("has_insufficient_evidence", False)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat generation failed: {str(e)}"
        )


@router.get("/stream")
def stream_chat_response(
    message: str = Query(..., min_length=1),
    document_id: Optional[str] = Query(default=None),
    token: str = Query(...)
):
    """
    Server-Sent Events (SSE) streaming endpoint for AI answers.
    """
    # Authenticate via query param token for SSE EventSource compatibility
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired stream token"
        )

    user_email = payload.get("email")
    user_id = payload.get("sub")
    user = None
    if user_email:
        user = UserService.find_by_email(user_email)
    if not user and user_id:
        user = UserService.find_by_id(user_id) or UserService.find_by_email(user_id)

    if not user:
        # Fallback guest user context if token verified
        user = {"_id": user_id or "user-stream", "email": user_email or "user@qloax.com", "role": "Employee"}

    return StreamingResponse(
        RAGService.stream_answer(
            question=message,
            document_id=document_id,
            current_user=user
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
