import os
import random
import string
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel, EmailStr
from app.database.mongodb import get_db
from app.services.auth_service import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token,
    send_reset_email,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()

# --- Schemas ---
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ForgotPassword(BaseModel):
    email: EmailStr

class VerifyResetCode(BaseModel):
    email: EmailStr
    code: str

class ResetPassword(BaseModel):
    email: EmailStr
    code: str
    new_password: str

class ChangePassword(BaseModel):
    current_password: str
    new_password: str

# --- Dependencies ---
def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
        
    db = get_db()
    user = db.users.find_one({"email": payload.get("sub")})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    return user

# --- Routes ---
@router.post("/register")
async def register(user_data: UserRegister):
    db = get_db()
    if db.users.find_one({"email": user_data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user_dict = user_data.dict()
    user_dict["password"] = get_password_hash(user_dict.pop("password"))
    user_dict["role"] = "Employee"
    user_dict["created_at"] = datetime.utcnow()
    
    db.users.insert_one(user_dict)
    return {"message": "Account created successfully. Please log in."}

@router.post("/login")
async def login(user_data: UserLogin):
    db = get_db()
    user = db.users.find_one({"email": user_data.email})
    
    hashed_password = user.get("password") or user.get("password_hash")
    if not user or not hashed_password or not verify_password(user_data.password, hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "role": user.get("role", "Employee")},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "Employee"),
            "avatarInitials": user["name"][:2].upper() if user.get("name") else "US"
        }
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "name": current_user["name"],
        "email": current_user["email"],
        "role": current_user.get("role", "Employee"),
        "avatarInitials": current_user["name"][:2].upper() if current_user.get("name") else "US"
    }

@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword):
    db = get_db()
    user = db.users.find_one({"email": data.email})
    
    if user:
        # Generate 6 digit code
        code = ''.join(random.choices(string.digits, k=6))
        hashed_code = get_password_hash(code)
        
        # Invalidate old requests
        db.password_reset_tokens.delete_many({"email": data.email})
        
        # Save new request
        db.password_reset_tokens.insert_one({
            "email": data.email,
            "hashed_code": hashed_code,
            "expires_at": datetime.utcnow() + timedelta(minutes=10),
            "attempts": 0,
            "verified": False,
            "created_at": datetime.utcnow()
        })
        
        send_reset_email(data.email, code)
        
    # Always return generic response
    return {"message": "If an account exists for this email, a verification code has been sent."}

@router.post("/verify-reset-code")
async def verify_reset_code(data: VerifyResetCode):
    db = get_db()
    token_doc = db.password_reset_tokens.find_one({"email": data.email})
    
    if not token_doc or datetime.utcnow() > token_doc["expires_at"]:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code.")
        
    if token_doc.get("attempts", 0) >= 3:
        db.password_reset_tokens.delete_one({"_id": token_doc["_id"]})
        raise HTTPException(status_code=400, detail="Too many attempts. Request a new code.")
        
    if not verify_password(data.code, token_doc["hashed_code"]):
        db.password_reset_tokens.update_one(
            {"_id": token_doc["_id"]},
            {"$inc": {"attempts": 1}}
        )
        raise HTTPException(status_code=400, detail="Invalid or expired verification code.")
        
    # Mark as verified
    db.password_reset_tokens.update_one(
        {"_id": token_doc["_id"]},
        {"$set": {"verified": True}}
    )
    return {"message": "Code verified successfully."}

@router.post("/reset-password")
async def reset_password(data: ResetPassword):
    db = get_db()
    token_doc = db.password_reset_tokens.find_one({"email": data.email, "verified": True})
    
    if not token_doc or datetime.utcnow() > token_doc["expires_at"]:
        raise HTTPException(status_code=400, detail="Invalid or expired reset session.")
        
    # Check if the code they provide matches again for extra security, though verified is True
    if not verify_password(data.code, token_doc["hashed_code"]):
         raise HTTPException(status_code=400, detail="Invalid reset session.")
    
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
        
    hashed_pwd = get_password_hash(data.new_password)
    db.users.update_one(
        {"email": data.email},
        {"$set": {"password": hashed_pwd}}
    )
    
    # Invalidate token
    db.password_reset_tokens.delete_many({"email": data.email})
    
    return {"message": "Password changed successfully. Please log in with your new password."}

@router.post("/change-password")
async def change_password(data: ChangePassword, current_user: dict = Depends(get_current_user)):
    db = get_db()
    hashed_password = current_user.get("password") or current_user.get("password_hash")
    
    if not hashed_password or not verify_password(data.current_password, hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password.")
        
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters.")
        
    new_hashed_pwd = get_password_hash(data.new_password)
    db.users.update_one(
        {"email": current_user["email"]},
        {"$set": {"password": new_hashed_pwd}}
    )
    
    return {"message": "Password changed successfully."}
