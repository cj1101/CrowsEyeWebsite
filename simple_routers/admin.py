"""
Simplified Admin router for Crow's Eye API.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class SystemStats(BaseModel):
    total_users: int
    total_media_files: int
    total_storage_used: str
    system_status: str


@router.get("/stats", response_model=SystemStats)
async def get_system_stats():
    """Get system statistics."""
    return SystemStats(
        total_users=127,
        total_media_files=1543,
        total_storage_used="2.3 GB",
        system_status="operational"
    )


@router.get("/health")
async def admin_health_check():
    """Admin health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "database": "connected",
            "storage": "available",
            "api": "operational"
        }
    } 