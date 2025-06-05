#!/usr/bin/env python3
"""
Desktop App Builder Script
Builds installers for Windows, macOS, and Linux from the Python marketing tool
"""

import os
import sys
import shutil
import subprocess
import platform
from pathlib import Path

# Configuration
APP_NAME = "Crow's Eye Marketing Tool"
APP_VERSION = "5.0.0"
PYTHON_APP_DIR = "desktop_app"
BUILD_DIR = "build"
DIST_DIR = "public/downloads"

def ensure_directories():
    """Create necessary directories"""
    Path(BUILD_DIR).mkdir(exist_ok=True)
    Path(DIST_DIR).mkdir(exist_ok=True)

def install_dependencies():
    """Install required build dependencies"""
    print("Installing build dependencies...")
    
    dependencies = [
        "pyinstaller",
        "auto-py-to-exe",
        "cx_Freeze",
        "py2app",  # macOS only
        "briefcase"  # Cross-platform
    ]
    
    for dep in dependencies:
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", dep], 
                         check=True, capture_output=True)
            print(f"✓ Installed {dep}")
        except subprocess.CalledProcessError:
            print(f"⚠ Failed to install {dep} (may not be needed on this platform)")

def build_windows_exe():
    """Build Windows executable using PyInstaller"""
    print("Building Windows executable...")
    
    if not Path(PYTHON_APP_DIR).exists():
        print(f"Error: {PYTHON_APP_DIR} directory not found")
        return False
    
    # PyInstaller command
    cmd = [
        "pyinstaller",
        "--onefile",
        "--windowed",
        "--name", f"crow-eye-marketing-tool-windows-v{APP_VERSION}",
        "--icon", f"{PYTHON_APP_DIR}/assets/icon.ico" if Path(f"{PYTHON_APP_DIR}/assets/icon.ico").exists() else None,
        "--add-data", f"{PYTHON_APP_DIR}/src;src",
        "--add-data", f"{PYTHON_APP_DIR}/data;data",
        "--add-data", f"{PYTHON_APP_DIR}/translations;translations",
        "--hidden-import", "PyQt6",
        "--hidden-import", "requests",
        "--hidden-import", "openai",
        "--hidden-import", "google.generativeai",
        f"{PYTHON_APP_DIR}/main.py"
    ]
    
    # Remove None values
    cmd = [arg for arg in cmd if arg is not None]
    
    try:
        subprocess.run(cmd, check=True, cwd=".")
        
        # Move to downloads directory
        exe_path = Path("dist") / f"crow-eye-marketing-tool-windows-v{APP_VERSION}.exe"
        if exe_path.exists():
            shutil.move(str(exe_path), f"{DIST_DIR}/crow-eye-marketing-tool-windows-v{APP_VERSION}.exe")
            print(f"✓ Windows executable built: {DIST_DIR}/crow-eye-marketing-tool-windows-v{APP_VERSION}.exe")
            return True
        else:
            print("✗ Windows executable not found after build")
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to build Windows executable: {e}")
        return False

def build_macos_app():
    """Build macOS app bundle using py2app"""
    print("Building macOS application...")
    
    if platform.system() != "Darwin":
        print("⚠ macOS app can only be built on macOS")
        return False
    
    # Create setup.py for py2app
    setup_py_content = f'''
from setuptools import setup

APP = ['{PYTHON_APP_DIR}/main.py']
DATA_FILES = [
    ('{PYTHON_APP_DIR}/src', ['{PYTHON_APP_DIR}/src']),
    ('{PYTHON_APP_DIR}/data', ['{PYTHON_APP_DIR}/data']),
    ('{PYTHON_APP_DIR}/translations', ['{PYTHON_APP_DIR}/translations']),
]
OPTIONS = {{
    'argv_emulation': True,
    'iconfile': '{PYTHON_APP_DIR}/assets/icon.icns',
    'plist': {{
        'CFBundleName': "{APP_NAME}",
        'CFBundleDisplayName': "{APP_NAME}",
        'CFBundleGetInfoString': "AI-powered social media marketing tool",
        'CFBundleVersion': "{APP_VERSION}",
        'CFBundleShortVersionString': "{APP_VERSION}",
        'NSHumanReadableCopyright': "Copyright © 2025 Crow's Eye Marketing",
    }}
}}

setup(
    app=APP,
    data_files=DATA_FILES,
    options={{'py2app': OPTIONS}},
    setup_requires=['py2app'],
)
'''
    
    with open("setup_macos.py", "w") as f:
        f.write(setup_py_content)
    
    try:
        subprocess.run([sys.executable, "setup_macos.py", "py2app"], check=True)
        
        # Create DMG
        dmg_name = f"crow-eye-marketing-tool-macos-v{APP_VERSION}.dmg"
        subprocess.run([
            "hdiutil", "create", "-volname", APP_NAME,
            "-srcfolder", "dist",
            "-ov", "-format", "UDZO",
            f"{DIST_DIR}/{dmg_name}"
        ], check=True)
        
        print(f"✓ macOS DMG built: {DIST_DIR}/{dmg_name}")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to build macOS app: {e}")
        return False
    finally:
        # Cleanup
        if Path("setup_macos.py").exists():
            os.remove("setup_macos.py")

