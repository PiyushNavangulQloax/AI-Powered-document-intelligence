import os
import io
import uuid
from datetime import datetime
from pypdf import PdfReader
from docx import Document as DocxDocument
from app.database.mongodb import get_db
from app.services.embedding_service import embedding_service

class DocumentService:
    def __init__(self):
        self.chunks_collection_name = os.getenv("MONGODB_COLLECTION", "document_chunks")
        self.docs_collection_name = "documents"

    def _extract_pdf(self, file_bytes: bytes):
        """Extract text page by page from PDF"""
        reader = PdfReader(io.BytesIO(file_bytes))
        pages_content = []
        for page_idx, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            if text.strip():
                pages_content.append({"page": page_idx + 1, "text": text.strip()})
        return pages_content, len(reader.pages)

    def _extract_docx(self, file_bytes: bytes):
        """Extract text paragraph by paragraph from DOCX"""
        doc = DocxDocument(io.BytesIO(file_bytes))
        paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        pages_content = []
        
        current_title = "Document Content"
        current_block = []
        
        for p in paragraphs:
            # Detect section heading
            if len(p) < 80 and (p[0].isdigit() or p.isupper() or p.endswith(":")):
                if current_block:
                    pages_content.append({
                        "page": 1,
                        "title": current_title,
                        "text": "\n".join(current_block)
                    })
                    current_block = []
                current_title = p
            else:
                current_block.append(p)
                
        if current_block:
            pages_content.append({
                "page": 1,
                "title": current_title,
                "text": "\n".join(current_block)
            })
            
        return pages_content, 1

    def _extract_txt(self, file_bytes: bytes):
        """Extract text from plain text/markdown files"""
        text = file_bytes.decode('utf-8', errors='ignore')
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        pages_content = []
        for p in paragraphs:
            pages_content.append({"page": 1, "text": p})
        return pages_content, 1

    def _chunk_text(self, document_id: str, pages_content: list, max_chars: int = 700):
        """Chunk extracted text into reasonable sizes while preserving page and title metadata"""
        chunks = []
        chunk_idx = 1
        
        for item in pages_content:
            page_num = item.get("page", 1)
            title = item.get("title", f"Page {page_num}")
            text = item.get("text", "")
            
            # Split if section is too long
            if len(text) <= max_chars:
                chunks.append({
                    "document_id": document_id,
                    "chunk_id": f"{document_id}_{chunk_idx:03d}",
                    "title": title,
                    "text": text,
                    "page": page_num,
                    "chunk_index": chunk_idx
                })
                chunk_idx += 1
            else:
                # Split by sentences or paragraphs
                lines = text.split("\n")
                current_chunk = []
                current_len = 0
                
                for line in lines:
                    if current_len + len(line) > max_chars and current_chunk:
                        chunks.append({
                            "document_id": document_id,
                            "chunk_id": f"{document_id}_{chunk_idx:03d}",
                            "title": title,
                            "text": " ".join(current_chunk),
                            "page": page_num,
                            "chunk_index": chunk_idx
                        })
                        chunk_idx += 1
                        current_chunk = []
                        current_len = 0
                    current_chunk.append(line)
                    current_len += len(line)
                    
                if current_chunk:
                    chunks.append({
                        "document_id": document_id,
                        "chunk_id": f"{document_id}_{chunk_idx:03d}",
                        "title": title,
                        "text": " ".join(current_chunk),
                        "page": page_num,
                        "chunk_index": chunk_idx
                    })
                    chunk_idx += 1
                    
        return chunks

    def process_and_store_document(self, file_bytes: bytes, filename: str):
        db = get_db()
        chunks_col = db[self.chunks_collection_name]
        docs_col = db[self.docs_collection_name]
        
        ext = filename.split(".")[-1].lower()
        doc_type = ext.upper()
        
        document_id = f"doc_{uuid.uuid4().hex[:8]}"
        
        # 1. Text extraction
        if ext == "pdf":
            pages_content, total_pages = self._extract_pdf(file_bytes)
        elif ext in ["docx", "doc"]:
            pages_content, total_pages = self._extract_docx(file_bytes)
        else:
            pages_content, total_pages = self._extract_txt(file_bytes)
            
        if not pages_content:
            raise ValueError(f"No extractable text found in {filename}")
            
        # 2. Chunking
        chunks = self._chunk_text(document_id, pages_content)
        
        # 3. Embedding generation using BGE-small-en-v1.5
        chunk_texts = [f"{c['title']}\n{c['text']}" for c in chunks]
        embeddings = [embedding_service.generate_embedding(t) for t in chunk_texts]
        
        # 4. Prepare documents to insert into MongoDB
        documents_to_insert = []
        for chunk, emb in zip(chunks, embeddings):
            chunk_doc = chunk.copy()
            chunk_doc["embedding"] = emb
            documents_to_insert.append(chunk_doc)
            
        if documents_to_insert:
            chunks_col.insert_many(documents_to_insert)
            
        # 5. Format file size
        size_kb = len(file_bytes) / 1024
        size_str = f"{size_kb / 1024:.1f} MB" if size_kb > 1024 else f"{size_kb:.0f} KB"
        
        # 6. Save document metadata
        doc_metadata = {
            "document_id": document_id,
            "name": filename,
            "type": doc_type,
            "size": size_str,
            "pages": total_pages,
            "chunks": len(chunks),
            "status": "Ready",
            "uploaded_at": datetime.now().strftime("%b %d, %Y %I:%M %p")
        }
        docs_col.insert_one(doc_metadata)
        
        # Return clean dictionary
        doc_metadata.pop("_id", None)
        return doc_metadata

    def list_documents(self):
        db = get_db()
        docs_col = db[self.docs_collection_name]
        docs = list(docs_col.find({}, {"_id": 0}).sort("uploaded_at", -1))
        return docs

    def get_document_chunks(self, document_id: str):
        db = get_db()
        chunks_col = db[self.chunks_collection_name]
        # Return chunks with sample of embedding
        chunks = list(chunks_col.find({"document_id": document_id}, {"_id": 0}))
        for c in chunks:
            if "embedding" in c and isinstance(c["embedding"], list):
                # Only return first 5 dimensions for quick inspection
                c["embedding_sample"] = c["embedding"][:5]
                del c["embedding"]
        return chunks

    def delete_document(self, document_id: str):
        db = get_db()
        db[self.chunks_collection_name].delete_many({"document_id": document_id})
        res = db[self.docs_collection_name].delete_one({"document_id": document_id})
        return res.deleted_count > 0

document_service = DocumentService()
