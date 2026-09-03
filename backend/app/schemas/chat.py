from typing import List, Optional
from pydantic import BaseModel, Field


class ChatCitation(BaseModel):
    document_id: str
    document_name: str
    page: int
    score: str
    snippet: Optional[str] = None


class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Question or prompt from user")
    document_id: Optional[str] = Field(default=None, description="Optional target document to narrow down Q&A")
    history: Optional[List[dict]] = Field(default=[], description="Prior conversation messages")


class ChatMessageResponse(BaseModel):
    id: str
    answer: str
    citations: List[ChatCitation] = []
    grounded: bool = True
    has_insufficient_evidence: bool = False
