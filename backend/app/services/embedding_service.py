from sentence_transformers import SentenceTransformer
import torch

class EmbeddingService:
    def __init__(self):
        self.model = None

    def _load_model(self):
        if self.model is not None:
            return
        device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = SentenceTransformer("BAAI/bge-small-en-v1.5", device=device)

    def generate_embedding(self, text: str) -> list[float]:
        self._load_model()
        embedding = self.model.encode(text, normalize_embeddings=True)
        return embedding.tolist()

embedding_service = EmbeddingService()
