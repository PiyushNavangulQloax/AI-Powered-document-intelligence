from app.services.search_service import search_service
from app.services.llm_service import llm_service

class RAGService:
    
    def check_evidence(self, query: str, context: str) -> str:
        prompt = f"""
You are an evidence verification system for a document intelligence platform.

Determine whether the provided document context contains enough
information to directly answer the user's question.

Rules:
- Answer YES only if the context contains information that directly
  answers the question.
- Answer NO if the context is only generally related.
- Do not use outside knowledge.
- Do not infer missing information.
- Return ONLY one word: YES or NO.

DOCUMENT CONTEXT:
{context}

USER QUESTION:
{query}

DECISION:
"""
        decision = llm_service.generate_text(
            prompt, 
            max_new_tokens=5, 
            temperature=0.1, 
            do_sample=False
        )
        return decision.upper().strip()

    def generate_answer(self, query: str, document_id: str = None, top_k: int = 10) -> dict:
        # 1. Search MongoDB for relevant chunks
        results = search_service.vector_search(query, document_id=document_id, top_k=top_k)

        # 2. Build document context
        context_parts = []
        for r in results:
            title = r.get('title', 'Unknown Section')
            text = r.get('text', '')
            context_parts.append(f"Section: {title}\nContent: {text}")

        context = "\n\n".join(context_parts)

        # 5. Build RAG prompt
        prompt = f"""
You are DocMind, an AI document intelligence assistant.

Answer the user's question using ONLY the information
provided in the document context.

Rules:
- Do not use outside knowledge.
- Do not invent information.
- Give a concise and accurate answer.
- If the context does not contain the answer, say:
  "I don't have enough information in the provided document."

DOCUMENT CONTEXT:
{context}

USER QUESTION:
{query}

ANSWER:
"""
        # 6. Generate final answer
        answer = llm_service.generate_text(
            prompt, 
            max_new_tokens=200, 
            temperature=0.2, 
            do_sample=False
        )
        
        # 7. Format sources
        sources = []
        for r in results:
            sources.append({
                "document_id": r.get("document_id"),
                "chunk_id": r.get("chunk_id"),
                "title": r.get("title"),
                "page": r.get("page"),
                "score": r.get("score")
            })

        return {
            "answer": answer,
            "sources": sources,
            "evidence": "YES"
        }

rag_service = RAGService()
