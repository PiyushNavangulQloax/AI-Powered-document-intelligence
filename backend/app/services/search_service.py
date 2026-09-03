import uuid
from typing import Any, Dict, List, Optional

from app.services.embedding_service import EmbeddingService
from app.services.document_service import DocumentService
from app.utils.security import can_access_document, get_user_role

# Seed knowledge base chunks with rich realistic text for RAG and semantic search
DEFAULT_CHUNKS = [
    {
        "id": "chunk-101-1",
        "document_id": "doc-101",
        "document_name": "Q3_Financial_Analysis.pdf",
        "page": 4,
        "category": "Financial",
        "content": (
            "Consolidated Net Revenue reached $48.2 million for the quarter ending September 30, "
            "reflecting an 18.4% year-over-year expansion. Enterprise SaaS ARR added $8.4M in recurring bookings, "
            "driven by accelerated enterprise adoption of the Cloud Intelligence platform tier."
        )
    },
    {
        "id": "chunk-101-2",
        "document_id": "doc-101",
        "document_name": "Q3_Financial_Analysis.pdf",
        "page": 12,
        "category": "Financial",
        "content": (
            "Operating Margin expanded by 240 basis points to 31.8%. Net income totaled $14.1 million, "
            "compared to $11.5 million in Q2. Free cash flow surged to $19.3M, representing a 40% margin."
        )
    },
    {
        "id": "chunk-101-3",
        "document_id": "doc-101",
        "document_name": "Q3_Financial_Analysis.pdf",
        "page": 15,
        "category": "Financial Risk",
        "content": (
            "Operational Risk Factors: Increased GPU compute and AI model inference infrastructure costs "
            "offset SaaS gross margins by 2.1%. Management has hedged compute contracts for the next 4 quarters."
        )
    },
    {
        "id": "chunk-102-1",
        "document_id": "doc-102",
        "document_name": "Vendor_Contract_v4.docx",
        "page": 8,
        "category": "Legal",
        "content": (
            "Section 8.2 Indemnification & Limitation of Liability: In no event shall either party's aggregate liability "
            "arising out of or related to this Master Services Agreement exceed the total fees paid or payable by Customer "
            "in the 12 months preceding the claim, capped at $250,000 USD."
        )
    },
    {
        "id": "chunk-102-2",
        "document_id": "doc-102",
        "document_name": "Vendor_Contract_v4.docx",
        "page": 11,
        "category": "Compliance",
        "content": (
            "Section 11.4 Data Privacy Breach Notification: In the event of a confirmed security incident affecting Customer "
            "Data, Vendor agrees to deliver formal written disclosure within 24 hours of incident confirmation, with complete "
            "forensic logs provided within 72 hours."
        )
    },
    {
        "id": "chunk-102-3",
        "document_id": "doc-102",
        "document_name": "Vendor_Contract_v4.docx",
        "page": 14,
        "category": "Legal",
        "content": (
            "Section 14.1 Agreement Term and Termination: This agreement shall renew automatically for successive 1-year terms "
            "unless either party provides 60-day written notice of non-renewal prior to the expiration of the current billing cycle."
        )
    },
    {
        "id": "chunk-103-1",
        "document_id": "doc-103",
        "document_name": "Architecture_Design_Doc.pdf",
        "page": 14,
        "category": "Architecture",
        "content": (
            "System Architecture Overview: The DocMind platform is built on an asynchronous FastAPI backend microservices framework "
            "paired with a React SPA frontend. Document ingestion pipelines handle extraction, cleaning, and tokenization asynchronously."
        )
    },
    {
        "id": "chunk-103-2",
        "document_id": "doc-103",
        "document_name": "Architecture_Design_Doc.pdf",
        "page": 22,
        "category": "Architecture",
        "content": (
            "Vector Database & Indexing: Semantic vector embeddings are generated and stored in a high-throughput HNSW index cluster. "
            "The system targets sub-15ms query latency for cosine nearest-neighbor searches across 1M+ chunk embeddings."
        )
    },
    {
        "id": "chunk-104-1",
        "document_id": "doc-104",
        "document_name": "Employee_Handbook_2026.docx",
        "page": 14,
        "category": "HR Policy",
        "content": (
            "Annual Leave and Time Off: All full-time employees are entitled to 18 days of paid annual vacation leave per calendar year, "
            "accrued monthly. Up to 5 unused leave days may be carried over to the following fiscal year."
        )
    },
    {
        "id": "chunk-104-2",
        "document_id": "doc-104",
        "document_name": "Employee_Handbook_2026.docx",
        "page": 18,
        "category": "HR Policy",
        "content": (
            "Parental and Family Leave: New parents are entitled to 16 weeks of fully paid parental leave following childbirth, "
            "adoption, or foster placement. Flexible return-to-work scheduling is supported upon manager approval."
        )
    },
    {
        "id": "chunk-104-3",
        "document_id": "doc-104",
        "document_name": "Employee_Handbook_2026.docx",
        "page": 26,
        "category": "Benefits",
        "content": (
            "Remote Work and Wellness Stipend: Employees receive an annual $1,200 home-office ergonomic setup allowance and a monthly "
            "$100 health and wellness reimbursement for gym memberships, counseling, or fitness equipment."
        )
    }
]

