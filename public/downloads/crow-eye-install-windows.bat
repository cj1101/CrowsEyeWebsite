@echo off
cls
echo ================================================================
echo             Crow's Eye Marketing Tool - Windows Installer
echo ================================================================
echo.
echo Installing Crow's Eye Marketing Tool on Windows...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH!
    echo Please install Python 3.8 or higher from https://python.org
    echo Then re-run this installer.
    pause
    exit /b 1
)

REM Create installation directory
set INSTALL_DIR=%USERPROFILE%\CrowsEye
echo Creating installation directory: %INSTALL_DIR%
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Download the application files (placeholder for actual download)
echo Downloading Crow's Eye Marketing Tool...
REM In production, this would download from GitHub releases
REM For now, we'll create a placeholder structure

echo Setting up virtual environment...
cd "%INSTALL_DIR%"
python -m venv venv
call venv\Scripts\activate.bat

echo Installing dependencies...
(
echo PySide6==6.9.0
echo requests==2.28.2
echo python-dateutil==2.8.2
echo python-dotenv==1.0.0
echo Pillow==11.2.1
echo google-generativeai==0.4.1
) > requirements.txt

pip install -r requirements.txt

REM Create desktop shortcut
echo Creating desktop shortcut...
set SHORTCUT_PATH=%USERPROFILE%\Desktop\Crow's Eye.lnk
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT_PATH%'); $Shortcut.TargetPath = '%INSTALL_DIR%\venv\Scripts\python.exe'; $Shortcut.Arguments = 'run.py'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%\icon.ico'; $Shortcut.Save()"

echo.
echo ================================================================
echo Installation Complete!
echo ================================================================
echo.
echo Crow's Eye Marketing Tool has been installed to: %INSTALL_DIR%
echo Desktop shortcut created: %SHORTCUT_PATH%
echo.
echo To start the application:
echo 1. Double-click the desktop shortcut, or
echo 2. Navigate to %INSTALL_DIR% and run: venv\Scripts\python.exe run.py
echo.
echo Note: This installer currently sets up a basic environment.
echo The full application files will be available when the project is ready.
echo.
pause 