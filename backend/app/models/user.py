from datetime import datetime, timezone
from typing import Optional

ALLOWED_ROLES = {"Admin", "Manager", "Employee"}
DEFAULT_ROLE = "Employee"


def get_user_role(user: dict) -> str:
    """
    Backward-compatible helper to safely resolve user role with default fallback.
    Ensures existing users without a role field default to 'Employee'.
    """
    if not isinstance(user, dict):
        return DEFAULT_ROLE
    role = user.get("role")
    if role and role in ALLOWED_ROLES:
        return str(role)
    return DEFAULT_ROLE


def create_user_document(
    name: str,
    email: str,
    password_hash: str,
    role: str = DEFAULT_ROLE
) -> dict:
    """
    Constructs a user document dictionary for storage in MongoDB.
    """
    valid_role = role if role in ALLOWED_ROLES else DEFAULT_ROLE
    now = datetime.now(timezone.utc)
    return {
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "role": valid_role,
        "created_at": now,
        "updated_at": now
    }
