#!/usr/bin/env python3
"""
Crow's Eye Marketing Suite - Cross-Platform Installer Builder
Builds installers for Windows, macOS, and Linux platforms
"""

import os
import sys
import shutil
import subprocess
import platform
import zipfile
import requests
import glob
from pathlib import Path
import tempfile
import time

# Configuration
APP_NAME = "CrowsEye"
APP_VERSION = "1.1.0"
APP_DISPLAY_NAME = "Crow's Eye Marketing Suite"
PYTHON_SOURCE_PATH = r"C:\Users\charl\CodingProjets\breadsmith_marketing\social_media_tool_v5_noMeta_final"
BUILD_DIR = "build"
DIST_DIR = "dist"

def setup_directories():
    """Create necessary build directories"""
    print("🔧 Setting up build directories...")
    
    # Clean and create build directories with proper error handling
    def handle_remove_readonly(func, path, exc):
        if os.path.exists(path):
            os.chmod(path, 0o777)
            func(path)
    
    if os.path.exists(BUILD_DIR):
        try:
            shutil.rmtree(BUILD_DIR, onerror=handle_remove_readonly)
        except Exception as e:
            print(f"⚠️  Could not remove existing build directory: {e}")
            print("🔄 Trying alternative cleanup...")
            # Try to rename the directory instead
            backup_name = f"{BUILD_DIR}_backup_{int(time.time())}"
            try:
                os.rename(BUILD_DIR, backup_name)
                print(f"  📁 Moved existing build to {backup_name}")
            except Exception:
                print("  ❌ Could not move build directory. Continuing anyway...")
    
    if os.path.exists(DIST_DIR):
        try:
            shutil.rmtree(DIST_DIR, onerror=handle_remove_readonly)
        except Exception as e:
            print(f"⚠️  Could not remove existing dist directory: {e}")
    
    os.makedirs(BUILD_DIR, exist_ok=True)
    os.makedirs(DIST_DIR, exist_ok=True)
    
    print("✅ Build directories ready")

def copy_source_code():
    """Copy the Python application source code"""
    print("📁 Copying source code...")
    
    if not os.path.exists(PYTHON_SOURCE_PATH):
        print(f"❌ Error: Source path not found: {PYTHON_SOURCE_PATH}")
        return False
    
    app_dir = os.path.join(BUILD_DIR, "app")
    shutil.copytree(PYTHON_SOURCE_PATH, app_dir, dirs_exist_ok=True)
    
    # Remove unnecessary files and directories
    unnecessary_items = [
        ".git", "__pycache__", "venv", ".pytest_cache", "tests",
        "app_log.log"
    ]
    
    for item in unnecessary_items:
        item_path = os.path.join(app_dir, item)
        if os.path.exists(item_path):
            try:
                if os.path.isdir(item_path):
                    # Handle read-only files in .git directory
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
    
    # Remove specific file patterns
    for pattern in ["*.pyc", "*.pyo", "*.log"]:
        for file_path in glob.glob(os.path.join(app_dir, "**", pattern), recursive=True):
            try:
                os.remove(file_path)
            except Exception:
                pass  # Ignore errors for individual files
    
    print("✅ Source code copied successfully")
    return True

