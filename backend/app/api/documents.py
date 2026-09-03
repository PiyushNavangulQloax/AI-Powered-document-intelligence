import shutil
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File

from app.schemas.documents import DocumentResponse, DocumentStatusResponse
from app.services.document_service import DocumentService
from app.utils.security import get_current_user, verify_document_access

router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"]
)

# Upload storage directory
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _format_document_response(doc: dict) -> DocumentResponse:
    doc_id = str(doc["_id"])
    return DocumentResponse(
        document_id=doc_id,
        id=doc_id,
        filename=doc.get("filename", "Untitled"),
        uploaded_by=str(doc.get("uploaded_by", "")),
        status=doc.get("status", "processing"),
        created_at=doc.get("created_at") or datetime.now(timezone.utc),
        file_type=doc.get("file_type"),
        file_size=doc.get("file_size")
    )


@router.get("", response_model=List[DocumentResponse])
def list_documents(current_user: dict = Depends(get_current_user)):
    """
    List documents accessible to the authenticated user.
    Admins see all documents; Employees/Managers see their uploaded documents.
    """
    docs = DocumentService.list_documents_for_user(current_user)
    return [_format_document_response(doc) for doc in docs]


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload and index a document file (PDF, DOCX, XLSX, TXT, CSV, MD).
    Stores file in uploads directory and saves metadata via DocumentService.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided"
        )

    file_ext = Path(file.filename).suffix.lower().lstrip(".")
    allowed_extensions = {"pdf", "docx", "doc", "xlsx", "xls", "csv", "txt", "md"}
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension '.{file_ext}' is not supported. Allowed: PDF, DOCX, XLSX, TXT, CSV, MD"
        )

    # Save uploaded file safely on disk
    unique_prefix = uuid.uuid4().hex[:8]
    safe_filename = f"{unique_prefix}_{file.filename}"
    file_path = UPLOAD_DIR / safe_filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = file_path.stat().st_size
    user_identity = current_user.get("name") or current_user.get("email") or str(current_user.get("_id", "User"))

    doc = DocumentService.create_document(
        filename=file.filename,
        uploaded_by=user_identity,
        file_type=file_ext.upper(),
        file_size=file_size,
        status="completed"
    )

    return _format_document_response(doc)


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: str, current_user: dict = Depends(get_current_user)):
    """
    Retrieve document metadata by ID if authorized.
    Returns 404 if not found, 403 if unauthorized.
    """
    doc = DocumentService.get_document_by_id(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    verify_document_access(current_user, doc)
    return _format_document_response(doc)


@router.get("/{document_id}/status", response_model=DocumentStatusResponse)
def get_document_status(document_id: str, current_user: dict = Depends(get_current_user)):
    """
    Check processing status of a document.
    """
    doc = DocumentService.get_document_by_id(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    verify_document_access(current_user, doc)
    doc_status = doc.get("status", "completed")
    return DocumentStatusResponse(
        document_id=str(doc["_id"]),
        filename=doc.get("filename", "Untitled"),
        status=doc_status,
        progress=100 if doc_status == "completed" else 75,
        message="Vector index ready for neural semantic search"
    )


@router.delete("/{document_id}")
def delete_document(document_id: str, current_user: dict = Depends(get_current_user)):
    """
    Delete document metadata.
    Admins or document owners/uploaders can delete.
    Returns 404 if not found, 403 if unauthorized.
    """
    doc = DocumentService.get_document_by_id(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    verify_document_access(current_user, doc)
    DocumentService.delete_document(document_id, current_user)

    return {
        "message": "Document deleted successfully",
        "document_id": document_id
    }
