@echo off
echo.
echo ===============================================
echo    Crow's Eye Desktop Application Installer
echo    AI-Powered Marketing Automation
echo ===============================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH.
    echo.
    echo Please install Python 3.8+ from https://python.org
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    echo After installing Python, run this installer again.
    echo.
    pause
    start https://python.org/downloads/
    exit /b 1
)

echo Python found! Proceeding with installation...
echo.

:: Create installation directory
set INSTALL_DIR=%USERPROFILE%\CrowsEye
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

:: Download the installer script
echo Downloading installer script...
curl -L -o "%INSTALL_DIR%\install.py" "https://crowseye.com/api/download/installer"

:: If curl fails, try PowerShell
if %errorlevel% neq 0 (
    echo Curl failed, trying PowerShell...
    powershell -Command "Invoke-WebRequest -Uri 'https://crowseye.com/api/download/installer' -OutFile '%INSTALL_DIR%\install.py'"
)

:: If that also fails, download manually
if %errorlevel% neq 0 (
    echo.
    echo Could not download installer automatically.
    echo Please download the installer manually from:
    echo https://crowseye.com/api/download/installer
    echo.
    echo Save it as install.py and run: python install.py
    echo.
    pause
    exit /b 1
)

:: Run the Python installer
echo.
echo Running Python installer...
cd /d "%INSTALL_DIR%"
python install.py

echo.
echo Installation complete! Check the output above for any errors.
echo.
pause 