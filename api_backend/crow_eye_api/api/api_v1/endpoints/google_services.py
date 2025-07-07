��from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter()

@router.get("/services")
async def get_google_services():
    """Get list of available Google services."""
    return {
        "services": ["google_photos", "youtube", "google_business"],
        "message": "Available Google services for integration"
    }

@router.get("/services/status")
async def get_services_status():
    """Get authentication status for all Google services."""
    return {
        "status": "active",
        "services": {
            "google_photos": {"authenticated": False},
            "youtube": {"authenticated": False},
            "google_business": {"authenticated": False}
        }
    }
