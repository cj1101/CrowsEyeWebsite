#!/usr/bin/env python3
"""
Desktop Application Installer Creator
Creates cross-platform installers for the Crow's Eye Marketing Suite desktop application
"""

import os
import sys
import shutil
import zipfile
import platform
import subprocess
from pathlib import Path

# Configuration
SOURCE_APP_PATH = r"C:\Users\charl\CodingProjets\breadsmith_marketing\social_media_tool_v5_noMeta_final"
DEST_DIR = "desktop_installers"
APP_NAME = "CrowsEye_Marketing_Suite"
VERSION = "1.0.0"

def create_directory_structure():
    """Create the directory structure for installers"""
    print("📁 Creating directory structure...")
    
    # Create main directories
    dirs = [
        DEST_DIR,
        f"{DEST_DIR}/windows",
        f"{DEST_DIR}/macos", 
        f"{DEST_DIR}/linux",
        f"{DEST_DIR}/source"
    ]
    
    for dir_path in dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        print(f"   ✓ Created {dir_path}")

def copy_source_application():
    """Copy the source application to the installer directory"""
    print("📦 Copying source application...")
    
    if not os.path.exists(SOURCE_APP_PATH):
        print(f"❌ Source application not found at: {SOURCE_APP_PATH}")
        return False
    
    dest_source = f"{DEST_DIR}/source"
    
    # Copy the entire application
    try:
        # Remove existing destination if it exists
        if os.path.exists(dest_source):
            shutil.rmtree(dest_source)
        
        shutil.copytree(SOURCE_APP_PATH, dest_source, 
                       ignore=shutil.ignore_patterns('__pycache__', '*.pyc', '.git', 'venv', '.env'))
        print(f"   ✓ Copied application to {dest_source}")
        return True
    except Exception as e:
        print(f"❌ Failed to copy application: {e}")
        return False

def create_launcher_scripts():
    """Create launcher scripts for different platforms"""
    print("🚀 Creating launcher scripts...")
    
    # Windows launcher (.bat)
    windows_launcher = f"""@echo off
title Crow's Eye Marketing Suite
echo 🦅 Crow's Eye Marketing Suite - Desktop Application
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.11+ from https://python.org
    pause
    exit /b 1
)

REM Check Python version
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo ✅ Python %PYTHON_VERSION% detected

REM Install dependencies
echo 📦 Installing dependencies...
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Launch application
echo 🚀 Launching Crow's Eye Marketing Suite...
python run.py
pause
"""
    
    # macOS/Linux launcher (.sh)
    unix_launcher = f"""#!/bin/bash
echo "🦅 Crow's Eye Marketing Suite - Desktop Application"
echo "================================================"
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    echo "Please install Python 3.11+ from https://python.org"
    read -p "Press Enter to exit..."
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1)
echo "✅ $PYTHON_VERSION detected"

# Install dependencies
echo "📦 Installing dependencies..."
python3 -m pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    read -p "Press Enter to exit..."
    exit 1
fi

# Launch application
echo "🚀 Launching Crow's Eye Marketing Suite..."
python3 run.py
"""
    
    # Write launcher scripts
    with open(f"{DEST_DIR}/source/launch_windows.bat", "w", encoding="utf-8") as f:
        f.write(windows_launcher)
    
    with open(f"{DEST_DIR}/source/launch_unix.sh", "w", encoding="utf-8") as f:
        f.write(unix_launcher)
    
    # Make Unix launcher executable
    try:
        os.chmod(f"{DEST_DIR}/source/launch_unix.sh", 0o755)
    except:
        pass  # Might fail on Windows, that's OK
    
    print("   ✓ Created Windows launcher (launch_windows.bat)")
    print("   ✓ Created Unix launcher (launch_unix.sh)")

def create_readme():
    """Create installation README"""
    print("📝 Creating installation README...")
    
    readme_content = f"""# 🦅 Crow's Eye Marketing Suite - Desktop Application

**Version {VERSION}**

## 🚀 Quick Start

### Windows Users
1. Double-click `launch_windows.bat`
2. Follow the on-screen instructions
3. The application will install dependencies and launch automatically

### macOS/Linux Users
1. Open Terminal in this directory
2. Run: `./launch_unix.sh`
3. Follow the on-screen instructions
4. The application will install dependencies and launch automatically

### Manual Installation
If the launchers don't work, you can install manually:

1. **Install Python 3.11+** from https://python.org
2. **Install dependencies**: `pip install -r requirements.txt`
3. **Run application**: `python run.py`

## 🔧 System Requirements

- **Python**: 3.11 or higher
- **RAM**: 4GB minimum, 8GB recommended  
- **Storage**: 1GB free space
- **Internet**: Required for AI features and updates

## 🌐 Platform Support

✅ **Supported Platforms:**
- Instagram
- Facebook  
- BlueSky
- Google My Business
- TikTok
- YouTube

❌ **Deprecated Platforms:**
- Twitter/X (replaced with BlueSky)
- LinkedIn (replaced with Google My Business)

## 🔥 Super User Features

Users with "jamal" or "aperion" in their email or display name get enhanced privileges:
- Advanced AI models
- Priority support
- Enhanced analytics
- Custom integrations

## 🆘 Troubleshooting

**Application won't start:**
- Ensure Python 3.11+ is installed
- Check internet connection
- Try running from command line to see errors

**AI features not working:**
- Configure API keys in Settings tab
- Ensure API keys have sufficient credits
- Check internet connection

**Permission errors:**
- Run as administrator (Windows) or with sudo (Linux/macOS)
- Check file permissions in application directory

## 📞 Support

- **Website**: https://crowseye.tech
- **Email**: help@crowseye.tech
- **Issues**: Report bugs via the web application

---

**Copyright © 2024 Crow's Eye Marketing Suite. All rights reserved.**
"""
    
    with open(f"{DEST_DIR}/source/README.md", "w", encoding="utf-8") as f:
        f.write(readme_content)
    
    print("   ✓ Created README.md")

