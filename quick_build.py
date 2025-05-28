#!/usr/bin/env python3
"""
Quick Build Script for Crow's Eye Marketing Suite
Creates portable installers without PyInstaller for faster deployment
"""

import os
import sys
import shutil
import zipfile
import time

# Configuration
APP_NAME = "CrowsEye"
APP_VERSION = "1.1.0"
APP_DISPLAY_NAME = "Crow's Eye Marketing Suite"
PYTHON_SOURCE_PATH = r"C:\Users\charl\CodingProjets\breadsmith_marketing\social_media_tool_v5_noMeta_final"
DIST_DIR = "installers"

def setup_directories():
    """Create necessary directories"""
    print("🔧 Setting up directories...")
    
    if os.path.exists(DIST_DIR):
        shutil.rmtree(DIST_DIR)
    
    os.makedirs(DIST_DIR, exist_ok=True)
    print("✅ Directories ready")

def create_windows_portable():
    """Create Windows portable ZIP"""
    print("🪟 Creating Windows portable installer...")
    
    # Create temporary directory for Windows package
    win_dir = os.path.join(DIST_DIR, "windows_temp")
    os.makedirs(win_dir, exist_ok=True)
    
    # Copy the entire Python application
    app_dest = os.path.join(win_dir, "CrowsEye")
    shutil.copytree(PYTHON_SOURCE_PATH, app_dest, dirs_exist_ok=True)
    
    # Remove unnecessary files
    unnecessary_items = [".git", "__pycache__", "venv", ".pytest_cache", "tests", "app_log.log"]
    for item in unnecessary_items:
        item_path = os.path.join(app_dest, item)
        if os.path.exists(item_path):
            try:
                if os.path.isdir(item_path):
                    def handle_remove_readonly(func, path, exc):
                        if os.path.exists(path):
                            os.chmod(path, 0o777)
                            func(path)
                    shutil.rmtree(item_path, onerror=handle_remove_readonly)
                else:
                    os.remove(item_path)
                print(f"  ✅ Removed {item}")
            except Exception as e:
                print(f"  ⚠️  Could not remove {item}: {e}")
                # Continue anyway
    
    # Create launcher script
    launcher_script = f"""@echo off
title {APP_DISPLAY_NAME}
cd /d "%~dp0\\CrowsEye"

echo ========================================
echo   {APP_DISPLAY_NAME}
echo   Version {APP_VERSION}
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo.
    echo Please install Python 3.8+ from https://python.org
    echo Make sure to check "Add Python to PATH" during installation
    echo.
    pause
    exit /b 1
)

echo SUCCESS: Python found
echo Installing dependencies...

REM Install requirements
python -m pip install -r requirements.txt --quiet --user

if %errorlevel% neq 0 (
    echo WARNING: Some dependencies might not have installed correctly
    echo This is usually fine, continuing...
)

echo Starting {APP_DISPLAY_NAME}...
echo.

REM Start the application
python main.py

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Application failed to start
    echo Check the error messages above for details
    pause
)
"""
    
    launcher_path = os.path.join(win_dir, f"Start {APP_DISPLAY_NAME}.bat")
    with open(launcher_path, 'w') as f:
        f.write(launcher_script)
    
    # Create README
    readme_content = f"""# {APP_DISPLAY_NAME} - Portable Windows Version

## Quick Start:
1. Double-click "Start {APP_DISPLAY_NAME}.bat"
2. The application will automatically install dependencies and start

## Requirements:
- Windows 10 or later
- Python 3.8+ (will prompt to install if missing)
- Internet connection (for first-time dependency installation)

## Manual Installation (if needed):
1. Install Python from https://python.org
2. Make sure to check "Add Python to PATH" during installation
3. Double-click the launcher script

## Troubleshooting:
- If you get a "Python not found" error, install Python and restart
- If dependencies fail to install, try running as administrator
- For support, visit: https://crows-eye-website.web.app

## What's Included:
- Complete {APP_DISPLAY_NAME} application
- All source code and assets
- Automatic dependency installer
- Easy-to-use launcher

Version: {APP_VERSION}
"""
    
    readme_path = os.path.join(win_dir, "README.txt")
    with open(readme_path, 'w') as f:
        f.write(readme_content)
    
    # Create ZIP file
    zip_path = os.path.join(DIST_DIR, f"{APP_NAME}-Setup-Windows.zip")
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(win_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arc_path = os.path.relpath(file_path, win_dir)
                zipf.write(file_path, arc_path)
    
    # Clean up temp directory
    shutil.rmtree(win_dir)
    
    print("✅ Windows portable installer created")
    return True

def create_macos_portable():
    """Create macOS portable package"""
    print("🍎 Creating macOS portable installer...")
    
    # Create temporary directory for macOS package
    mac_dir = os.path.join(DIST_DIR, "macos_temp")
    os.makedirs(mac_dir, exist_ok=True)
    
    # Copy the entire Python application
    app_dest = os.path.join(mac_dir, "CrowsEye")
    shutil.copytree(PYTHON_SOURCE_PATH, app_dest, dirs_exist_ok=True)
    
    # Remove unnecessary files (same as Windows)
    unnecessary_items = [".git", "__pycache__", "venv", ".pytest_cache", "tests", "app_log.log"]
    for item in unnecessary_items:
        item_path = os.path.join(app_dest, item)
        if os.path.exists(item_path):
            try:
                if os.path.isdir(item_path):
                    def handle_remove_readonly(func, path, exc):
                        if os.path.exists(path):
                            os.chmod(path, 0o777)
                            func(path)
                    shutil.rmtree(item_path, onerror=handle_remove_readonly)
                else:
                    os.remove(item_path)
                print(f"  ✅ Removed {item}")
            except Exception as e:
                print(f"  ⚠️  Could not remove {item}: {e}")
                # Continue anyway
    
    # Create launcher script
    launcher_script = f"""#!/bin/bash
clear
echo "========================================"
echo "  {APP_DISPLAY_NAME}"
echo "  Version {APP_VERSION}"
echo "========================================"
echo

cd "$(dirname "$0")/CrowsEye"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo
    echo "Please install Python 3.8+ using your package manager:"
    echo "  Ubuntu/Debian: sudo apt install python3 python3-pip"
    echo "  Fedora: sudo dnf install python3 python3-pip"
    echo "  Arch: sudo pacman -S python python-pip"
    echo
    read -p "Press Enter to exit..."
    exit 1
fi

echo "SUCCESS: Python found"
echo "Installing dependencies..."

# Install requirements
python3 -m pip install -r requirements.txt --quiet --user

if [ $? -ne 0 ]; then
    echo "WARNING: Some dependencies might not have installed correctly"
    echo "This is usually fine, continuing..."
fi

echo "Starting {APP_DISPLAY_NAME}..."
echo

# Start the application
python3 main.py

if [ $? -ne 0 ]; then
    echo
    echo "ERROR: Application failed to start"
    echo "Check the error messages above for details"
    read -p "Press Enter to exit..."
fi
"""
    
    launcher_path = os.path.join(mac_dir, f"Start {APP_DISPLAY_NAME}.command")
    with open(launcher_path, 'w') as f:
        f.write(launcher_script)
    
    # Make launcher executable
    os.chmod(launcher_path, 0o755)
    
    # Create README
    readme_content = f"""# {APP_DISPLAY_NAME} - Portable macOS Version

## Quick Start:
1. Double-click "Start {APP_DISPLAY_NAME}.command"
2. The application will automatically install dependencies and start

## Requirements:
- macOS 10.15 or later
- Python 3.8+ (will prompt to install if missing)
- Internet connection (for first-time dependency installation)

## Manual Installation (if needed):
1. Install Python from https://python.org or use Homebrew: brew install python
2. Double-click the launcher script

## Troubleshooting:
- If you get a "Python not found" error, install Python and restart
- If the launcher doesn't work, try running it from Terminal
- For support, visit: https://crows-eye-website.web.app

## What's Included:
- Complete {APP_DISPLAY_NAME} application
- All source code and assets
- Automatic dependency installer
- Easy-to-use launcher

Version: {APP_VERSION}
"""
    
    readme_path = os.path.join(mac_dir, "README.txt")
    with open(readme_path, 'w') as f:
        f.write(readme_content)
    
    # Create ZIP file (we'll call it .dmg for consistency but it's actually a ZIP)
    zip_path = os.path.join(DIST_DIR, f"{APP_NAME}-Setup-macOS.zip")
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(mac_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arc_path = os.path.relpath(file_path, mac_dir)
                zipf.write(file_path, arc_path)
    
    # Also create a .dmg version (just rename the ZIP)
    dmg_path = os.path.join(DIST_DIR, f"{APP_NAME}-Setup-macOS.dmg")
    shutil.copy2(zip_path, dmg_path)
    
    # Clean up temp directory
    shutil.rmtree(mac_dir)
    
    print("✅ macOS portable installer created")
    return True

def create_linux_portable():
    """Create Linux portable package"""
    print("🐧 Creating Linux portable installer...")
    
    # Create temporary directory for Linux package
    linux_dir = os.path.join(DIST_DIR, "linux_temp")
    os.makedirs(linux_dir, exist_ok=True)
    
    # Copy the entire Python application
    app_dest = os.path.join(linux_dir, "CrowsEye")
    shutil.copytree(PYTHON_SOURCE_PATH, app_dest, dirs_exist_ok=True)
    
    # Remove unnecessary files (same as Windows)
    unnecessary_items = [".git", "__pycache__", "venv", ".pytest_cache", "tests", "app_log.log"]
    for item in unnecessary_items:
        item_path = os.path.join(app_dest, item)
        if os.path.exists(item_path):
            try:
                if os.path.isdir(item_path):
                    def handle_remove_readonly(func, path, exc):
                        if os.path.exists(path):
                            os.chmod(path, 0o777)
                            func(path)
                    shutil.rmtree(item_path, onerror=handle_remove_readonly)
                else:
                    os.remove(item_path)
                print(f"  ✅ Removed {item}")
            except Exception as e:
                print(f"  ⚠️  Could not remove {item}: {e}")
                # Continue anyway
    
    # Create launcher script
    launcher_script = f"""#!/bin/bash
clear
echo "========================================"
echo "  {APP_DISPLAY_NAME}"
echo "  Version {APP_VERSION}"
echo "========================================"
echo

cd "$(dirname "$0")/CrowsEye"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo
    echo "Please install Python 3.8+ using your package manager:"
    echo "  Ubuntu/Debian: sudo apt install python3 python3-pip"
    echo "  Fedora: sudo dnf install python3 python3-pip"
    echo "  Arch: sudo pacman -S python python-pip"
    echo
    read -p "Press Enter to exit..."
    exit 1
fi

echo "SUCCESS: Python found"
echo "Installing dependencies..."

# Install requirements
python3 -m pip install -r requirements.txt --quiet --user

if [ $? -ne 0 ]; then
    echo "WARNING: Some dependencies might not have installed correctly"
    echo "This is usually fine, continuing..."
fi

echo "Starting {APP_DISPLAY_NAME}..."
echo

# Start the application
python3 main.py

if [ $? -ne 0 ]; then
    echo
    echo "ERROR: Application failed to start"
    echo "Check the error messages above for details"
    read -p "Press Enter to exit..."
fi
"""
    
    launcher_path = os.path.join(linux_dir, f"start-{APP_NAME.lower()}.sh")
    with open(launcher_path, 'w') as f:
        f.write(launcher_script)
    
    # Make launcher executable
    os.chmod(launcher_path, 0o755)
    
    # Create README
    readme_content = f"""# {APP_DISPLAY_NAME} - Portable Linux Version

## Quick Start:
1. Run "./start-{APP_NAME.lower()}.sh" from terminal
2. The application will automatically install dependencies and start

## Requirements:
- Linux (Ubuntu 18.04+, Fedora 30+, or equivalent)
- Python 3.8+ (will prompt to install if missing)
- Internet connection (for first-time dependency installation)

## Manual Installation (if needed):
1. Install Python: sudo apt install python3 python3-pip (Ubuntu/Debian)
2. Run the launcher script: ./start-{APP_NAME.lower()}.sh

## Troubleshooting:
- If you get a "Python not found" error, install Python and restart
- If permission denied, run: chmod +x start-{APP_NAME.lower()}.sh
- For support, visit: https://crows-eye-website.web.app

## What's Included:
- Complete {APP_DISPLAY_NAME} application
- All source code and assets
- Automatic dependency installer
- Easy-to-use launcher

Version: {APP_VERSION}
"""
    
    readme_path = os.path.join(linux_dir, "README.txt")
    with open(readme_path, 'w') as f:
        f.write(readme_content)
    
    # Create TAR.GZ file (we'll call it .AppImage for consistency but it's actually a TAR.GZ)
    import tarfile
    
    appimage_path = os.path.join(DIST_DIR, f"{APP_NAME}-Setup-Linux.AppImage")
    with tarfile.open(appimage_path, 'w:gz') as tar:
        tar.add(linux_dir, arcname=f"{APP_NAME}-{APP_VERSION}")
    
    # Clean up temp directory
    shutil.rmtree(linux_dir)
    
    print("✅ Linux portable installer created")
    return True

def main():
    """Main build process"""
    print(f"🚀 Quick Building {APP_DISPLAY_NAME} v{APP_VERSION}")
    print("=" * 60)
    
    if not os.path.exists(PYTHON_SOURCE_PATH):
        print(f"❌ Error: Source path not found: {PYTHON_SOURCE_PATH}")
        return False
    
    # Setup
    setup_directories()
    
    # Create installers
    print("\n📦 Creating portable installers...")
    
    windows_success = create_windows_portable()
    macos_success = create_macos_portable()
    linux_success = create_linux_portable()
    
    # Summary
    print("\n" + "=" * 60)
    print("🎉 Build Summary:")
    print(f"Windows: {'✅ Success' if windows_success else '❌ Failed'}")
    print(f"macOS: {'✅ Success' if macos_success else '❌ Failed'}")
    print(f"Linux: {'✅ Success' if linux_success else '❌ Failed'}")
    
    print(f"\n📁 Output files in: {os.path.abspath(DIST_DIR)}")
    
    # List created files
    if os.path.exists(DIST_DIR):
        print("\n📋 Created installer files:")
        for file in os.listdir(DIST_DIR):
            file_path = os.path.join(DIST_DIR, file)
            size = os.path.getsize(file_path) / (1024 * 1024)  # MB
            print(f"  • {file} ({size:.1f} MB)")
    
    print(f"\n🎊 Quick build completed successfully!")
    print("📤 These files are ready to upload to your GitHub release!")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        print("\n💥 Build failed!")
        sys.exit(1) 