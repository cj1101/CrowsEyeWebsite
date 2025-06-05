"""
Dependencies for Crow's Eye API.
"""

from fastapi import Depends, HTTPException, status
from typing import Optional

# Mock user class for demo
class MockUser:
    def __init__(self):
        self.user_id = "demo_user"
        self.email = "demo@crowseye.com"
        self.username = "Demo User"

def get_current_user() -> MockUser:
    """Get current user (demo version)."""
    return MockUser()

def require_feature(feature):
    """Dependency factory for feature requirements (demo version)."""
    def feature_dependency(current_user: MockUser = Depends(get_current_user)) -> MockUser:
        return current_user
    return feature_dependency

def require_enterprise(current_user: MockUser = Depends(get_current_user)) -> MockUser:
    """Dependency for enterprise-only features (demo version)."""
    return current_user

def get_services():
    """Get all core services as a dependency (demo version)."""
    return {
        "core_imports_available": False,
        "crowseye_handler": None,
        "media_handler": None
    }

def get_crowseye_handler():
    """Get Crow's Eye handler (demo version)."""
    return None

def get_media_handler():
    """Get media handler (demo version)."""
    return None 