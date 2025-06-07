"""
FastAPI dependencies for Crow's Eye Marketing Platform API.
Provides authentication, authorization, and core service dependencies.
"""

import os
import sys
from typing import Optional, Annotated
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from datetime import datetime, timedelta

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

# Import core models and handlers
try:
    from src.models.user import User, SubscriptionTier, user_manager, SubscriptionInfo, UsageStats
    from src.features.subscription.access_control import Feature, require_feature_access
    from src.features.media_processing.video_handler import VideoHandler
    CORE_IMPORTS_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Core imports not available: {e}")
    CORE_IMPORTS_AVAILABLE = False
    
    # Mock classes for when core imports fail
    class MockUser:
        def __init__(self):
            self.user_id = "mock_user"
            self.email = "test@example.com"
            self.username = "Test User"
            self.subscription = MockSubscription()
    
    class MockSubscription:
        def __init__(self):
            self.tier = "CREATOR"
    
    class MockHandler:
        def __init__(self, *args, **kwargs):
            pass
        
        def get_all_media(self):
            # Return some sample media data for testing
            return {
                "photos": [
                    "/sample/photos/image1.jpg",
                    "/sample/photos/image2.png",
                    "/sample/photos/image3.jpeg"
                ], 
                "videos": [
                    "/sample/videos/video1.mp4",
                    "/sample/videos/video2.mov"
                ], 
                "finished_posts": [
                    "/sample/finished/post1.jpg",
                    "/sample/finished/post2.mp4"
                ]
            }
        
        def search_media(self, query):
            # Return filtered sample data based on query
            all_media = self.get_all_media()
            # Simple filtering - in real implementation this would be more sophisticated
            if query.lower() in ["photo", "image"]:
                return {"photos": all_media["photos"], "videos": [], "finished_posts": []}
            elif query.lower() in ["video", "mov", "mp4"]:
                return {"photos": [], "videos": all_media["videos"], "finished_posts": []}
            else:
                return all_media
        
        def get_media_item_info(self, path):
            # Return more realistic sample data based on file type
            filename = path.split('/')[-1]
            extension = filename.split('.')[-1].lower()
            
            if extension in ['jpg', 'jpeg', 'png', 'gif']:
                return {
                    "size": 2048000,  # 2MB
                    "format": extension,
                    "dimensions": (1920, 1080),
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                    "ai_tags": ["sample", "test", "image"],
                    "caption": f"Sample image: {filename}"
                }
            elif extension in ['mp4', 'mov', 'avi']:
                return {
                    "size": 50000000,  # 50MB
                    "format": extension,
                    "dimensions": (1920, 1080),
                    "duration": 30.5,  # 30.5 seconds
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                    "ai_tags": ["sample", "test", "video"],
                    "caption": f"Sample video: {filename}"
                }
            else:
                return {
                    "size": 1024000,
                    "format": extension,
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                    "ai_tags": ["sample", "test"],
                    "caption": f"Sample file: {filename}"
                }

        def add_media_item(self, media_path, caption="", is_post_ready=False):
            # Mock successful upload
            return True
        
        def get_galleries(self):
            return []
        
        def get_saved_galleries(self):
            return [
                {
                    "id": "gallery_1",
                    "name": "Sample Gallery",
                    "description": "A sample gallery for testing",
                    "media_paths": ["/images/sample1.jpg", "/images/sample2.jpg"],
                    "caption": "Sample gallery caption",
                    "tags": ["sample", "test"],
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                    "thumbnail_url": "/images/sample1.jpg"
                }
            ]
        
        def create_gallery(self, *args, **kwargs):
            return {
                "id": "mock_gallery_123",
                "name": "Mock Gallery",
                "description": "A mock gallery for testing",
                "media_items": [],
                "created_at": datetime.now().isoformat()
            }
        
        def generate_caption(self, media_paths, tone_prompt="engaging"):
            return f"AI-generated caption for {len(media_paths)} media items with {tone_prompt} tone"
    
    User = MockUser
    VideoHandler = MockHandler

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "crow-eye-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

security = HTTPBearer()

# Global instances (initialized once)
_video_handler = None
_media_handler = None
_crowseye_handler = None

def get_video_handler() -> VideoHandler:
    """Get or create the global video handler instance."""
    global _video_handler
    if _video_handler is None:
        _video_handler = VideoHandler()
    return _video_handler

