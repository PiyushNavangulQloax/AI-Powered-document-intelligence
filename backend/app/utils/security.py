import os
from datetime import datetime, timezone, timedelta
from typing import Optional, List

from bson import ObjectId
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from passlib.context import CryptContext

from app.database.connection import get_database
from app.models.user import get_user_role, ALLOWED_ROLES


# Load environment variables
load_dotenv()

# JWT configuration
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 30

if not JWT_SECRET:
    raise ValueError("JWT_SECRET is missing from .env")


# Password hashing configuration
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


# Authentication dependency
security_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db=Depends(get_database)
) -> dict:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    from app.services.user_service import UserService
    user = UserService.find_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


# Role-checking dependency factory
def require_role(*allowed_roles: str):
    """
    Reusable FastAPI dependency factory for enforcing roles.
    Example: Depends(require_role("Admin")) or Depends(require_role("Admin", "Manager"))
    """
    def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        user_role = get_user_role(current_user)
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted: insufficient role permissions"
            )
        return current_user

    return role_checker


# Authorization foundation for document access
def can_access_document(user: dict, document: dict) -> bool:
    """
    Evaluates whether a user can access a given document:
    - Admin: access all documents
    - Manager / Employee: access documents they uploaded / own
    - Demo documents: accessible to all authenticated users
    """
    if not user or not document:
        return False

    user_role = get_user_role(user)
    if user_role == "Admin":
        return True

    user_id = str(user.get("_id", user.get("id", "")))
    user_email = str(user.get("email", "")).lower()
    user_name = str(user.get("name", "")).lower()

    doc_owner = str(document.get("uploaded_by", "") or document.get("owner_id", "")).lower()

    if doc_owner and (doc_owner in (user_id.lower(), user_email, user_name)):
        return True

    # Pre-seeded demo documents are accessible to all authenticated users
    if str(document.get("_id")) in ("doc-101", "doc-102", "doc-103", "doc-104"):
        return True

    return False


def verify_document_access(user: dict, document: dict) -> None:
    """
    Raises HTTP 403 Forbidden if user cannot access the document.
    """
    if not can_access_document(user, document):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: you are not authorized to access this document"
        )
