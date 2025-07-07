# Set environment variables
$env:DATABASE_URL = "sqlite+aiosqlite:///./crow_eye_local.db"
$env:ENVIRONMENT = "development"
$env:PROJECT_NAME = "Crow's Eye API - Local Development"
$env:JWT_SECRET_KEY = "pfxyGkNmRtHqLvWdZbJcEuPnSgKjDhGfTrYwMxBvNmQpLkJhGfDsEtRyUiOpAsWxCvBnMjKhGfDsEr"

# Start the backend
Write-Host "🚀 Starting Crow's Eye API Backend on http://localhost:8001" -ForegroundColor Green
Write-Host "📦 Using SQLite database: crow_eye_local.db" -ForegroundColor Blue

python main.py 