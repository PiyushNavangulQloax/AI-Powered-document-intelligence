from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict, Any
from app.services.document_service import document_service

router = APIRouter()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")
            
        doc_metadata = document_service.process_and_store_document(contents, file.filename)
        return {
            "message": "Document successfully indexed into Vector Store",
            "document": doc_metadata
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def list_documents():
    try:
        docs = document_service.list_documents()
        return {"documents": docs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{document_id}/chunks")
async def get_document_chunks(document_id: str):
    try:
        chunks = document_service.get_document_chunks(document_id)
        return {"document_id": document_id, "chunks": chunks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{document_id}")
async def delete_document(document_id: str):
    try:
        success = document_service.delete_document(document_id)
        if not success:
            raise HTTPException(status_code=404, detail="Document not found")
        return {"message": "Document deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
