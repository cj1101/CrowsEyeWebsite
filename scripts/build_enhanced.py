#!/usr/bin/env python3
"""
Enhanced Build Script for Crow's Eye Marketing Suite
Creates installers with embedded Python and auto-installation
"""

import os
import sys
import shutil
import subprocess
import platform
import zipfile
import requests
from pathlib import Path

# Configuration
PYTHON_VERSION = "3.11.9"
APP_NAME = "CrowsEye"
APP_VERSION = "1.0.0"
PYTHON_SOURCE_PATH = "../breadsmith_marketing/social_media_tool_v5_noMeta_final"

def download_python_embeddable():
    """Download Python embeddable distribution for Windows"""
    system = platform.system().lower()
    
    if system == "windows":
        python_url = f"https://www.python.org/ftp/python/{PYTHON_VERSION}/python-{PYTHON_VERSION}-embed-amd64.zip"
        python_zip = f"python-{PYTHON_VERSION}-embed-amd64.zip"
        
        print(f"Downloading Python {PYTHON_VERSION} embeddable...")
        response = requests.get(python_url)
        with open(python_zip, 'wb') as f:
            f.write(response.content)
        
        # Extract Python
        with zipfile.ZipFile(python_zip, 'r') as zip_ref:
            zip_ref.extractall("python_embed")
        
        os.remove(python_zip)
        return "python_embed"
    
    return None

def copy_python_app():
    """Copy the Python application to build directory"""
    build_dir = "build"
    app_dir = os.path.join(build_dir, "app")
    
    # Create build directory
    os.makedirs(build_dir, exist_ok=True)
    
    # Copy Python application
    if os.path.exists(PYTHON_SOURCE_PATH):
        print("Copying Python application...")
        shutil.copytree(PYTHON_SOURCE_PATH, app_dir, dirs_exist_ok=True)
        
        # Remove unnecessary files
        unnecessary_dirs = [".git", "__pycache__", "venv", ".pytest_cache", "tests"]
        for dir_name in unnecessary_dirs:
            dir_path = os.path.join(app_dir, dir_name)
            if os.path.exists(dir_path):
                shutil.rmtree(dir_path)
        
        return app_dir
    else:
        print(f"Error: Python source path not found: {PYTHON_SOURCE_PATH}")
        return None

def create_launcher_script():
    """Create launcher scripts that hide Python complexity"""
    
    # Windows launcher
    windows_launcher = """@echo off
cd /d "%~dp0"

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Python...
    if exist "python_embed" (
        echo Using embedded Python...
        set PYTHON_CMD=python_embed\\python.exe
    ) else (
        echo Python not found. Please install Python 3.8+ from python.org
        pause
        exit /b 1
    )
) else (
    set PYTHON_CMD=python
)

REM Install requirements if needed
if not exist "app\\requirements_installed.flag" (
    echo Installing dependencies...
    %PYTHON_CMD% -m pip install -r app\\deployment\\requirements.txt --quiet
    echo. > app\\requirements_installed.flag
)

REM Launch the application
echo Starting Crow's Eye Marketing Suite...
cd app
%PYTHON_CMD% main.py
pause
"""

    # macOS/Linux launcher
    unix_launcher = """#!/bin/bash
cd "$(dirname "$0")"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is required but not installed."
    echo "Please install Python 3.8+ from python.org"
    read -p "Press Enter to exit..."
    exit 1
fi

# Install requirements if needed
if [ ! -f "app/requirements_installed.flag" ]; then
    echo "Installing dependencies..."
    python3 -m pip install -r app/deployment/requirements.txt --quiet --user
    touch app/requirements_installed.flag
fi

# Launch the application
echo "Starting Crow's Eye Marketing Suite..."
cd app
python3 main.py
"""

    # Write launcher scripts
    with open("build/CrowsEye.bat", "w") as f:
        f.write(windows_launcher)
    
    with open("build/CrowsEye.sh", "w") as f:
        f.write(unix_launcher)
    
    # Make Unix script executable
    if platform.system() != "Windows":
        os.chmod("build/CrowsEye.sh", 0o755)

def create_installer_nsis():
    """Create NSIS installer script for Windows"""
    nsis_script = f"""
!define APP_NAME "{APP_NAME}"
!define APP_VERSION "{APP_VERSION}"
!define PUBLISHER "Crow's Eye Technologies"
!define WEB_SITE "https://crowseye.tech"

!include "MUI2.nsh"

Name "${{APP_NAME}}"
OutFile "${{APP_NAME}}-Setup-Windows.exe"
InstallDir "$PROGRAMFILES64\\${{APP_NAME}}"
InstallDirRegKey HKLM "Software\\${{APP_NAME}}" "Install_Dir"

RequestExecutionLevel admin

!define MUI_ABORTWARNING
!define MUI_ICON "app\\assets\\icons\\app_icon.ico"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "app\\LICENSE"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

!insertmacro MUI_LANGUAGE "English"

Section "MainSection" SEC01
    SetOutPath "$INSTDIR"
    
    ; Copy all files
    File /r "app\\*"
    File "CrowsEye.bat"
    
    ; Copy embedded Python if available
    IfFileExists "python_embed\\*" 0 +2
    File /r "python_embed"
    
    ; Create shortcuts
    CreateDirectory "$SMPROGRAMS\\${{APP_NAME}}"
    CreateShortCut "$SMPROGRAMS\\${{APP_NAME}}\\${{APP_NAME}}.lnk" "$INSTDIR\\CrowsEye.bat" "" "$INSTDIR\\app\\assets\\icons\\app_icon.ico"
    CreateShortCut "$DESKTOP\\${{APP_NAME}}.lnk" "$INSTDIR\\CrowsEye.bat" "" "$INSTDIR\\app\\assets\\icons\\app_icon.ico"
    
    ; Registry entries
    WriteRegStr HKLM "Software\\${{APP_NAME}}" "Install_Dir" "$INSTDIR"
    WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${{APP_NAME}}" "DisplayName" "${{APP_NAME}}"
    WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${{APP_NAME}}" "UninstallString" '"$INSTDIR\\uninstall.exe"'
    WriteRegDWORD HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${{APP_NAME}}" "NoModify" 1
    WriteRegDWORD HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${{APP_NAME}}" "NoRepair" 1
    WriteUninstaller "uninstall.exe"
SectionEnd

Section "Uninstall"
    DeleteRegKey HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${{APP_NAME}}"
    DeleteRegKey HKLM "Software\\${{APP_NAME}}"
    
    Delete "$DESKTOP\\${{APP_NAME}}.lnk"
    Delete "$SMPROGRAMS\\${{APP_NAME}}\\${{APP_NAME}}.lnk"
    RMDir "$SMPROGRAMS\\${{APP_NAME}}"
    
    RMDir /r "$INSTDIR"
SectionEnd
"""
    
    with open("build/installer.nsi", "w") as f:
        f.write(nsis_script)

