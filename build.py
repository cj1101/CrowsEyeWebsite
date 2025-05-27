#!/usr/bin/env python3
"""
Local build script for Crow's Eye Marketing Suite
Run this to test building installers locally before pushing to GitHub Actions
"""

import os
import sys
import subprocess
import platform
import shutil
from pathlib import Path

def run_command(cmd, cwd=None):
    """Run a command and return success status"""
    print(f"Running: {cmd}")
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, check=True, 
                              capture_output=True, text=True)
        print(f"✅ Success: {cmd}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed: {cmd}")
        print(f"Error: {e.stderr}")
        return False

def install_dependencies():
    """Install build dependencies"""
    print("📦 Installing build dependencies...")
    return run_command(f"{sys.executable} -m pip install -r requirements-build.txt")

def create_assets_if_missing():
    """Create basic assets if they don't exist"""
    assets_dir = Path("assets")
    assets_dir.mkdir(exist_ok=True)
    
    # Create a simple icon if none exists
    icon_files = {
        'icon.ico': 'Windows icon',
        'icon.icns': 'macOS icon', 
        'icon.png': 'Linux icon'
    }
    
    for icon_file, description in icon_files.items():
        icon_path = assets_dir / icon_file
        if not icon_path.exists():
            print(f"⚠️  Missing {description}: {icon_path}")
            print(f"   Please add a proper icon file at {icon_path}")

def build_with_pyinstaller():
    """Build using PyInstaller with the spec file"""
    print("🔨 Building with PyInstaller...")
    
    # Use the spec file if it exists, otherwise use basic command
    if Path("CrowsEye.spec").exists():
        return run_command(f"{sys.executable} -m PyInstaller CrowsEye.spec --clean")
    else:
        # Fallback to basic PyInstaller command
        icon_arg = ""
        if platform.system() == "Windows" and Path("assets/icon.ico").exists():
            icon_arg = "--icon=assets/icon.ico"
        elif platform.system() == "Darwin" and Path("assets/icon.icns").exists():
            icon_arg = "--icon=assets/icon.icns"
        
        cmd = f'{sys.executable} -m PyInstaller --onefile --windowed --name "CrowsEye" {icon_arg} main.py'
        return run_command(cmd)

def create_installer():
    """Create platform-specific installer"""
    system = platform.system()
    
    if system == "Windows":
        return create_windows_installer()
    elif system == "Darwin":
        return create_macos_installer()
    elif system == "Linux":
        return create_linux_installer()
    else:
        print(f"❌ Unsupported platform: {system}")
        return False

def create_windows_installer():
    """Create Windows NSIS installer"""
    print("🪟 Creating Windows installer...")
    
    # Check if NSIS is available
    if not shutil.which("makensis"):
        print("❌ NSIS not found. Please install NSIS from https://nsis.sourceforge.io/")
        print("   Or use the GitHub Actions workflow for automatic building")
        return False
    
    # Create basic NSIS script
    nsis_script = '''
; Crow's Eye Marketing Suite Installer
!define APPNAME "Crow's Eye Marketing Suite"
!define COMPANYNAME "Crow's Eye"
!define DESCRIPTION "AI-Powered Social Media Marketing Suite"

RequestExecutionLevel admin
InstallDir "$PROGRAMFILES\\${APPNAME}"
Name "${APPNAME}"
outFile "CrowsEye-Setup-Windows.exe"

page directory
page instfiles

section "install"
    setOutPath $INSTDIR
    file "dist\\CrowsEye.exe"
    writeUninstaller "$INSTDIR\\uninstall.exe"
    createDirectory "$SMPROGRAMS\\${APPNAME}"
    createShortCut "$SMPROGRAMS\\${APPNAME}\\${APPNAME}.lnk" "$INSTDIR\\CrowsEye.exe"
    createShortCut "$DESKTOP\\${APPNAME}.lnk" "$INSTDIR\\CrowsEye.exe"
sectionEnd

section "uninstall"
    delete "$INSTDIR\\CrowsEye.exe"
    delete "$INSTDIR\\uninstall.exe"
    rmDir "$INSTDIR"
    delete "$SMPROGRAMS\\${APPNAME}\\${APPNAME}.lnk"
    delete "$DESKTOP\\${APPNAME}.lnk"
    rmDir "$SMPROGRAMS\\${APPNAME}"
sectionEnd
'''
    
    with open("installer.nsi", "w") as f:
        f.write(nsis_script)
    
    return run_command("makensis installer.nsi")