# In-memory vector store for active chunks with pre-computed vectors
_INDEXED_CHUNKS: List[Dict] = []


def _initialize_index(force: bool = False):
    global _INDEXED_CHUNKS
    if not _INDEXED_CHUNKS or force:
        _INDEXED_CHUNKS = []
        for chunk in DEFAULT_CHUNKS:
            chunk_copy: Dict[str, Any] = dict(chunk)
            chunk_copy["vector"] = EmbeddingService.get_embedding(str(chunk["content"]))
            _INDEXED_CHUNKS.append(chunk_copy)


_initialize_index(force=True)


class SearchService:
    @classmethod
    def index_document_chunks(cls, document_id: str, document_name: str, chunks_text: List[str], category: str = "General"):
        """
        Indexes chunks for a newly uploaded document.
        """
        global _INDEXED_CHUNKS
        for idx, text in enumerate(chunks_text):
            chunk_id = f"chunk-{document_id}-{idx + 1}"
            vector = EmbeddingService.get_embedding(text)
            _INDEXED_CHUNKS.append({
                "id": chunk_id,
                "document_id": document_id,
                "document_name": document_name,
                "page": idx + 1,
                "category": category,
                "content": text,
                "vector": vector
            })

    @classmethod
    def search(
        cls,
        query: str,
        threshold: float = 0.5,
        limit: int = 10,
        document_ids: Optional[List[str]] = None,
        current_user: Optional[Dict] = None
    ) -> List[Dict]:
        """
        Executes semantic vector search across chunks authorized for the current user.
        """
        _initialize_index()
        query_vector = EmbeddingService.get_embedding(query)
        user_role = get_user_role(current_user) if current_user else None

        results = []
        for chunk in _INDEXED_CHUNKS:
            # Check document ID filter
            if document_ids and chunk["document_id"] not in document_ids:
                continue

            # Check document permissions (Admin has access to all documents)
            if current_user and user_role != "Admin":
                doc = DocumentService.get_document_by_id(chunk["document_id"])
                if doc and not can_access_document(current_user, doc):
                    continue

            # Compute cosine similarity
            vec_sim = EmbeddingService.cosine_similarity(query_vector, chunk["vector"])

            # Compute keyword overlap ratio across content, document name, and category
            query_tokens = EmbeddingService._tokenize(query)
            searchable_text = f"{chunk['document_name']} {chunk.get('category', '')} {chunk['content']}".lower()
            if query_tokens:
                matches = sum(1 for t in query_tokens if t in searchable_text)
                overlap_ratio = matches / len(query_tokens)
            else:
                overlap_ratio = 0.0

            # Hybrid score: combines semantic vector similarity with lexical matching
            sim = (vec_sim * 0.45) + (overlap_ratio * 0.55)

            # High-confidence booster for domain / keyword matches
            if overlap_ratio >= 0.20:
                sim = max(sim, min(0.985, 0.70 + (overlap_ratio * 0.28)))

            if sim >= threshold:
                score_pct = f"{round(sim * 100, 1)}%"
                results.append({
                    "id": chunk["id"],
                    "document_id": chunk["document_id"],
                    "document_name": chunk["document_name"],
                    "page": chunk["page"],
                    "score": round(sim, 4),
                    "score_percentage": score_pct,
                    "snippet": chunk["content"],
                    "category": chunk.get("category", "General")
                })

        # Sort descending by similarity score
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:limit]
