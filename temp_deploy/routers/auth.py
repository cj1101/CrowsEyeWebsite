from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional
import json
from datetime import datetime, timedelta
import uuid
import jwt
from dependencies_simple import db_manager

router = APIRouter()

# Mock secret key - in production, use environment variable
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    
    to_encode = {"user_id": user_id, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/login")
async def login(request: LoginRequest):
    """User login endpoint"""
    
    # Authenticate against database
    user = db_manager.authenticate_user(request.email, request.password)
    
    if user:
        access_token = create_access_token(user['id'])
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 86400,  # 24 hours
            "user": {
                "id": user['id'],
                "email": user['email'],
                "name": user['display_name'],
                "first_name": user['first_name'],
                "last_name": user['last_name'],
                "subscription_tier": user['plan'],
                "is_super_user": user['is_super_user'],
                "created_at": "2024-01-01T00:00:00Z"
            }
        }
    else:
        # Fallback to demo user for testing
        if request.email == "demo@example.com" and request.password == "demo123":
            user_id = "user_123"
            access_token = create_access_token(user_id)
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": 86400,
                "user": {
                    "id": user_id,
                    "email": request.email,
                    "name": "Demo User",
                    "subscription_tier": "pro",
                    "created_at": "2024-01-01T00:00:00Z"
                }
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/register")
async def register(request: RegisterRequest):
    """User registration endpoint"""
    
    try:
        # Create user in database
        user_id = db_manager.create_user(
            email=request.email,
            display_name=request.name,
            password=request.password,
            first_name="",
            last_name=""
        )
        
        access_token = create_access_token(user_id)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 86400,
            "user": {
                "id": user_id,
                "email": request.email,
                "name": request.name,
                "subscription_tier": "spark",
                "created_at": datetime.now().isoformat()
            },
            "message": "User registered successfully"
        }
    except Exception as e:
        if "UNIQUE constraint failed" in str(e) or "already exists" in str(e):
            raise HTTPException(status_code=400, detail="Email already registered")
        else:
            raise HTTPException(status_code=500, detail="Registration failed")

@router.get("/me")
async def get_current_user(authorization: Optional[str] = Header(None)):
    """Get current user information"""
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    
    try:
        # Mock token verification - in production, verify JWT properly
        return {
            "id": "user_123",
            "email": "demo@example.com",
            "name": "Demo User",
            "subscription_tier": "pro",
            "created_at": "2024-01-01T00:00:00Z",
            "profile": {
                "avatar_url": "/api/media/avatars/user_123.jpg",
                "bio": "Content creator and marketing enthusiast",
                "location": "New York, NY",
                "website": "https://example.com"
            },
            "preferences": {
                "timezone": "America/New_York",
                "language": "en",
                "notifications": {
                    "email": True,
                    "push": True,
                    "sms": False
                }
            },
            "subscription": {
                "tier": "pro",
                "status": "active",
                "expires_at": "2025-12-31T23:59:59Z",
                "features": [
                    "unlimited_posts",
                    "ai_tools",
                    "analytics",
                    "priority_support"
                ]
            }
        }
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """Refresh access token"""
    
    # Mock refresh - in production, verify refresh token
    new_access_token = create_access_token("user_123")
    
    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in": 86400
    }

@router.post("/logout")
async def logout(authorization: Optional[str] = Header(None)):
    """User logout"""
    
    # In production, invalidate token in database/cache
    return {"message": "Logged out successfully"}

@router.put("/profile")
async def update_profile(
    name: Optional[str] = None,
    bio: Optional[str] = None,
    website: Optional[str] = None,
    authorization: Optional[str] = Header(None)
):
    """Update user profile"""
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    return {
        "name": name,
        "bio": bio,
        "website": website,
        "updated_at": datetime.now().isoformat(),
        "message": "Profile updated successfully"
    }

@router.get("/subscription")
async def get_subscription_info(authorization: Optional[str] = Header(None)):
    """Get user subscription information"""
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    return {
        "subscription": {
            "tier": "pro",
            "status": "active",
            "current_period_start": "2025-01-01T00:00:00Z",
            "current_period_end": "2025-12-31T23:59:59Z",
            "cancel_at_period_end": False,
            "features": [
                "unlimited_posts",
                "ai_tools",
                "advanced_analytics",
                "priority_support",
                "custom_branding"
            ],
            "usage": {
                "posts_this_month": 45,
                "ai_generations_this_month": 120,
                "storage_used_gb": 2.5,
                "storage_limit_gb": 10.0
            }
        }
    } 