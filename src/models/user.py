"""
User model for Crow's Eye Marketing Platform.
Handles user accounts, subscription tiers, and feature access control.
"""
import json
import logging
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from enum import Enum
from dataclasses import dataclass, asdict
from pathlib import Path

logger = logging.getLogger(__name__)

class SubscriptionTier(Enum):
    """Subscription tier enumeration."""
    FREE = "free"             # $0/month - Users trying out Crow's Eye
    CREATOR = "creator"       # $19/month - Individuals and content creators
    PRO = "pro"               # $50/month - Professionals, marketers, small businesses
    BUSINESS = "business"     # Custom - Agencies, larger teams, high-volume needs

@dataclass
class UsageStats:
    """User usage statistics."""
    social_accounts: int = 0
    ai_content_credits_this_month: int = 0
    ai_image_edits_this_month: int = 0
    storage_used_gb: float = 0.0
    context_files_used: int = 0
    team_members_used: int = 0
    video_processing_used: int = 0
    last_reset_date: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'UsageStats':
        """Create from dictionary with backward compatibility."""
        # Handle legacy field names
        mapped_data = {}
        
        # Map legacy fields to new fields
        field_mapping = {
            'posts_created_this_month': 'social_accounts',
            'videos_generated_this_month': 'video_processing_used',
            'ai_requests_this_month': 'ai_content_credits_this_month',
            'storage_used_mb': 'storage_used_gb',
        }
        
        # Copy existing fields and map legacy ones
        for key, value in data.items():
            if key in field_mapping:
                mapped_data[field_mapping[key]] = value
            else:
                mapped_data[key] = value
        
        # Convert storage from MB to GB if needed
        if 'storage_used_mb' in data and 'storage_used_gb' not in mapped_data:
            mapped_data['storage_used_gb'] = data['storage_used_mb'] / 1024.0
        
        # Ensure all required fields have default values
        defaults = {
            'social_accounts': 0,
            'ai_content_credits_this_month': 0,
            'ai_image_edits_this_month': 0,
            'storage_used_gb': 0.0,
            'context_files_used': 0,
            'team_members_used': 0,
            'video_processing_used': 0,
            'last_reset_date': ""
        }
        
        for field, default_value in defaults.items():
            if field not in mapped_data:
                mapped_data[field] = default_value
        
        # Only pass fields that exist in the dataclass
        valid_fields = {field.name for field in cls.__dataclass_fields__.values()}
        filtered_data = {k: v for k, v in mapped_data.items() if k in valid_fields}
        
        return cls(**filtered_data)

@dataclass
class SubscriptionInfo:
    """Subscription information."""
    tier: SubscriptionTier
    start_date: str
    end_date: Optional[str] = None
    auto_renew: bool = True
    payment_method: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'tier': self.tier.value,
            'start_date': self.start_date,
            'end_date': self.end_date,
            'auto_renew': self.auto_renew,
            'payment_method': self.payment_method
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SubscriptionInfo':
        """Create from dictionary with backward compatibility."""
        # Handle legacy tier names
        tier_value = data['tier']
        if tier_value == 'spark':
            tier_value = 'free'  # Map legacy 'spark' to 'free'
        elif tier_value == 'growth':
            tier_value = 'pro'  # Map legacy 'growth' to 'pro'
        elif tier_value == 'pro_agency':
            tier_value = 'pro'  # Map legacy 'pro_agency' to 'pro'
        elif tier_value == 'enterprise':
            tier_value = 'business'  # Map legacy 'enterprise' to 'business'
        
        return cls(
            tier=SubscriptionTier(tier_value),
            start_date=data['start_date'],
            end_date=data.get('end_date'),
            auto_renew=data.get('auto_renew', True),
            payment_method=data.get('payment_method')
        )

@dataclass
class User:
    """User model for Crow's Eye platform."""
    user_id: str
    email: str
    username: str
    created_at: str
    subscription: SubscriptionInfo
    usage_stats: UsageStats
    preferences: Dict[str, Any]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert user to dictionary."""
        return {
            'user_id': self.user_id,
            'email': self.email,
            'username': self.username,
            'created_at': self.created_at,
            'subscription': self.subscription.to_dict(),
            'usage_stats': self.usage_stats.to_dict(),
            'preferences': self.preferences
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'User':
        """Create user from dictionary."""
        return cls(
            user_id=data['user_id'],
            email=data['email'],
            username=data['username'],
            created_at=data['created_at'],
            subscription=SubscriptionInfo.from_dict(data['subscription']),
            usage_stats=UsageStats.from_dict(data['usage_stats']),
            preferences=data.get('preferences', {})
        )
    
    def is_pro_user(self) -> bool:
        """Check if user has Pro subscription (Pro or Business)."""
        return self.subscription.tier == SubscriptionTier.PRO or self.subscription.tier == SubscriptionTier.BUSINESS
    
    def is_business_user(self) -> bool:
        """Check if user has Business subscription."""
        return self.subscription.tier == SubscriptionTier.BUSINESS
    
    def is_paid_user(self) -> bool:
        """Check if user has any paid subscription."""
        return self.subscription.tier in [SubscriptionTier.CREATOR, SubscriptionTier.PRO, SubscriptionTier.BUSINESS]
    
    def is_subscription_active(self) -> bool:
        """Check if subscription is currently active."""
        if self.subscription.tier == SubscriptionTier.FREE:
            return True
        
        if self.subscription.end_date:
            end_date = datetime.fromisoformat(self.subscription.end_date)
            return datetime.now() < end_date
        
        return True
    
    def get_subscription_status(self) -> str:
        """Get human-readable subscription status."""
        if self.subscription.tier == SubscriptionTier.FREE:
            return "Free Plan"
        
        if self.is_subscription_active():
            if self.subscription.end_date:
                end_date = datetime.fromisoformat(self.subscription.end_date)
                days_left = (end_date - datetime.now()).days
                return f"{self.subscription.tier.value} Tier (expires in {days_left} days)"
            return f"{self.subscription.tier.value} Tier (Active)"
        else:
            return f"{self.subscription.tier.value} Tier (Expired)"

class UserManager:
    """Simple user manager for API demonstration."""
    
    def __init__(self):
        self.current_user = self.create_demo_user()
    
    def create_demo_user(self) -> User:
        """Create a demo user for testing."""
        return User(
            user_id="demo_user_123",
            email="demo@crowseye.tech",
            username="Demo User",
            created_at=datetime.now().isoformat(),
            subscription=SubscriptionInfo(
                tier=SubscriptionTier.PRO,
                start_date=datetime.now().isoformat(),
                end_date=(datetime.now() + timedelta(days=30)).isoformat(),
                auto_renew=True,
                payment_method="demo"
            ),
            usage_stats=UsageStats(),
            preferences={}
        )
    
    def get_current_user(self) -> Optional[User]:
        """Get the current user."""
        return self.current_user
    
    def is_authenticated(self) -> bool:
        """Check if user is authenticated."""
        return self.current_user is not None

# Global user manager instance
user_manager = UserManager() 