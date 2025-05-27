#!/usr/bin/env python3
"""
Crow's Eye Desktop Application Installer
Automatically downloads and sets up the Crow's Eye marketing platform.
"""

import os
import sys
import subprocess
import urllib.request
import zipfile
import shutil
from pathlib import Path

def print_banner():
    """Print the installation banner."""
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║                    🐦‍⬛ Crow's Eye Installer                    ║
    ║              AI-Powered Marketing Automation                 ║
    ║                                                              ║
    ║  This installer will download and set up Crow's Eye         ║
    ║  desktop application with all required dependencies.        ║
    ╚══════════════════════════════════════════════════════════════╝
    """)

def check_python_version():
    """Check if Python version is compatible."""
    if sys.version_info < (3, 8):
        print("❌ Error: Python 3.8 or higher is required.")
        print(f"   Current version: {sys.version}")
        print("   Please upgrade Python and try again.")
        sys.exit(1)
    print(f"✅ Python {sys.version.split()[0]} detected")

def check_pip():
    """Check if pip is available."""
    try:
        subprocess.run([sys.executable, "-m", "pip", "--version"], 
                      check=True, capture_output=True)
        print("✅ pip is available")
        return True
    except subprocess.CalledProcessError:
        print("❌ Error: pip is not available")
        print("   Please install pip and try again.")
        return False

def download_and_extract():
    """Download and extract the Crow's Eye application."""
    print("\n📥 Downloading Crow's Eye from GitHub...")
    
    # Create installation directory
    install_dir = Path.home() / "CrowsEye"
    install_dir.mkdir(exist_ok=True)
    
    # Download URL
    download_url = "https://github.com/cj1101/offlineFinal/archive/refs/heads/main.zip"
    zip_path = install_dir / "crows-eye.zip"
    
    try:
        # Download with progress
        urllib.request.urlretrieve(download_url, zip_path)
        print("✅ Download completed")
        
        # Extract
        print("📦 Extracting files...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(install_dir)
        
        # Move files from subdirectory
        extracted_dir = install_dir / "offlineFinal-main"
        if extracted_dir.exists():
            for item in extracted_dir.iterdir():
                shutil.move(str(item), str(install_dir))
            extracted_dir.rmdir()
        
        # Clean up zip file
        zip_path.unlink()
        print("✅ Extraction completed")
        
        return install_dir
        
    except Exception as e:
        print(f"❌ Error downloading/extracting: {e}")
        return None

def install_dependencies(install_dir):
    """Install Python dependencies."""
    print("\n📦 Installing dependencies...")
    
    requirements_file = install_dir / "deployment" / "requirements.txt"
    if not requirements_file.exists():
        print("❌ Error: requirements.txt not found")
        return False
    
    try:
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
        ], check=True)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

def create_launcher_scripts(install_dir):
    """Create launcher scripts for different platforms."""
    print("\n🚀 Creating launcher scripts...")
    
    # Windows batch file
    if os.name == 'nt':
        batch_content = f"""@echo off
cd /d "{install_dir}"
python main.py
pause
"""
        batch_path = install_dir / "launch_crows_eye.bat"
        with open(batch_path, 'w') as f:
            f.write(batch_content)
        print("✅ Windows launcher created: launch_crows_eye.bat")
    
    # Unix shell script
    else:
        shell_content = f"""#!/bin/bash
cd "{install_dir}"
python3 main.py
"""
        shell_path = install_dir / "launch_crows_eye.sh"
        with open(shell_path, 'w') as f:
            f.write(shell_content)
        os.chmod(shell_path, 0o755)
        print("✅ Unix launcher created: launch_crows_eye.sh")

def create_desktop_shortcut(install_dir):
    """Create desktop shortcut (Windows only for now)."""
    if os.name == 'nt':
        try:
            import winshell
            from win32com.client import Dispatch
            
            desktop = winshell.desktop()
            shortcut_path = os.path.join(desktop, "Crow's Eye.lnk")
            
            shell = Dispatch('WScript.Shell')
            shortcut = shell.CreateShortCut(shortcut_path)
            shortcut.Targetpath = str(install_dir / "launch_crows_eye.bat")
            shortcut.WorkingDirectory = str(install_dir)
            shortcut.IconLocation = str(install_dir / "assets" / "icons" / "app_icon.ico")
            shortcut.save()
            
            print("✅ Desktop shortcut created")
        except ImportError:
            print("ℹ️  Desktop shortcut creation skipped (requires pywin32)")
        except Exception as e:
            print(f"⚠️  Could not create desktop shortcut: {e}")

def main():
    """Main installation function."""
    print_banner()
    
    # Check system requirements
    print("🔍 Checking system requirements...")
    check_python_version()
    
    if not check_pip():
        sys.exit(1)
    
    # Download and extract
    install_dir = download_and_extract()
    if not install_dir:
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies(install_dir):
        sys.exit(1)
    
    # Create launchers
    create_launcher_scripts(install_dir)
    
    # Create desktop shortcut (optional)
    create_desktop_shortcut(install_dir)
    
    # Success message
    print(f"""
    ╔══════════════════════════════════════════════════════════════╗
    ║                    🎉 Installation Complete!                ║
    ║                                                              ║
    ║  Crow's Eye has been installed to:                          ║
    ║  {str(install_dir):<58} ║
    ║                                                              ║
    ║  To start the application:                                   ║
    ║  • Double-click the launcher script in the install folder   ║
    ║  • Or run: python main.py from the install directory        ║
    ║                                                              ║
    ║  Need help? Visit: https://github.com/cj1101/offlineFinal   ║
    ╚══════════════════════════════════════════════════════════════╝
    """)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Installation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        print("Please report this issue on GitHub: https://github.com/cj1101/offlineFinal")
        sys.exit(1) 