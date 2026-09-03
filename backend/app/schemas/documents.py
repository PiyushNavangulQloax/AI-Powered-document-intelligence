from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DocumentResponse(BaseModel):
    document_id: str
    id: Optional[str] = None
    filename: str
    uploaded_by: str
    status: str
    created_at: datetime
    file_type: Optional[str] = None
    file_size: Optional[int] = None


class DocumentStatusResponse(BaseModel):
    document_id: str
    filename: str
    status: str
    progress: int = 100
    message: Optional[str] = None
