import json
import time
import uuid
from typing import AsyncGenerator, Dict, List, Optional

from app.services.search_service import SearchService
from app.services.llm_service import LLMService


class RAGService:
    @classmethod
    def answer_question(
        cls,
        question: str,
        document_id: Optional[str] = None,
        history: Optional[List[Dict]] = None,
        current_user: Optional[Dict] = None
    ) -> Dict:
        """
        Executes complete RAG pipeline:
        1. Retrieval: Semantic search across authorized documents.
        2. Context Construction & Evaluation.
        3. Grounded Generation with Citations.
        """
        doc_ids = [document_id] if document_id else None

        # Retrieve relevant chunks using threshold of 0.25
        retrieved_chunks = SearchService.search(
            query=question,
            threshold=0.25,
            limit=5,
            document_ids=doc_ids,
            current_user=current_user
        )

        result = LLMService.generate_grounded_answer(question, retrieved_chunks)
        result["id"] = str(uuid.uuid4())
        return result

    @classmethod
    def stream_answer(
        cls,
        question: str,
        document_id: Optional[str] = None,
        current_user: Optional[Dict] = None
    ):
        """
        Generator producing SSE stream tokens and final citations.
        """
        response_data = cls.answer_question(
            question=question,
            document_id=document_id,
            current_user=current_user
        )
        answer_text = response_data["answer"]
        citations = response_data["citations"]

        # Stream words with micro-delays
        words = answer_text.split(" ")
        for i, word in enumerate(words):
            chunk_payload = {
                "type": "token",
                "content": word + (" " if i < len(words) - 1 else "")
            }
            yield f"data: {json.dumps(chunk_payload)}\n\n"
            time.sleep(0.02)

        # Emit completion with citations
        final_payload = {
            "type": "done",
            "id": response_data["id"],
            "citations": citations,
            "grounded": response_data["grounded"],
            "has_insufficient_evidence": response_data["has_insufficient_evidence"]
        }
        yield f"data: {json.dumps(final_payload)}\n\n"
