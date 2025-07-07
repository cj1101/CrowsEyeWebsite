#!/usr/bin/env python3
"""
Minimal test to verify basic imports work without triggering app startup.
"""

import sys
import os
import traceback

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_basic_imports():
    """Test if we can import basic modules."""
    try:
        # Test core imports
        from crow_eye_api.core.config import settings
        print("✅ Settings imported successfully")
        
        # Test schema imports
        from crow_eye_api import schemas
        print("✅ Schemas imported successfully")
        
        # Test models (without database connection)
        from crow_eye_api import models
        print("✅ Models imported successfully")
        
        return True
    except Exception as e:
        print(f"❌ Import test failed: {e}")
        traceback.print_exc()
        return False

def test_config():
    """Test configuration without database."""
    try:
        from crow_eye_api.core.config import settings
        print(f"✅ Project: {settings.PROJECT_NAME}")
        print(f"✅ API Version: {settings.API_V1_STR}")
        print(f"✅ Database configured: {settings.DATABASE_URL[:50]}...")
        return True
    except Exception as e:
        print(f"❌ Config test failed: {e}")
        traceback.print_exc()
        return False

def test_requirements():
    """Test if key dependencies are available."""
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
        import pydantic
        print("✅ All key dependencies available")
        print(f"   - FastAPI: {fastapi.__version__}")
        print(f"   - SQLAlchemy: {sqlalchemy.__version__}")
        print(f"   - Pydantic: {pydantic.__version__}")
        return True
    except Exception as e:
        print(f"❌ Dependencies test failed: {e}")
        traceback.print_exc()
        return False

def main():
    """Run minimal tests."""
    print("🧪 Running minimal backend tests...")
    print("=" * 40)
    
    tests = [
        ("Dependencies Test", test_requirements),
        ("Import Test", test_basic_imports),
        ("Configuration Test", test_config),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 {test_name}...")
        if test_func():
            passed += 1
        print("-" * 20)
    
    print(f"\n📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 Basic tests passed! Ready for deployment.")
        return True
    else:
        print("⚠️ Some tests failed.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 