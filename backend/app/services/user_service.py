import uuid
from typing import Optional
from bson import ObjectId

from app.database.connection import get_database
from app.models.user import create_user_document
from app.utils.security import hash_password

# Default demo users pre-seeded for DocMind platform
_FALLBACK_USERS = {
    "samarth@qloax.com": {
        "_id": "user-samarth-001",
        "name": "Samarth Chavan",
        "email": "samarth@qloax.com",
        "password_hash": hash_password("password123"),
        "role": "Admin"
    },
    "akash@qloax.com": {
        "_id": "user-akash-002",
        "name": "Akash Patel",
        "email": "akash@qloax.com",
        "password_hash": hash_password("password123"),
        "role": "Manager"
    },
    "piyush@qloax.com": {
        "_id": "user-piyush-003",
        "name": "Piyush Verma",
        "email": "piyush@qloax.com",
        "password_hash": hash_password("password123"),
        "role": "Employee"
    }
}


class UserService:
    @staticmethod
    def find_by_email(email: str) -> Optional[dict]:
        email_clean = email.strip().lower()
        if email_clean in _FALLBACK_USERS:
            return _FALLBACK_USERS[email_clean]
        try:
            db = get_database()
            user = db["users"].find_one({"email": email_clean})
            if user:
                return user
        except Exception:
            pass

        return None

    get_user_by_email = find_by_email

    @staticmethod
    def find_by_id(user_id: str) -> Optional[dict]:
        user_id_str = user_id
        for u in _FALLBACK_USERS.values():
            if str(u.get("_id")) == user_id_str:
                return u

        try:
            db = get_database()
            try:
                obj_id = ObjectId(user_id_str)
                user = db["users"].find_one({"_id": obj_id})
                if user:
                    return user
            except Exception:
                pass

            user = db["users"].find_one({"_id": user_id_str})
            if user:
                return user
        except Exception:
            pass

        return None

    get_user_by_id = find_by_id

    @staticmethod
    def create_user(name: str, email: str, password_hash: str, role: str = "Employee") -> dict:
        email_clean = email.strip().lower()
        user_doc = create_user_document(
            name=name,
            email=email_clean,
            password_hash=password_hash,
            role=role
        )

        try:
            db = get_database()
            result = db["users"].insert_one(user_doc)
            user_doc["_id"] = result.inserted_id
            return user_doc
        except Exception:
            user_doc["_id"] = f"user-{uuid.uuid4().hex[:8]}"
            _FALLBACK_USERS[email_clean] = user_doc
            return user_doc
