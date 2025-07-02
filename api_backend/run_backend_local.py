#!/usr/bin/env python3
"""
Run the backend API server with local SQLite database
"""
import os
import sys

# Set environment variables for local development
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./crow_eye_local.db"
os.environ["ENVIRONMENT"] = "development"
os.environ["PROJECT_NAME"] = "Crow's Eye API - Local Development"
os.environ["JWT_SECRET_KEY"] = "pfxyGkNmRtHqLvWdZbJcEuPnSgKjDhGfTrYwMxBvNmQpLkJhGfDsEtRyUiOpAsWxCvBnMjKhGfDsEr"

# Import and run the app
import uvicorn
from crow_eye_api.main import app

if __name__ == "__main__":
    print("🚀 Starting Crow's Eye API Backend on http://localhost:8001")
    print("📦 Using SQLite database: crow_eye_local.db")
    uvicorn.run(app, host="0.0.0.0", port=8001) 