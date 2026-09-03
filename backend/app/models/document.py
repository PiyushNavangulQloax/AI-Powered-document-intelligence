from datetime import datetime, timezone
from typing import Optional

DOCUMENT_STATUS_PROCESSING = "processing"
DOCUMENT_STATUS_COMPLETED = "completed"
DOCUMENT_STATUS_FAILED = "failed"

ALLOWED_DOCUMENT_STATUSES = {
    DOCUMENT_STATUS_PROCESSING,
    DOCUMENT_STATUS_COMPLETED,
    DOCUMENT_STATUS_FAILED
}


def create_document_metadata(
    filename: str,
    uploaded_by: str,
    file_type: Optional[str] = None,
    file_size: Optional[int] = None,
    status: str = DOCUMENT_STATUS_PROCESSING
) -> dict:
    """
    Constructs a document metadata dictionary for storage in MongoDB.
    """
    valid_status = status if status in ALLOWED_DOCUMENT_STATUSES else DOCUMENT_STATUS_PROCESSING
    now = datetime.now(timezone.utc)

    # Infer file_type from extension if not explicitly specified
    if not file_type and "." in filename:
        file_type = filename.split(".")[-1].lower()

    return {
        "filename": filename,
        "uploaded_by": uploaded_by,
        "file_type": file_type or "unknown",
        "file_size": file_size or 0,
        "status": valid_status,
        "created_at": now,
        "updated_at": now
    }