def create_zip_packages():
    """Create ZIP packages for distribution"""
    print("📦 Creating distribution packages...")
    
    # Create ZIP for each platform
    platforms = [
        ("windows", "Windows"),
        ("macos", "macOS"), 
        ("linux", "Linux"),
        ("source", "Source")
    ]
    
    for platform_dir, platform_name in platforms:
        zip_filename = f"{DEST_DIR}/{APP_NAME}_{VERSION}_{platform_name}.zip"
        
        with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
            source_dir = f"{DEST_DIR}/source"
            
            for root, dirs, files in os.walk(source_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arc_name = os.path.relpath(file_path, source_dir)
                    zipf.write(file_path, arc_name)
        
        print(f"   ✓ Created {zip_filename}")

def create_web_download_links():
    """Create a file with download links for the web application"""
    print("🌐 Creating web download configuration...")
    
    download_config = {
        "version": VERSION,
        "downloads": {
            "windows": f"{APP_NAME}_{VERSION}_Windows.zip",
            "macos": f"{APP_NAME}_{VERSION}_macOS.zip", 
            "linux": f"{APP_NAME}_{VERSION}_Linux.zip",
            "source": f"{APP_NAME}_{VERSION}_Source.zip"
        },
        "requirements": {
            "python": "3.11+",
            "ram": "4GB minimum, 8GB recommended",
            "storage": "1GB free space",
            "internet": "Required for AI features"
        },
        "platforms": {
            "supported": ["Instagram", "Facebook", "BlueSky", "Google My Business", "TikTok", "YouTube"],
            "deprecated": ["Twitter/X", "LinkedIn"]
        }
    }
    
    import json
    with open(f"{DEST_DIR}/download_config.json", "w", encoding="utf-8") as f:
        json.dump(download_config, f, indent=2)
    
    print("   ✓ Created download_config.json")

def update_marketing_tool_downloads():
    """Update the marketing tool component with real download functionality"""
    print("🔄 Updating marketing tool component...")
    
    # Create a JavaScript file that can be imported to handle downloads
    download_handler = f"""// Desktop Application Download Handler
// Generated by create_desktop_installer.py

export const DESKTOP_APP_CONFIG = {{
  version: "{VERSION}",
  downloads: {{
    windows: "{APP_NAME}_{VERSION}_Windows.zip",
    macos: "{APP_NAME}_{VERSION}_macOS.zip",
    linux: "{APP_NAME}_{VERSION}_Linux.zip",
    source: "{APP_NAME}_{VERSION}_Source.zip"
  }},
  baseUrl: "/downloads/desktop/"
}};

export function downloadDesktopApp(platform) {{
  const config = DESKTOP_APP_CONFIG;
  const filename = config.downloads[platform.toLowerCase()];
  
  if (!filename) {{
    alert(`Download not available for ${{platform}}`);
    return;
  }}
  
  // Create download link
  const link = document.createElement('a');
  link.href = config.baseUrl + filename;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Track download
  console.log(`Desktop app download initiated: ${{platform}} - ${{filename}}`);
}}

export function checkSuperUser() {{
  // Check if user has jamal or aperion in email/name for super user access
  const userEmail = localStorage.getItem('userEmail') || '';
  const userName = localStorage.getItem('userName') || '';
  return userEmail.toLowerCase().includes('jamal') || 
         userEmail.toLowerCase().includes('aperion') ||
         userName.toLowerCase().includes('jamal') || 
         userName.toLowerCase().includes('aperion');
}}
"""
    
    with open("src/utils/desktopDownloads.js", "w", encoding="utf-8") as f:
        f.write(download_handler)
    
    print("   ✓ Created src/utils/desktopDownloads.js")

def main():
    """Main installer creation process"""
    print("🦅 Crow's Eye Marketing Suite - Desktop Installer Creator")
    print("=" * 60)
    print()
    
    try:
        # Step 1: Create directory structure
        create_directory_structure()
        print()
        
        # Step 2: Copy source application
        if not copy_source_application():
            return 1
        print()
        
        # Step 3: Create launcher scripts
        create_launcher_scripts()
        print()
        
        # Step 4: Create README
        create_readme()
        print()
        
        # Step 5: Create ZIP packages
        create_zip_packages()
        print()
        
        # Step 6: Create web download configuration
        create_web_download_links()
        print()
        
        # Step 7: Update marketing tool component
        update_marketing_tool_downloads()
        print()
        
        print("✅ Desktop installer creation completed successfully!")
        print()
        print("📁 Generated files:")
        print(f"   • {DEST_DIR}/")
        print(f"     ├── {APP_NAME}_{VERSION}_Windows.zip")
        print(f"     ├── {APP_NAME}_{VERSION}_macOS.zip") 
        print(f"     ├── {APP_NAME}_{VERSION}_Linux.zip")
        print(f"     ├── {APP_NAME}_{VERSION}_Source.zip")
        print(f"     └── download_config.json")
        print()
        print("🌐 Web integration:")
        print("   • src/utils/desktopDownloads.js")
        print()
        print("📋 Next steps:")
        print("   1. Copy ZIP files to public/downloads/desktop/ directory")
        print("   2. Update marketing tool component to use real downloads")
        print("   3. Test downloads on different platforms")
        print("   4. Deploy updated web application")
        
        return 0
        
    except Exception as e:
        print(f"❌ Error creating desktop installer: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 