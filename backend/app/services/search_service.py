import os
import numpy as np
from app.services.embedding_service import embedding_service
from app.database.mongodb import get_db

class SearchService:
    def __init__(self):
        self.collection_name = os.getenv("MONGODB_COLLECTION", "document_chunks")
        self.docs_collection_name = "documents"
        self.index_name = "vector_index"

    def vector_search(self, query: str, document_id: str = None, top_k: int = 5) -> list[dict]:
        db = get_db()
        collection = db[self.collection_name]
        docs_collection = db[self.docs_collection_name]
        
        query_embedding = embedding_service.generate_embedding(query)
        results = []
        
        # Primary attempt: Native Atlas $vectorSearch
        try:
            vector_search_stage = {
                "$vectorSearch": {
                    "index": self.index_name,
                    "path": "embedding",
                    "queryVector": query_embedding,
                    "numCandidates": max(50, top_k * 10),
                    "limit": top_k
                }
            }
            if document_id:
                vector_search_stage["$vectorSearch"]["filter"] = {
                    "document_id": document_id
                }

            pipeline = [
                vector_search_stage,
                {
                    "$project": {
                        "_id": 0,
                        "document_id": 1,
                        "chunk_id": 1,
                        "title": 1,
                        "text": 1,
                        "page": 1,
                        "score": {"$meta": "vectorSearchScore"}
                    }
                }
            ]
            results = list(collection.aggregate(pipeline))

        except Exception as e:
            # Fallback: In-memory cosine similarity calculation across MongoDB chunks
            # Guarantees semantic search always functions even if Atlas index is building or not created
            print(f"Notice: Atlas $vectorSearch failed ({e}). Running in-memory cosine vector search fallback...")
            try:
                filter_criteria = {"document_id": document_id} if document_id else {}
                candidate_chunks = list(collection.find(filter_criteria, {
                    "_id": 0,
                    "document_id": 1,
                    "chunk_id": 1,
                    "title": 1,
                    "text": 1,
                    "page": 1,
                    "embedding": 1
                }).limit(300))

                if candidate_chunks:
                    q_vec = np.array(query_embedding, dtype=np.float32)
                    norm_q = np.linalg.norm(q_vec)

                    scored = []
                    for chunk in candidate_chunks:
                        emb = chunk.get("embedding")
                        score = 0.0
                        if emb and len(emb) == len(query_embedding):
                            c_vec = np.array(emb, dtype=np.float32)
                            norm_c = np.linalg.norm(c_vec)
                            if norm_q > 0 and norm_c > 0:
                                sim = float(np.dot(q_vec, c_vec) / (norm_q * norm_c))
                                score = max(0.0, min(1.0, (sim + 1.0) / 2.0 if sim < 0 else sim))

                        clean_chunk = {k: v for k, v in chunk.items() if k != "embedding"}
                        clean_chunk["score"] = round(score, 4)
                        scored.append(clean_chunk)

                    scored.sort(key=lambda x: x["score"], reverse=True)
                    results = scored[:top_k]
            except Exception as fallback_err:
                print(f"Fallback search error: {fallback_err}")
                results = []

        # Enrich results with human-readable Document Name and Category
        doc_ids = list({r.get("document_id") for r in results if r.get("document_id")})
        if doc_ids:
            try:
                docs = list(docs_collection.find({"document_id": {"$in": doc_ids}}, {"_id": 0, "document_id": 1, "name": 1, "type": 1}))
                doc_map = {d["document_id"]: d for d in docs}
                for r in results:
                    meta = doc_map.get(r.get("document_id"), {})
                    r["docName"] = meta.get("name", r.get("title", "Document"))
                    r["category"] = meta.get("type", "General")
            except Exception as meta_err:
                print(f"Error enriching document names: {meta_err}")

        # Ensure every result has standard fields
        for r in results:
            if "docName" not in r:
                r["docName"] = r.get("title", "Document")
            if "category" not in r:
                r["category"] = "General"
            if "snippet" not in r:
                r["snippet"] = r.get("text", "")

        return results

search_service = SearchService()
