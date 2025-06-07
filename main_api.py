import os
import sys
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add the fresh API directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
fresh_api_path = os.path.join(current_dir, 'crow_eye_api_fresh')
sys.path.insert(0, fresh_api_path)

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

# Import routers with comprehensive error handling
ROUTERS_LOADED = False
successful_routers = []

print("🔍 Attempting to load routers...")

# Try importing routers individually to see which ones work
router_modules = ['highlights', 'media', 'gallery', 'analytics', 'auth', 'stories', 'audio', 'admin']

for router_name in router_modules:
    try:
        print(f"📦 Attempting to load {router_name} router...")
        
        # Import the router module
        router_module = __import__(f'routers.{router_name}', fromlist=[router_name])
        router = getattr(router_module, 'router')
        
        # Add router to app
        app.include_router(router, prefix=f"/api/{router_name}", tags=[router_name])
        successful_routers.append(router_name)
        print(f"✅ {router_name} router loaded successfully")
        
    except ImportError as import_error:
        print(f"❌ Failed to import {router_name} router: {import_error}")
    except AttributeError as attr_error:
        print(f"❌ {router_name} router missing 'router' attribute: {attr_error}")
    except Exception as router_error:
        print(f"❌ Failed to load {router_name} router: {router_error}")

if successful_routers:
    ROUTERS_LOADED = True
    print(f"🎉 Successfully loaded {len(successful_routers)} routers: {', '.join(successful_routers)}")
else:
    print("❌ No routers could be loaded, running minimal API")

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
            "highlights": "/api/highlights" if "highlights" in successful_routers else "Not loaded",
            "media": "/api/media" if "media" in successful_routers else "Not loaded",
            "gallery": "/api/gallery" if "gallery" in successful_routers else "Not loaded",
            "analytics": "/api/analytics" if "analytics" in successful_routers else "Not loaded",
            "auth": "/api/auth" if "auth" in successful_routers else "Not loaded",
            "stories": "/api/stories" if "stories" in successful_routers else "Not loaded",
            "audio": "/api/audio" if "audio" in successful_routers else "Not loaded",
            "admin": "/api/admin" if "admin" in successful_routers else "Not loaded"
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
        "message": "Full API is working!" if ROUTERS_LOADED else "Minimal API is working!",
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
    print(f"🚀 Starting Crow's Eye API on port {port}")
    print(f"📂 Fresh API path: {fresh_api_path}")
    uvicorn.run(app, host="0.0.0.0", port=port) 