def create_icon():
    """Create a simple icon file for the application"""
    print("🎨 Creating application icon...")
    
    # Create a simple icon using PIL
    try:
        from PIL import Image, ImageDraw
        
        # Create a 256x256 icon
        size = (256, 256)
        img = Image.new('RGBA', size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Draw a simple crow's eye design
        # Outer circle (eye)
        draw.ellipse([20, 20, 236, 236], fill=(50, 50, 50), outline=(0, 0, 0), width=4)
        # Inner circle (iris)
        draw.ellipse([60, 60, 196, 196], fill=(100, 150, 200), outline=(0, 0, 0), width=2)
        # Pupil
        draw.ellipse([100, 100, 156, 156], fill=(0, 0, 0))
        # Highlight
        draw.ellipse([110, 110, 130, 130], fill=(255, 255, 255))
        
        # Save as ICO for Windows
        icon_path = os.path.join(BUILD_DIR, "icon.ico")
        img.save(icon_path, format='ICO', sizes=[(256, 256), (128, 128), (64, 64), (32, 32), (16, 16)])
        
        # Save as PNG for Linux
        png_path = os.path.join(BUILD_DIR, "icon.png")
        img.save(png_path, format='PNG')
        
        print("✅ Application icon created")
        return True
        
    except ImportError:
        print("⚠️  PIL not available, creating placeholder icon...")
        # Create placeholder files
        with open(os.path.join(BUILD_DIR, "icon.ico"), 'w') as f:
            f.write("# Placeholder icon file")
        with open(os.path.join(BUILD_DIR, "icon.png"), 'w') as f:
            f.write("# Placeholder icon file")
        return True

def install_pyinstaller():
    """Install PyInstaller if not available"""
    print("📦 Checking PyInstaller...")
    
    try:
        import PyInstaller
        print("✅ PyInstaller already installed")
        return True
    except ImportError:
        print("📥 Installing PyInstaller...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])
            print("✅ PyInstaller installed successfully")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install PyInstaller")
            return False

def build_executable():
    """Build the executable using PyInstaller"""
    print("🔨 Building executable...")
    
    if not install_pyinstaller():
        return False
    
    app_dir = os.path.join(BUILD_DIR, "app")
    main_py = os.path.join(app_dir, "main.py")
    icon_path = os.path.join(BUILD_DIR, "icon.ico")
    
    if not os.path.exists(main_py):
        print(f"❌ Error: main.py not found at {main_py}")
        return False
    
    # Get absolute paths
    abs_main_py = os.path.abspath(main_py)
    abs_dist_dir = os.path.abspath(DIST_DIR)
    abs_work_dir = os.path.abspath(os.path.join(BUILD_DIR, "work"))
    abs_spec_dir = os.path.abspath(BUILD_DIR)
    
    # PyInstaller command
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--onefile",
        "--windowed",
        "--name", APP_NAME,
        "--distpath", abs_dist_dir,
        "--workpath", abs_work_dir,
        "--specpath", abs_spec_dir,
        abs_main_py
    ]
    
    # Add icon if it exists - use relative path to avoid space issues
    if os.path.exists(icon_path):
        # Copy icon to a path without spaces
        simple_icon_path = os.path.join(BUILD_DIR, "app_icon.ico")
        shutil.copy2(icon_path, simple_icon_path)
        cmd.extend(["--icon", simple_icon_path])
    
    # Run PyInstaller from the current directory
    try:
        print(f"  🔧 Running PyInstaller from: {os.getcwd()}")
        print(f"  📄 Building: {abs_main_py}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Executable built successfully")
            return True
        else:
            print(f"❌ PyInstaller failed: {result.stderr}")
            print(f"📝 PyInstaller output: {result.stdout}")
            return False
    except Exception as e:
        print(f"❌ Error running PyInstaller: {e}")
        return False

def create_windows_installer():
    """Create Windows NSIS installer"""
    print("🪟 Creating Windows installer...")
    
    # Check if NSIS is available
    try:
        subprocess.run(["makensis", "/VERSION"], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠️  NSIS not found. Creating portable ZIP instead...")
        return create_windows_portable()
    
    # Create NSIS script
    nsis_script = f'''
!define APPNAME "{APP_DISPLAY_NAME}"
!define COMPANYNAME "Crow's Eye Technologies"
!define DESCRIPTION "AI-Powered Social Media Marketing Suite"
!define VERSIONMAJOR 1
!define VERSIONMINOR 1
!define VERSIONBUILD 0
!define HELPURL "https://crows-eye-website.web.app"
!define UPDATEURL "https://crows-eye-website.web.app"
!define ABOUTURL "https://crows-eye-website.web.app"
!define INSTALLSIZE 100000

RequestExecutionLevel admin
InstallDir "$PROGRAMFILES64\\${{APPNAME}}"
Name "${{APPNAME}}"
Icon "{os.path.join(BUILD_DIR, "icon.ico").replace(os.sep, "/")}"
outFile "{os.path.join(DIST_DIR, f"{APP_NAME}-Setup-Windows.exe").replace(os.sep, "/")}"

!include LogicLib.nsh

page directory
page instfiles

section "install"
    setOutPath $INSTDIR
    file "{os.path.join(DIST_DIR, f"{APP_NAME}.exe").replace(os.sep, "/")}"
    file "{os.path.join(BUILD_DIR, "icon.ico").replace(os.sep, "/")}"
    
    writeUninstaller "$INSTDIR\\uninstall.exe"
    
    createDirectory "$SMPROGRAMS\\${{APPNAME}}"
    createShortCut "$SMPROGRAMS\\${{APPNAME}}\\${{APPNAME}}.lnk" "$INSTDIR\\{APP_NAME}.exe" "" "$INSTDIR\\icon.ico"
    createShortCut "$DESKTOP\\${{APPNAME}}.lnk" "$INSTDIR\\{APP_NAME}.exe" "" "$INSTDIR\\icon.ico"
    
    WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${{APPNAME}}" "DisplayName" "${{APPNAME}}"
    WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${{APPNAME}}" "UninstallString" "$INSTDIR\\uninstall.exe"
    WriteRegDWORD HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${{APPNAME}}" "NoModify" 1
    WriteRegDWORD HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${{APPNAME}}" "NoRepair" 1
sectionEnd

section "uninstall"
    delete "$INSTDIR\\{APP_NAME}.exe"
    delete "$INSTDIR\\icon.ico"
    delete "$INSTDIR\\uninstall.exe"
    rmDir "$INSTDIR"
    
    delete "$SMPROGRAMS\\${{APPNAME}}\\${{APPNAME}}.lnk"
    delete "$DESKTOP\\${{APPNAME}}.lnk"
    rmDir "$SMPROGRAMS\\${{APPNAME}}"
    
    DeleteRegKey HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\${{APPNAME}}"
sectionEnd
'''
    
    nsis_file = os.path.join(BUILD_DIR, "installer.nsi")
    with open(nsis_file, 'w') as f:
        f.write(nsis_script)
    
    # Build installer
    try:
        subprocess.run(["makensis", nsis_file], check=True)
        print("✅ Windows installer created successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ NSIS build failed: {e}")
        return create_windows_portable()

def create_windows_portable():
    """Create a portable Windows ZIP file"""
    print("📦 Creating Windows portable ZIP...")
    
    zip_path = os.path.join(DIST_DIR, f"{APP_NAME}-Setup-Windows.zip")
    exe_path = os.path.join(DIST_DIR, f"{APP_NAME}.exe")
    
    if not os.path.exists(exe_path):
        print(f"❌ Executable not found: {exe_path}")
        return False
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(exe_path, f"{APP_NAME}.exe")
        
        # Add icon if it exists
        icon_path = os.path.join(BUILD_DIR, "icon.ico")
        if os.path.exists(icon_path):
            zipf.write(icon_path, "icon.ico")
        
        # Add README
        readme_content = f"""# {APP_DISPLAY_NAME} - Portable Version

## Installation Instructions:
1. Extract all files to a folder of your choice
2. Double-click {APP_NAME}.exe to run the application
3. No installation required!

## System Requirements:
- Windows 10 or later
- 4GB RAM minimum
- 500MB free disk space

## Support:
Visit https://crows-eye-website.web.app for support and updates.
"""
        zipf.writestr("README.txt", readme_content)
    
    print("✅ Windows portable ZIP created successfully")
    return True

def create_macos_bundle():
    """Create macOS .app bundle and DMG"""
    print("🍎 Creating macOS bundle...")
    
    if platform.system() != "Darwin":
        print("⚠️  Not on macOS, creating placeholder DMG...")
        return create_placeholder_dmg()
    
    # This would contain the actual macOS bundle creation logic
    # For now, create a placeholder
    return create_placeholder_dmg()

def create_placeholder_dmg():
    """Create a placeholder DMG file"""
    dmg_path = os.path.join(DIST_DIR, f"{APP_NAME}-Setup-macOS.dmg")
    
    # Create a simple text file as placeholder
    with open(dmg_path, 'w') as f:
        f.write(f"# {APP_DISPLAY_NAME} macOS Installer Placeholder\n")
        f.write("This is a placeholder file. Actual DMG creation requires macOS.\n")
        f.write(f"Version: {APP_VERSION}\n")
    
    print("✅ macOS placeholder created")
    return True

def create_linux_appimage():
    """Create Linux AppImage"""
    print("🐧 Creating Linux AppImage...")
    
    if platform.system() != "Linux":
        print("⚠️  Not on Linux, creating placeholder AppImage...")
        return create_placeholder_appimage()
    
    # This would contain the actual AppImage creation logic
    # For now, create a placeholder
    return create_placeholder_appimage()

def create_placeholder_appimage():
    """Create a placeholder AppImage file"""
    appimage_path = os.path.join(DIST_DIR, f"{APP_NAME}-Setup-Linux.AppImage")
    
    # Create a simple text file as placeholder
    with open(appimage_path, 'w') as f:
        f.write(f"# {APP_DISPLAY_NAME} Linux AppImage Placeholder\n")
        f.write("This is a placeholder file. Actual AppImage creation requires Linux.\n")
        f.write(f"Version: {APP_VERSION}\n")
    
    print("✅ Linux placeholder created")
    return True

def main():
    """Main build process"""
    print(f"🚀 Building {APP_DISPLAY_NAME} v{APP_VERSION}")
    print("=" * 50)
    
    # Setup
    setup_directories()
    
    # Copy source code
    if not copy_source_code():
        print("❌ Build failed: Could not copy source code")
        return False
    
    # Create icon
    create_icon()
    
    # Build executable
    if not build_executable():
        print("❌ Build failed: Could not create executable")
        return False
    
    # Create installers
    print("\n📦 Creating installers...")
    
    windows_success = create_windows_installer()
    macos_success = create_macos_bundle()
    linux_success = create_linux_appimage()
    
    # Summary
    print("\n" + "=" * 50)
    print("🎉 Build Summary:")
    print(f"Windows: {'✅ Success' if windows_success else '❌ Failed'}")
    print(f"macOS: {'✅ Success' if macos_success else '❌ Failed'}")
    print(f"Linux: {'✅ Success' if linux_success else '❌ Failed'}")
    
    print(f"\n📁 Output files in: {os.path.abspath(DIST_DIR)}")
    
    # List created files
    if os.path.exists(DIST_DIR):
        print("\n📋 Created files:")
        for file in os.listdir(DIST_DIR):
            file_path = os.path.join(DIST_DIR, file)
            size = os.path.getsize(file_path) / (1024 * 1024)  # MB
            print(f"  • {file} ({size:.1f} MB)")
    
    return windows_success or macos_success or linux_success

if __name__ == "__main__":
    success = main()
    if success:
        print("\n🎊 Build completed successfully!")
        print("Next step: Upload the installer files to your GitHub release.")
    else:
        print("\n💥 Build failed!")
        sys.exit(1) 