import hashlib
import math
import re
from typing import Dict, List


class EmbeddingService:
    """
    Deterministic high-dimensional vector embedding generator.
    Produces repeatable normalized vectors using MD5 hashing and term frequency weighting.
    """
    DIMENSION = 256

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        cleaned = re.sub(r"[^\w\s]", " ", text.lower())
        stop_words = {"the", "and", "for", "with", "that", "this", "from", "are", "was", "were", "been"}
        return [t for t in cleaned.split() if len(t) > 2 and t not in stop_words]

    @classmethod
    def _hash_token(cls, token: str) -> int:
        return int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16)

    @classmethod
    def get_embedding(cls, text: str) -> List[float]:
        tokens = cls._tokenize(text)
        if not tokens:
            return [0.0] * cls.DIMENSION

        vector = [0.0] * cls.DIMENSION
        token_counts: Dict[str, int] = {}
        for token in tokens:
            token_counts[token] = token_counts.get(token, 0) + 1

        for token, count in token_counts.items():
            h = cls._hash_token(token)
            idx = h % cls.DIMENSION
            weight = 1.0 + math.log(count)
            vector[idx] += weight

        # L2 normalize
        mag = math.sqrt(sum(v * v for v in vector))
        if mag > 0:
            return [round(v / mag, 5) for v in vector]
        return vector

    @staticmethod
    def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.0
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        return max(0.0, min(1.0, dot_product))
