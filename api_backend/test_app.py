#!/usr/bin/env python3
"""
Simple test to verify the FastAPI app can be imported and basic functionality works.
"""

import sys
import os
import traceback

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_app_import():
    """Test if we can import the FastAPI app."""
    try:
        from crow_eye_api.main import app
        print("✅ Successfully imported FastAPI app")
        return True
    except Exception as e:
        print(f"❌ Failed to import FastAPI app: {e}")
        traceback.print_exc()
        return False

def test_basic_config():
    """Test basic configuration."""
    try:
        from crow_eye_api.core.config import settings
        print(f"✅ Configuration loaded - Project: {settings.PROJECT_NAME}")
        print(f"✅ API Version: {settings.API_V1_STR}")
        print(f"✅ Database URL: {settings.DATABASE_URL[:50]}...")
        return True
    except Exception as e:
        print(f"❌ Failed to load configuration: {e}")
        traceback.print_exc()
        return False

def test_app_structure():
    """Test if app has the expected structure."""
    try:
        from crow_eye_api.main import app
        
        # Check if app has routes
        routes = len(app.routes)
        print(f"✅ App has {routes} routes configured")
        
        # Check if we can get OpenAPI schema
        openapi_schema = app.openapi()
        if openapi_schema:
            print("✅ OpenAPI schema generated successfully")
        
        return True
    except Exception as e:
        print(f"❌ App structure test failed: {e}")
        traceback.print_exc()
        return False

def main():
    """Run all tests."""
    print("🧪 Testing FastAPI backend...")
    print("=" * 50)
    
    tests = [
        ("Import Test", test_app_import),
        ("Configuration Test", test_basic_config),
        ("App Structure Test", test_app_structure),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running {test_name}...")
        if test_func():
            passed += 1
        print("-" * 30)
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The backend is ready for deployment.")
        return True
    else:
        print("⚠️ Some tests failed. Check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 