import os
import sys
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app
app = FastAPI(
    title="Crow's Eye Marketing Platform API",
    description="AI-powered social media content creation and automation platform",
    version="5.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize simplified database
try:
    from dependencies_simple import db_manager
    print("✅ Simplified database initialized successfully")
except Exception as e:
    print(f"❌ Database initialization failed: {e}")
    db_manager = None

# Import and include routers
ROUTERS_LOADED = False
successful_routers = []

router_configs = [
    ("highlights", "/api/highlights", ["highlights"]),
    ("media", "/api/media", ["media"]),
    ("gallery", "/api/gallery", ["gallery"]),
    ("analytics", "/api/analytics", ["analytics"]),
    ("auth", "/api/auth", ["authentication"]),
    ("stories", "/api/stories", ["stories"]),
    ("audio", "/api/audio", ["audio"]),
    ("admin", "/api/admin", ["admin"])
]

for router_name, prefix, tags in router_configs:
    try:
        router_module = __import__(f'routers.{router_name}', fromlist=[router_name])
        router = getattr(router_module, 'router')
        app.include_router(router, prefix=prefix, tags=tags)
        successful_routers.append(router_name)
        print(f"✅ {router_name} router loaded successfully")
    except Exception as router_error:
        print(f"❌ Failed to load {router_name} router: {router_error}")

if successful_routers:
    ROUTERS_LOADED = True
    print(f"🎉 Successfully loaded {len(successful_routers)} routers: {', '.join(successful_routers)}")
else:
    print("❌ No routers could be loaded")

@app.get("/")
def read_root():
    return {
        "message": "Crow's Eye Marketing Platform API",
        "version": "5.0.0",
        "status": "running",
        "routers_loaded": ROUTERS_LOADED,
        "loaded_routers": successful_routers,
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
            "highlights": "/api/highlights",
            "media": "/api/media",
            "gallery": "/api/gallery",
            "analytics": "/api/analytics",
            "auth": "/api/auth",
            "stories": "/api/stories",
            "audio": "/api/audio",
            "admin": "/api/admin"
        }
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "port": os.environ.get("PORT", "8000"),
        "routers_loaded": ROUTERS_LOADED,
        "loaded_routers": successful_routers
    }

@app.get("/api/test")
def test_endpoint():
    return {
        "message": "API is working",
        "timestamp": "2025-01-05T16:00:00Z",
        "routers_loaded": ROUTERS_LOADED,
        "loaded_routers": successful_routers
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 