def get_media_handler():
    """Get or create the global media handler instance."""
    global _media_handler
    if _media_handler is None:
        _media_handler = MockHandler()
    return _media_handler

def get_crowseye_handler():
    """Get or create the global crowseye handler instance."""
    global _crowseye_handler
    if _crowseye_handler is None:
        _crowseye_handler = MockHandler()
    return _crowseye_handler

def create_access_token(user: User) -> str:
    """Create JWT access token for user."""
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode = {
        "sub": user.email,
        "user_id": user.user_id,
        "tier": getattr(user.subscription, 'tier', 'FREE'),
        "exp": expire
    }
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict:
    """Verify JWT token and return payload."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)] = None,
    x_user_api_key: Annotated[Optional[str], Header()] = None
) -> User:
    """Get current authenticated user."""
    
    # For demo purposes, create a test user if no auth provided
    if not credentials and not x_user_api_key:
        if CORE_IMPORTS_AVAILABLE:
            return User(
                user_id="demo_user",
                email="demo@crowseye.com",
                username="Demo User",
                created_at=datetime.now().isoformat(),
                subscription=SubscriptionInfo(
                    tier=SubscriptionTier.PRO,
                    start_date=datetime.now().isoformat()
                ),
                usage_stats=UsageStats(),
                preferences={}
            )
        else:
            return MockUser()
    
    # Check for BYO API key (Enterprise feature)
    if x_user_api_key:
        if CORE_IMPORTS_AVAILABLE:
            return User(
                user_id="enterprise_user",
                email="enterprise@example.com",
                username="Enterprise User",
                created_at=datetime.now().isoformat(),
                subscription=SubscriptionInfo(
                    tier=SubscriptionTier.BUSINESS,
                    start_date=datetime.now().isoformat()
                ),
                usage_stats=UsageStats(),
                preferences={}
            )
        else:
            return MockUser()
    
    # Handle JWT token authentication
    if credentials:
        payload = verify_token(credentials.credentials)
        email = payload.get("sub")
        user_id = payload.get("user_id")
        
        if CORE_IMPORTS_AVAILABLE:
            # In production, you'd fetch the user from database
            return User(
                user_id=user_id,
                email=email,
                username="Authenticated User",
                created_at=datetime.now().isoformat(),
                subscription=SubscriptionInfo(
                    tier=SubscriptionTier.PRO,
                    start_date=datetime.now().isoformat()
                ),
                usage_stats=UsageStats(),
                preferences={}
            )
        else:
            return MockUser()
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required"
    )

def require_tier(required_tier):
    """Dependency to require a specific subscription tier."""
    def tier_dependency(current_user: User = Depends(get_current_user)) -> User:
        if not CORE_IMPORTS_AVAILABLE:
            return current_user
            
        user_tier = current_user.subscription.tier
        tier_hierarchy = {
            SubscriptionTier.FREE: 0,
            SubscriptionTier.CREATOR: 1,
            SubscriptionTier.PRO: 2,
            SubscriptionTier.BUSINESS: 3
        }
        
        if tier_hierarchy.get(user_tier, 0) < tier_hierarchy.get(required_tier, 0):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This feature requires {required_tier.value} tier or higher"
            )
        
        return current_user
    
    return tier_dependency

def require_feature(feature):
    """Dependency to require a specific feature access."""
    def feature_dependency(current_user: User = Depends(get_current_user)) -> User:
        if not CORE_IMPORTS_AVAILABLE:
            return current_user
            
        try:
            require_feature_access(current_user, feature)
        except HTTPException:
            raise
        except Exception as e:
            # Fallback for any other errors
            print(f"Feature access check failed: {e}")
        
        return current_user
    
    return feature_dependency

def get_current_user_optional() -> Optional[User]:
    """Get current user without requiring authentication."""
    try:
        return get_current_user()
    except:
        return None

def require_enterprise(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to require enterprise tier access."""
    if not CORE_IMPORTS_AVAILABLE:
        return current_user
        
    if current_user.subscription.tier != SubscriptionTier.BUSINESS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This feature requires Business tier subscription"
        )
    
    return current_user

def get_services():
    """Get all available services."""
    return {
        "video_handler": get_video_handler() if CORE_IMPORTS_AVAILABLE else MockHandler(),
        "media_handler": get_media_handler(),
        "crowseye_handler": get_crowseye_handler(),
        "core_available": CORE_IMPORTS_AVAILABLE
    } 