"""
Admin endpoints for user management and upgrades
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
import json

from crow_eye_api.database import get_db
from crow_eye_api.models.user import User as UserModel
from crow_eye_api.schemas.user import User as UserSchema
from crow_eye_api.api.api_v1.dependencies import get_current_active_user

router = APIRouter()

@router.post("/upgrade-user-to-pro/{email}")
async def upgrade_user_to_pro(
    email: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Upgrade a specific user to lifetime Pro access
    This is an admin endpoint for manual upgrades
    """
    
    # Find the user
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User not found: {email}")
    
    # Store original tier for logging
    original_tier = user.subscription_tier
    
    # Update user to Pro tier with lifetime access
    user.subscription_tier = "pro"
    user.subscription_status = "active"
    user.subscription_expires = datetime.now() + timedelta(days=365 * 100)  # 100 years
    user.updated_at = datetime.now()
    
    # Update usage limits for Pro tier
    pro_usage_limits = {
        "linked_accounts": 0,
        "max_linked_accounts": 50,
        "ai_credits": 5000,
        "max_ai_credits": 5000,
        "scheduled_posts": 0,
        "max_scheduled_posts": 1000,
        "media_storage_mb": 0,
        "max_media_storage_mb": 100000
    }
    user.usage_limits = json.dumps(pro_usage_limits)
    
    # Update plan features for Pro tier
    pro_plan_features = {
        "basic_content_tools": True,
        "media_library": True,
        "smart_gallery": True,
        "post_formatting": True,
        "basic_video_tools": True,
        "advanced_content": True,
        "analytics": "advanced",
        "team_collaboration": True,
        "custom_branding": True,
        "api_access": True,
        "priority_support": True
    }
    user.plan_features = json.dumps(pro_plan_features)
    
    try:
        await db.commit()
        await db.refresh(user)
        
        return {
            "success": True,
            "message": f"User {email} successfully upgraded to lifetime Pro access",
            "details": {
                "user_id": user.id,
                "email": user.email,
                "previous_tier": original_tier,
                "new_tier": user.subscription_tier,
                "subscription_status": user.subscription_status,
                "expires": user.subscription_expires.isoformat() if user.subscription_expires else None,
                "pro_features": [
                    "5,000 AI credits per month",
                    "1,000 scheduled posts",
                    "100GB media storage", 
                    "Advanced analytics",
                    "Team collaboration",
                    "Custom branding",
                    "API access",
                    "Priority support"
                ]
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to upgrade user: {str(e)}")

@router.get("/user-info/{email}")
async def get_user_info(
    email: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed user information for admin purposes
    """
    
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User not found: {email}")
    
    return {
        "user_id": user.id,
        "email": user.email,
        "name": user.name,
        "subscription_tier": user.subscription_tier,
        "subscription_status": user.subscription_status,
        "subscription_expires": user.subscription_expires.isoformat() if user.subscription_expires else None,
        "created_at": user.created_at.isoformat(),
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
        "usage_limits": json.loads(user.usage_limits) if user.usage_limits else {},
        "plan_features": json.loads(user.plan_features) if user.plan_features else {}
    } 