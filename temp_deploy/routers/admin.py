from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid

router = APIRouter()

@router.get("/stats")
async def get_system_stats():
    """Get system statistics"""
    return {
        "users": {"total": 1250, "active_30d": 890, "new_7d": 45},
        "content": {"posts": 15600, "media_files": 8900, "stories": 2300},
        "storage": {"used_gb": 156.7, "limit_gb": 500.0, "usage_percent": 31.3},
        "api": {"requests_24h": 45600, "avg_response_time": 125, "error_rate": 0.2}
    }

@router.get("/users")
async def get_users():
    """Get user management data"""
    return {
        "users": [
            {"id": "user_1", "email": "user@example.com", "tier": "pro", "status": "active"},
            {"id": "user_2", "email": "demo@example.com", "tier": "free", "status": "active"}
        ],
        "total": 2
    }

@router.get("/health")
async def health_check():
    """System health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "api": "operational",
            "database": "operational", 
            "storage": "operational"
        }
    } 