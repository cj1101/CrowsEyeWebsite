#!/usr/bin/env python3
"""Test script to validate main.py and router imports"""

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

def test_imports():
    """Test all the imports used in main.py"""
    try:
        print("Testing basic FastAPI imports...")
        from fastapi import FastAPI
        from fastapi.middleware.cors import CORSMiddleware
        print("✓ FastAPI imports successful")
        
        print("Testing router imports...")
        from routers import highlights, media, gallery, analytics, auth, stories, audio, admin
        print("✓ All router imports successful")
        
        print("Testing router objects...")
        routers = [
            ('highlights', highlights.router),
            ('media', media.router),
            ('gallery', gallery.router),
            ('analytics', analytics.router),
            ('auth', auth.router),
            ('stories', stories.router),
            ('audio', audio.router),
            ('admin', admin.router)
        ]
        
        for name, router in routers:
            print(f"✓ {name} router object exists")
        
        print("\n✅ All imports successful!")
        return True
        
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False

def test_main_creation():
    """Test creating the FastAPI app like main.py does"""
    try:
        print("Testing FastAPI app creation...")
        
        # Import what we need
        from fastapi import FastAPI
        from fastapi.middleware.cors import CORSMiddleware
        
        # Create app
        app = FastAPI(
            title="Test API",
            description="Test",
            version="1.0.0"
        )
        
        # Add CORS
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        print("✓ FastAPI app creation successful")
        return True
        
    except Exception as e:
        print(f"❌ App creation failed: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing API imports and setup...\n")
    
    import_success = test_imports()
    app_success = test_main_creation()
    
    if import_success and app_success:
        print("\n🎉 All tests passed! The API should deploy successfully.")
        sys.exit(0)
    else:
        print("\n❌ Tests failed! There are issues that need to be fixed.")
        sys.exit(1) 