def create_macos_installer():
    """Create macOS DMG installer"""
    print("🍎 Creating macOS installer...")
    
    try:
        import dmgbuild
    except ImportError:
        print("❌ dmgbuild not found. Installing...")
        if not run_command(f"{sys.executable} -m pip install dmgbuild"):
            return False
    
    # Create app bundle structure
    app_name = "Crow's Eye.app"
    if Path(app_name).exists():
        shutil.rmtree(app_name)
    
    os.makedirs(f"{app_name}/Contents/MacOS", exist_ok=True)
    os.makedirs(f"{app_name}/Contents/Resources", exist_ok=True)
    
    # Copy executable
    if Path("dist/CrowsEye").exists():
        shutil.copy("dist/CrowsEye", f"{app_name}/Contents/MacOS/")
    else:
        print("❌ CrowsEye executable not found in dist/")
        return False
    
    # Create Info.plist
    info_plist = '''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>CrowsEye</string>
    <key>CFBundleIdentifier</key>
    <string>tech.crowseye.marketing-suite</string>
    <key>CFBundleName</key>
    <string>Crow's Eye Marketing Suite</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>'''
    
    with open(f"{app_name}/Contents/Info.plist", "w") as f:
        f.write(info_plist)
    
    # Create DMG
    dmg_settings = f'''
application = "{app_name}"
appname = "Crow's Eye Marketing Suite"
format = 'UDBZ'
size = '100M'
files = [application]
symlinks = {{'Applications': '/Applications'}}
icon_locations = {{
    application: (100, 100),
    'Applications': (400, 100)
}}
window_rect = ((100, 100), (500, 300))
default_view = 'icon-view'
icon_size = 128
'''
    
    with open("dmg_settings.py", "w") as f:
        f.write(dmg_settings)
    
    return run_command('python -c "import dmgbuild; dmgbuild.build_dmg(\\"CrowsEye-Setup-macOS.dmg\\", \\"Crow\'s Eye Marketing Suite\\", \\"dmg_settings.py\\")"')

def create_linux_installer():
    """Create Linux AppImage"""
    print("🐧 Creating Linux AppImage...")
    print("ℹ️  For full AppImage creation, use the GitHub Actions workflow")
    print("   Local Linux builds will create a basic executable in dist/")
    return True

def main():
    """Main build process"""
    print("🚀 Starting Crow's Eye Marketing Suite build process...")
    print(f"Platform: {platform.system()} {platform.machine()}")
    
    # Check if main.py exists
    if not Path("main.py").exists():
        print("❌ main.py not found. Make sure you're in the correct directory.")
        return False
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Failed to install dependencies")
        return False
    
    # Check assets
    create_assets_if_missing()
    
    # Build with PyInstaller
    if not build_with_pyinstaller():
        print("❌ PyInstaller build failed")
        return False
    
    # Create installer
    if not create_installer():
        print("❌ Installer creation failed")
        return False
    
    print("✅ Build completed successfully!")
    print("\nGenerated files:")
    
    # List generated files
    dist_files = list(Path("dist").glob("*")) if Path("dist").exists() else []
    for file in dist_files:
        print(f"  📁 {file}")
    
    # List installer files
    installer_files = [
        "CrowsEye-Setup-Windows.exe",
        "CrowsEye-Setup-macOS.dmg", 
        "CrowsEye-Setup-Linux.AppImage"
    ]
    
    for installer in installer_files:
        if Path(installer).exists():
            print(f"  📦 {installer}")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 