#!/usr/bin/env python3
"""
Minimal test to check what's preventing the API from starting
"""

import os
import sys

# Set minimal environment variables
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test.db"
os.environ["JWT_SECRET_KEY"] = "local-dev-strong-jwt-signing-method-9x8y7w6v5u4t3s2r1q0p"
os.environ["PROJECT_NAME"] = "Test API"
os.environ["API_V1_STR"] = "/api/v1"
os.environ["INITIALIZE_DB"] = "false"  # Skip DB initialization
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "60"  # 1 hour instead of default 7 days
os.environ["LOG_LEVEL"] = "DEBUG"

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_import():
    """Test if we can import the app without errors."""
    try:
        print("Testing imports...")
        from crow_eye_api.main import app
        print("✅ FastAPI app imported successfully")
        
        # Test basic app properties
        print(f"✅ App title: {app.title}")
        print(f"✅ Routes count: {len(app.routes)}")
        
        return True
    except Exception as e:
        print(f"❌ Import failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_simple_startup():
    """Test if we can start the server very simply."""
    try:
        print("\nTesting simple server startup...")
        import uvicorn
        from crow_eye_api.main import app
        
        print("🚀 Starting server on port 8001 (to avoid conflicts)...")
        # Use a different port to avoid conflicts
        uvicorn.run(
            app,
            host="127.0.0.1",
            port=8001,
            log_level="debug",
            access_log=True
        )
        
    except Exception as e:
        print(f"❌ Server startup failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if test_import():
        test_simple_startup()
    else:
        print("❌ Cannot proceed - import failed")
        sys.exit(1) 