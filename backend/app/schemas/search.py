from typing import List, Optional
from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Semantic search query string")
    threshold: Optional[float] = Field(default=0.7, ge=0.0, le=1.0, description="Minimum similarity threshold (0.0 - 1.0)")
    limit: Optional[int] = Field(default=10, ge=1, le=50, description="Maximum number of chunks to return")
    document_ids: Optional[List[str]] = Field(default=None, description="Optional list of document IDs to filter search")


class SearchResultItem(BaseModel):
    id: str
    document_id: str
    document_name: str
    page: int
    score: float
    score_percentage: str
    snippet: str
    category: str


class SearchResponse(BaseModel):
    query: str
    total_results: int
    threshold: float
    results: List[SearchResultItem]