def build_linux_appimage():
    """Build Linux AppImage"""
    print("Building Linux AppImage...")
    
    # Create AppDir structure
    app_dir = Path(BUILD_DIR) / "AppDir"
    app_dir.mkdir(exist_ok=True)
    
    # Copy application files
    shutil.copytree(PYTHON_APP_DIR, app_dir / "opt" / "crow-eye-marketing-tool", dirs_exist_ok=True)
    
    # Create desktop file
    desktop_content = f'''[Desktop Entry]
Type=Application
Name={APP_NAME}
Exec=crow-eye-marketing-tool
Icon=crow-eye-marketing-tool
Categories=Office;Graphics;Photography;
'''
    
    with open(app_dir / "crow-eye-marketing-tool.desktop", "w") as f:
        f.write(desktop_content)
    
    # Create AppRun script
    apprun_content = f'''#!/bin/bash
HERE="$(dirname "$(readlink -f "${{0}}")")"
export PATH="${{HERE}}/opt/crow-eye-marketing-tool:${{PATH}}"
cd "${{HERE}}/opt/crow-eye-marketing-tool"
exec python3 main.py "$@"
'''
    
    apprun_path = app_dir / "AppRun"
    with open(apprun_path, "w") as f:
        f.write(apprun_content)
    os.chmod(apprun_path, 0o755)
    
    # Download appimagetool if not exists
    appimagetool_path = Path(BUILD_DIR) / "appimagetool"
    if not appimagetool_path.exists():
        print("Downloading appimagetool...")
        subprocess.run([
            "wget", "-O", str(appimagetool_path),
            "https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage"
        ], check=True)
        os.chmod(appimagetool_path, 0o755)
    
    # Build AppImage
    appimage_name = f"crow-eye-marketing-tool-linux-v{APP_VERSION}.AppImage"
    try:
        subprocess.run([
            str(appimagetool_path),
            str(app_dir),
            f"{DIST_DIR}/{appimage_name}"
        ], check=True)
        
        print(f"✓ Linux AppImage built: {DIST_DIR}/{appimage_name}")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to build Linux AppImage: {e}")
        return False

def create_checksums():
    """Create checksum files for all built apps"""
    print("Creating checksums...")
    
    import hashlib
    
    for file_path in Path(DIST_DIR).glob("crow-eye-marketing-tool-*"):
        if file_path.is_file():
            # Calculate SHA256
            sha256_hash = hashlib.sha256()
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    sha256_hash.update(chunk)
            
            checksum = sha256_hash.hexdigest()
            
            # Write checksum file
            checksum_file = file_path.with_suffix(file_path.suffix + ".sha256")
            with open(checksum_file, "w") as f:
                f.write(f"{checksum}  {file_path.name}\n")
            
            print(f"✓ Checksum created: {checksum_file.name}")

def main():
    """Main build process"""
    print(f"Building {APP_NAME} v{APP_VERSION} desktop applications...")
    print(f"Platform: {platform.system()}")
    
    ensure_directories()
    install_dependencies()
    
    success_count = 0
    
    # Build for current platform and cross-platform where possible
    if platform.system() == "Windows":
        if build_windows_exe():
            success_count += 1
    elif platform.system() == "Darwin":
        if build_macos_app():
            success_count += 1
    elif platform.system() == "Linux":
        if build_linux_appimage():
            success_count += 1
    
    # Try to build Windows exe on any platform with wine
    if platform.system() != "Windows":
        print("Attempting cross-platform Windows build...")
        if build_windows_exe():
            success_count += 1
    
    create_checksums()
    
    print(f"\n✓ Build complete! {success_count} applications built.")
    print(f"Files available in: {DIST_DIR}/")
    
    # List built files
    for file_path in Path(DIST_DIR).glob("crow-eye-marketing-tool-*"):
        if file_path.is_file() and not file_path.name.endswith('.sha256'):
            size_mb = file_path.stat().st_size / (1024 * 1024)
            print(f"  - {file_path.name} ({size_mb:.1f} MB)")

if __name__ == "__main__":
    main() 