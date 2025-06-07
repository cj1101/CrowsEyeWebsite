import os
import sys
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add the current directory to Python path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
sys.path.insert(0, os.path.join(current_dir, 'crow_eye_api_fresh'))

# Create FastAPI app
app = FastAPI(
    title="Crow's Eye Marketing Platform API",
    description="AI-powered social media content creation and automation platform",
    version="5.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers with error handling
ROUTERS_LOADED = False
successful_routers = []

try:
    # Try to import from the fresh API directory
    sys.path.insert(0, os.path.join(current_dir, 'crow_eye_api_fresh'))
    
    from crow_eye_api_fresh.routers import highlights, media, gallery, analytics, auth, stories, audio, admin
    
    # Include all routers
    app.include_router(highlights.router, prefix="/api/highlights", tags=["highlights"])
    app.include_router(media.router, prefix="/api/media", tags=["media"])
    app.include_router(gallery.router, prefix="/api/gallery", tags=["gallery"])
    app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
    app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
    app.include_router(stories.router, prefix="/api/stories", tags=["stories"])
    app.include_router(audio.router, prefix="/api/audio", tags=["audio"])
    app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
    
    ROUTERS_LOADED = True
    successful_routers = ['highlights', 'media', 'gallery', 'analytics', 'auth', 'stories', 'audio', 'admin']
    print("All routers loaded successfully!")
    
except ImportError as e:
    print(f"Warning: Could not import all routers: {e}")
    print("Attempting individual router imports...")
    
    # Try importing routers individually
    router_modules = ['highlights', 'media', 'gallery', 'analytics', 'auth', 'stories', 'audio', 'admin']
    
    for router_name in router_modules:
        try:
            router_module = __import__(f'crow_eye_api_fresh.routers.{router_name}', fromlist=[router_name])
            router = getattr(router_module, 'router')
            app.include_router(router, prefix=f"/api/{router_name}", tags=[router_name])
            successful_routers.append(router_name)
            print(f"{router_name} router loaded successfully")
        except Exception as router_error:
            print(f"Failed to load {router_name} router: {router_error}")
    
    if successful_routers:
        ROUTERS_LOADED = True
        print(f"Successfully loaded {len(successful_routers)} routers: {', '.join(successful_routers)}")
    else:
        print("No routers could be loaded")

except Exception as e:
    print(f"Unexpected error loading routers: {e}")
    print("Falling back to minimal API...")

@app.get("/")
def read_root():
    return {
        "message": "Crow's Eye Marketing Platform API",
        "version": "5.0.0",
        "status": "running",
        "routers_loaded": ROUTERS_LOADED,
        "successful_routers": successful_routers,
        "features": [
            "Long-form highlight generation",
            "AI-powered video analysis",
            "Cost-optimized processing",
            "Media gallery management",
            "AI tagging and search",
            "Caption generation",
            "Analytics and insights",
            "Scheduling and automation",
            "Image and video editing",
            "Story creation",
            "Audio processing",
            "Multi-platform posting"
        ],
        "endpoints": {
            "highlights": "/api/highlights" if "highlights" in successful_routers else "Not available",
            "media": "/api/media" if "media" in successful_routers else "Not available",
            "gallery": "/api/gallery" if "gallery" in successful_routers else "Not available",
            "analytics": "/api/analytics" if "analytics" in successful_routers else "Not available",
            "auth": "/api/auth" if "auth" in successful_routers else "Not available",
            "stories": "/api/stories" if "stories" in successful_routers else "Not available",
            "audio": "/api/audio" if "audio" in successful_routers else "Not available",
            "admin": "/api/admin" if "admin" in successful_routers else "Not available"
        }
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "port": os.environ.get("PORT", "8000"),
        "routers_loaded": ROUTERS_LOADED,
        "successful_routers": successful_routers
    }

@app.get("/api/test")
def test_endpoint():
    return {
        "message": "Full API with all features is working!" if ROUTERS_LOADED else "Minimal API is working!",
        "timestamp": "2025-01-05T16:00:00Z",
        "routers_loaded": ROUTERS_LOADED,
        "successful_routers": successful_routers
    }

@app.get("/api/capabilities")
def get_capabilities():
    """Get detailed API capabilities and feature list."""
    capabilities = {
        "media_processing": {
            "image_editing": "media" in successful_routers,
            "video_editing": "media" in successful_routers,
            "ai_tagging": "media" in successful_routers,
            "thumbnail_generation": "media" in successful_routers,
            "format_conversion": "media" in successful_routers
        },
        "content_creation": {
            "highlight_reels": "highlights" in successful_routers,
            "story_creation": "stories" in successful_routers,
            "caption_generation": "media" in successful_routers,
            "automated_posting": "admin" in successful_routers
        },
        "gallery_management": {
            "smart_search": "gallery" in successful_routers,
            "ai_organization": "gallery" in successful_routers,
            "bulk_operations": "gallery" in successful_routers,
            "custom_galleries": "gallery" in successful_routers
        },
        "analytics": {
            "engagement_tracking": "analytics" in successful_routers,
            "performance_insights": "analytics" in successful_routers,
            "cost_optimization": "analytics" in successful_routers,
            "trend_analysis": "analytics" in successful_routers
        },
        "integrations": {
            "instagram": True,
            "facebook": False,  # Meta integration disabled
            "twitter": False,
            "tiktok": False
        }
    }
    
    return {
        "capabilities": capabilities,
        "status": "operational",
        "version": "5.0.0",
        "routers_loaded": ROUTERS_LOADED,
        "successful_routers": successful_routers
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting Full-Featured Crow's Eye API on port {port}")
    print(f"Routers loaded: {ROUTERS_LOADED}")
    if successful_routers:
        print(f"Active routers: {', '.join(successful_routers)}")
    uvicorn.run(app, host="0.0.0.0", port=port) 