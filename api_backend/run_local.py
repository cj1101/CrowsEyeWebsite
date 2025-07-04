#!/usr/bin/env python3
"""
Simple local test runner for the Crow's Eye API
Uses existing installed packages and simpler configuration
"""

import os
import sys
import uvicorn

# Set environment variables for local testing
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./crow_eye_local.db"
os.environ["JWT_SECRET_KEY"] = "pfxyGkNmRtHqLvWdZbJcEuPnSgKjDhGfTrYwMxBvNmQpLkJhGfDsEtRyUiOpAsWxCvBnMjKhGfDsEr"
os.environ["PROJECT_NAME"] = "Crow's Eye API - Local Dev"
os.environ["API_V1_STR"] = "/api/v1"
os.environ["ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "1440"
os.environ["INITIALIZE_DB"] = "true"
os.environ["LOG_LEVEL"] = "INFO"
os.environ["RATE_LIMIT_ENABLED"] = "false"
os.environ["CORS_ORIGINS"] = "http://localhost:3000,http://127.0.0.1:3000"
os.environ["SKIP_SQL_MODEL_INIT"] = "false"

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def main():
    """Run the API locally for testing."""
    try:
        print("Starting Crow's Eye API locally...")
        print("Local URL: http://localhost:8001")
        print("API Docs: http://localhost:8001/docs")
        print("Environment: Local Development")
        print("Database: SQLite (crow_eye_local.db)")
        print("-" * 50)
        
        # Import and run the FastAPI app
        from crow_eye_api.main import app
        
        # Run with uvicorn
        uvicorn.run(
            app,
            host="127.0.0.1",
            port=8001,
            reload=False,  # Set to True for auto-reload during development
            log_level="info"
        )
        
    except ImportError as e:
        print(f"Import error: {e}")
        print("Try installing missing dependencies or check your Python environment")
        sys.exit(1)
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 