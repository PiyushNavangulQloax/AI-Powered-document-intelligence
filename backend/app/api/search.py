from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional

from app.schemas.search import SearchRequest, SearchResponse, SearchResultItem
from app.services.search_service import SearchService
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/search", tags=["Search"])


@router.post("", response_model=SearchResponse)
def search_documents(
    search_req: SearchRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Performs semantic vector search across document chunks accessible to current user.
    """
    try:
        results_data = SearchService.search(
            query=search_req.query,
            threshold=search_req.threshold if search_req.threshold is not None else 0.5,
            limit=search_req.limit or 10,
            document_ids=search_req.document_ids,
            current_user=current_user
        )

        items = [
            SearchResultItem(
                id=r["id"],
                document_id=r["document_id"],
                document_name=r["document_name"],
                page=r["page"],
                score=r["score"],
                score_percentage=r["score_percentage"],
                snippet=r["snippet"],
                category=r["category"]
            )
            for r in results_data
        ]

        return SearchResponse(
            query=search_req.query,
            total_results=len(items),
            threshold=search_req.threshold or 0.5,
            results=items
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Semantic search failed: {str(e)}"
        )
