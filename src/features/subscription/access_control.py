"""
Access control and feature management for Crow's Eye API.
"""
from enum import Enum
from typing import Optional
from fastapi import HTTPException, status
from ...models.user import User, SubscriptionTier

class Feature(Enum):
    """Feature enumeration for access control."""
    HIGHLIGHT_REEL_GENERATOR = "highlight_reel_generator"
    MEDIA_UPLOAD = "media_upload"
    GALLERY_MANAGEMENT = "gallery_management"
    ANALYTICS = "analytics"
    ADVANCED_ANALYTICS = "advanced_analytics"
    AUDIO_PROCESSING = "audio_processing"
    AUDIO_IMPORTER = "audio_importer"
    STORY_CREATION = "story_creation"
    POST_FORMATTING = "post_formatting"
    ADMIN_PANEL = "admin_panel"

# Feature access mapping by subscription tier
FEATURE_ACCESS = {
    SubscriptionTier.FREE: [
        Feature.MEDIA_UPLOAD,
        Feature.GALLERY_MANAGEMENT,
    ],
    SubscriptionTier.CREATOR: [
        Feature.MEDIA_UPLOAD,
        Feature.GALLERY_MANAGEMENT,
        Feature.HIGHLIGHT_REEL_GENERATOR,
        Feature.STORY_CREATION,
        Feature.POST_FORMATTING,
        Feature.ANALYTICS,
    ],
    SubscriptionTier.PRO: [
        Feature.MEDIA_UPLOAD,
        Feature.GALLERY_MANAGEMENT,
        Feature.HIGHLIGHT_REEL_GENERATOR,
        Feature.STORY_CREATION,
        Feature.POST_FORMATTING,
        Feature.ANALYTICS,
        Feature.ADVANCED_ANALYTICS,
        Feature.AUDIO_PROCESSING,
        Feature.AUDIO_IMPORTER,
    ],
    SubscriptionTier.BUSINESS: [
        Feature.MEDIA_UPLOAD,
        Feature.GALLERY_MANAGEMENT,
        Feature.HIGHLIGHT_REEL_GENERATOR,
        Feature.STORY_CREATION,
        Feature.POST_FORMATTING,
        Feature.ANALYTICS,
        Feature.ADVANCED_ANALYTICS,
        Feature.AUDIO_PROCESSING,
        Feature.AUDIO_IMPORTER,
        Feature.ADMIN_PANEL,
    ],
}

def user_has_feature(user: User, feature: Feature) -> bool:
    """Check if user has access to a specific feature."""
    if not user or not user.is_subscription_active():
        return False
    
    allowed_features = FEATURE_ACCESS.get(user.subscription.tier, [])
    return feature in allowed_features

def require_feature_access(user: Optional[User], feature: Feature) -> None:
    """Require user to have access to a specific feature."""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    if not user_has_feature(user, feature):
        tier_name = user.subscription.tier.value.title()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Feature '{feature.value}' requires a higher subscription tier. Current tier: {tier_name}"
        ) 