def create_macos_app():
    """Create macOS .app bundle"""
    app_bundle = f"build/{APP_NAME}.app"
    contents_dir = f"{app_bundle}/Contents"
    macos_dir = f"{contents_dir}/MacOS"
    resources_dir = f"{contents_dir}/Resources"
    
    # Create directory structure
    os.makedirs(macos_dir, exist_ok=True)
    os.makedirs(resources_dir, exist_ok=True)
    
    # Copy app files to Resources
    shutil.copytree("build/app", f"{resources_dir}/app", dirs_exist_ok=True)
    
    # Create Info.plist
    info_plist = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>{APP_NAME}</string>
    <key>CFBundleIdentifier</key>
    <string>tech.crowseye.marketing</string>
    <key>CFBundleName</key>
    <string>{APP_NAME}</string>
    <key>CFBundleVersion</key>
    <string>{APP_VERSION}</string>
    <key>CFBundleShortVersionString</key>
    <string>{APP_VERSION}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
</dict>
</plist>"""
    
    with open(f"{contents_dir}/Info.plist", "w") as f:
        f.write(info_plist)
    
    # Create launcher script
    launcher = f"""#!/bin/bash
cd "$(dirname "$0")/../Resources"
./CrowsEye.sh
"""
    
    launcher_path = f"{macos_dir}/{APP_NAME}"
    with open(launcher_path, "w") as f:
        f.write(launcher)
    
    os.chmod(launcher_path, 0o755)
    
    # Copy launcher script
    shutil.copy("build/CrowsEye.sh", resources_dir)

def create_linux_appimage():
    """Create Linux AppImage"""
    appdir = f"build/{APP_NAME}.AppDir"
    
    # Create AppDir structure
    os.makedirs(f"{appdir}/usr/bin", exist_ok=True)
    os.makedirs(f"{appdir}/usr/share/applications", exist_ok=True)
    os.makedirs(f"{appdir}/usr/share/icons/hicolor/256x256/apps", exist_ok=True)
    
    # Copy app files
    shutil.copytree("build/app", f"{appdir}/usr/bin/app", dirs_exist_ok=True)
    shutil.copy("build/CrowsEye.sh", f"{appdir}/usr/bin/")
    
    # Create AppRun
    apprun = f"""#!/bin/bash
cd "$(dirname "$0")/usr/bin"
./CrowsEye.sh
"""
    
    with open(f"{appdir}/AppRun", "w") as f:
        f.write(apprun)
    
    os.chmod(f"{appdir}/AppRun", 0o755)
    
    # Create .desktop file
    desktop = f"""[Desktop Entry]
Type=Application
Name={APP_NAME}
Exec=AppRun
Icon={APP_NAME.lower()}
Categories=Office;
"""
    
    with open(f"{appdir}/{APP_NAME.lower()}.desktop", "w") as f:
        f.write(desktop)

def build_installers():
    """Build installers for all platforms"""
    system = platform.system().lower()
    
    print("Building Crow's Eye Marketing Suite installers...")
    
    # Clean previous builds
    if os.path.exists("build"):
        shutil.rmtree("build")
    
    # Copy Python application
    app_dir = copy_python_app()
    if not app_dir:
        return False
    
    # Download embedded Python for Windows
    if system == "windows":
        python_embed_dir = download_python_embeddable()
        if python_embed_dir:
            shutil.move(python_embed_dir, "build/python_embed")
    
    # Create launcher scripts
    create_launcher_script()
    
    # Create platform-specific installers
    if system == "windows":
        create_installer_nsis()
        print("Windows installer script created: build/installer.nsi")
        print("Run 'makensis build/installer.nsi' to create the installer")
    
    elif system == "darwin":
        create_macos_app()
        print(f"macOS app bundle created: build/{APP_NAME}.app")
        print("Create DMG with: hdiutil create -volname 'Crow's Eye' -srcfolder build/CrowsEye.app -ov -format UDZO CrowsEye-Setup-macOS.dmg")
    
    elif system == "linux":
        create_linux_appimage()
        print(f"Linux AppDir created: build/{APP_NAME}.AppDir")
        print("Download appimagetool to create AppImage")
    
    print("\nBuild completed successfully!")
    print("The installer will automatically handle Python installation and dependencies.")
    return True

if __name__ == "__main__":
    if build_installers():
        print("\n✅ Enhanced installers created successfully!")
        print("Users can now install Crow's Eye without any Python knowledge.")
    else:
        print("\n❌ Build failed!")
        sys.exit(1) 