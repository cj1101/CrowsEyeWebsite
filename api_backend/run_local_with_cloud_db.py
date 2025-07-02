#!/usr/bin/env python3
"""
Local test runner that connects to the SAME PostgreSQL Cloud SQL database as production
This ensures database consistency between localhost and Google Cloud deployments
"""

import os
import sys
import uvicorn

# CRITICAL: Use the SAME PostgreSQL database as production
# This ensures your account exists on both localhost and cloud
os.environ["DATABASE_URL"] = "postgresql+asyncpg://postgres:crowseye2024@/crowseye_db?host=/cloudsql/crows-eye-website:us-central1:crowseye-postgres"
os.environ["JWT_SECRET_KEY"] = "pfxyGkNmRtHqLvWdZbJcEuPnSgKjDhGfTrYwMxBvNmQpLkJhGfDsEtRyUiOpAsWxCvBnMjKhGfDsEr"
os.environ["PROJECT_NAME"] = "Crow's Eye API - Local with Cloud DB"
os.environ["API_V1_STR"] = "/api/v1"
os.environ["ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "10080"  # 7 days
os.environ["INITIALIZE_DB"] = "false"  # Don't initialize - use existing production data
os.environ["LOG_LEVEL"] = "INFO"
os.environ["RATE_LIMIT_ENABLED"] = "false"
os.environ["CORS_ORIGINS"] = "http://localhost:3000,http://127.0.0.1:3000"

# Google Cloud configuration
os.environ["GOOGLE_CLOUD_PROJECT"] = "crows-eye-website"
os.environ["GOOGLE_CLOUD_STORAGE_BUCKET"] = "crows-eye-storage"

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def main():
    """Run the API locally with Cloud SQL PostgreSQL database."""
    try:
        print("🚀 Starting Crow's Eye API locally with Cloud Database...")
        print("📍 Local URL: http://localhost:8001")
        print("📖 API Docs: http://localhost:8001/docs")
        print("🔧 Environment: Local Development")
        print("💾 Database: PostgreSQL Cloud SQL (SAME as production)")
        print("✅ Database Consistency: Ensured between localhost and cloud")
        print("-" * 70)
        
        # Import and run the FastAPI app
        from crow_eye_api.main import app
        
        # Run with uvicorn
        uvicorn.run(
            app,
            host="127.0.0.1",
            port=8001,
            reload=False,
            log_level="info"
        )
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Try installing missing dependencies or check your Python environment")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 