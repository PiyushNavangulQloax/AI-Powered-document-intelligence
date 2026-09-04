import os
from app.services.embedding_service import embedding_service
from app.database.mongodb import get_db

class SearchService:
    def __init__(self):
        self.collection_name = os.getenv("MONGODB_COLLECTION", "document_chunks")
        self.index_name = "vector_index"

    def vector_search(self, query: str, document_id: str = None, top_k: int = 3) -> list[dict]:
        db = get_db()
        collection = db[self.collection_name]
        
        query_embedding = embedding_service.generate_embedding(query)
        
        # Primary attempt: Native Atlas filter inside $vectorSearch
        try:
            vector_search_stage = {
                "$vectorSearch": {
                    "index": self.index_name,
                    "path": "embedding",
                    "queryVector": query_embedding,
                    "numCandidates": 50,
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
            return list(collection.aggregate(pipeline))

        except Exception as e:
            # Fallback if the filter field is still BUILDING in Atlas
            if "needs to be indexed as filter" in str(e) and document_id:
                fallback_pipeline = [
                    {
                        "$vectorSearch": {
                            "index": self.index_name,
                            "path": "embedding",
                            "queryVector": query_embedding,
                            "numCandidates": 100,
                            "limit": 50
                        }
                    },
                    {
                        "$match": {
                            "document_id": document_id
                        }
                    },
                    {
                        "$limit": top_k
                    },
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
                return list(collection.aggregate(fallback_pipeline))
            raise e

search_service = SearchService()
