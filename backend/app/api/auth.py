from fastapi import APIRouter, Depends, HTTPException, status

from app.models.user import get_user_role
from app.schemas.auth import RegisterRequest, LoginRequest, UserResponse
from app.services.user_service import UserService
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest):
    # Check whether the email is already registered
    existing_user = UserService.find_by_email(request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash the password securely
    password_hash = hash_password(request.password)

    # Create the user document using UserService
    user_document = UserService.create_user(
        name=request.name,
        email=request.email,
        password_hash=password_hash,
        role="Employee"
    )

    # Return safe user information with role and without password_hash
    return UserResponse(
        id=str(user_document["_id"]),
        name=user_document["name"],
        email=user_document["email"],
        role=user_document.get("role", "Employee")
    )


@router.post("/login")
def login(request: LoginRequest):
    # Find user by email
    user = UserService.find_by_email(request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify submitted password
    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Create JWT access token
    token_payload = {
        "sub": str(user["_id"]),
        "email": user["email"]
    }
    access_token = create_access_token(data=token_payload)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user.get("name", "User"),
            "email": user.get("email"),
            "role": get_user_role(user)
        }
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user["_id"]),
        name=current_user["name"],
        email=current_user["email"],
        role=get_user_role(current_user)
    )
