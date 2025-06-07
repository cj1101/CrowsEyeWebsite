"""
Simplified Auth router for Crow's Eye API.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    user: dict


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """User login endpoint."""
    # Mock authentication - in production this would validate against database
    if request.email == "demo@example.com" and request.password == "demo123":
        return AuthResponse(
            access_token="mock_jwt_token_here",
            user={"id": "user123", "email": request.email, "name": "Demo User"}
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )


@router.post("/register", response_model=AuthResponse)
async def register(request: LoginRequest):
    """User registration endpoint."""
    return AuthResponse(
        access_token="mock_jwt_token_here",
        user={"id": "newuser123", "email": request.email, "name": "New User"}
    )


@router.get("/me")
async def get_current_user():
    """Get current user info."""
    return {"id": "user123", "email": "demo@example.com", "name": "Demo User"} 