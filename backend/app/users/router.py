from fastapi import APIRouter, Depends
from app.schemas.auth import UserResponse
from app.utils.security import get_current_user
from app.models.user import get_user_role

router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


@router.get("/me", response_model=UserResponse)
def get_user_profile(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user["_id"]),
        name=current_user["name"],
        email=current_user["email"],
        role=get_user_role(current_user)
    )
