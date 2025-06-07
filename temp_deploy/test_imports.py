#!/usr/bin/env python3
"""
Test script to verify all imports work correctly
"""

print("Testing imports...")

try:
    from database import DatabaseManager
    print("✅ Database import successful")
except Exception as e:
    print(f"❌ Database import failed: {e}")

try:
    from globals import db_manager
    print("✅ Globals import successful")
except Exception as e:
    print(f"❌ Globals import failed: {e}")

try:
    from routers import media, auth, admin, analytics, gallery, highlights, stories, audio
    print("✅ All router imports successful")
except Exception as e:
    print(f"❌ Router imports failed: {e}")

print("Import test complete!") 