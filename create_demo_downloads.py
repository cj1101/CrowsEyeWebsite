#!/usr/bin/env python3
"""
Create demo download files for the desktop application
This creates placeholder ZIP files until the real installers are ready
"""

import os
import zipfile
from pathlib import Path

def create_demo_downloads():
    """Create demo download files"""
    print("🦅 Creating demo desktop application downloads...")
    
    # Ensure downloads directory exists
    downloads_dir = Path("public/downloads/desktop")
    downloads_dir.mkdir(parents=True, exist_ok=True)
    
    # Demo content for each platform
    platforms = {
        "Windows": {
            "filename": "CrowsEye_Marketing_Suite_1.0.0_Windows.zip",
            "launcher": "launch_windows.bat",
            "launcher_content": """@echo off
title Crow's Eye Marketing Suite
echo 🦅 Crow's Eye Marketing Suite - Desktop Application
echo ================================================
echo.
echo This is a demo version. The full application will be available soon!
echo.
echo Features:
echo - AI-powered content generation
echo - Multi-platform social media support
echo - Advanced scheduling and automation
echo - Super user features for jamal/aperion users
echo.
echo Platform Support:
echo ✓ Instagram, Facebook, BlueSky, Google My Business, TikTok, YouTube
echo ❌ Twitter/X and LinkedIn (deprecated)
echo.
pause
"""
        },
        "macOS": {
            "filename": "CrowsEye_Marketing_Suite_1.0.0_macOS.zip",
            "launcher": "launch_macos.sh",
            "launcher_content": """#!/bin/bash
echo "🦅 Crow's Eye Marketing Suite - Desktop Application"
echo "================================================"
echo
echo "This is a demo version. The full application will be available soon!"
echo
echo "Features:"
echo "- AI-powered content generation"
echo "- Multi-platform social media support"
echo "- Advanced scheduling and automation"
echo "- Super user features for jamal/aperion users"
echo
echo "Platform Support:"
echo "✓ Instagram, Facebook, BlueSky, Google My Business, TikTok, YouTube"
echo "❌ Twitter/X and LinkedIn (deprecated)"
echo
read -p "Press Enter to exit..."
"""
        },
        "Linux": {
            "filename": "CrowsEye_Marketing_Suite_1.0.0_Linux.zip",
            "launcher": "launch_linux.sh",
            "launcher_content": """#!/bin/bash
echo "🦅 Crow's Eye Marketing Suite - Desktop Application"
echo "================================================"
echo
echo "This is a demo version. The full application will be available soon!"
echo
echo "Features:"
echo "- AI-powered content generation"
echo "- Multi-platform social media support"
echo "- Advanced scheduling and automation"
echo "- Super user features for jamal/aperion users"
echo
echo "Platform Support:"
echo "✓ Instagram, Facebook, BlueSky, Google My Business, TikTok, YouTube"
echo "❌ Twitter/X and LinkedIn (deprecated)"
echo
read -p "Press Enter to exit..."
"""
        },
        "Source": {
            "filename": "CrowsEye_Marketing_Suite_1.0.0_Source.zip",
            "launcher": "README.md",
            "launcher_content": """# 🦅 Crow's Eye Marketing Suite - Desktop Application (Demo)

**Version 1.0.0 - Demo Release**

## 🚀 Quick Start

This is a demo version of the Crow's Eye Marketing Suite desktop application.
The full application will be available soon!

### Features
- 🤖 AI-powered content generation (OpenAI GPT-4, Google Gemini)
- 📱 Multi-platform social media support
- 📅 Advanced scheduling and automation
- 🔥 Super user features for users with "jamal" or "aperion" in email/name

### Platform Support

✅ **Supported Platforms:**
- Instagram
- Facebook
- BlueSky (replaces Twitter/X)
- Google My Business (replaces LinkedIn)
- TikTok
- YouTube

❌ **Deprecated Platforms:**
- Twitter/X (replaced with BlueSky)
- LinkedIn (replaced with Google My Business)

### System Requirements
- Python 3.11+
- 4GB RAM minimum, 8GB recommended
- 1GB free disk space
- Internet connection for AI features

### Installation (Coming Soon)
1. Download the appropriate installer for your platform
2. Extract and run the launcher script
3. Follow the setup instructions
4. Configure your API keys for enhanced functionality

### Super User Features
Users with "jamal" or "aperion" in their email or display name get enhanced privileges:
- Advanced AI models
- Priority support
- Enhanced analytics
- Custom integrations

## 📞 Support
- **Website**: https://crowseye.tech
- **Email**: help@crowseye.tech

---
**Copyright © 2024 Crow's Eye Marketing Suite. All rights reserved.**
"""
        }
    }
    
    # Create ZIP files for each platform
    for platform_name, platform_data in platforms.items():
        zip_path = downloads_dir / platform_data["filename"]
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Add the launcher/readme file
            zipf.writestr(platform_data["launcher"], platform_data["launcher_content"])
            
            # Add a demo requirements.txt
            requirements_content = """# Crow's Eye Marketing Suite - Demo Requirements
# This is a demo version. Full requirements will be available with the real release.

# Core dependencies (demo)
requests>=2.31.0
python-dateutil>=2.8.0

# AI dependencies (demo)
# openai>=1.3.0  # Uncomment when ready
# google-generativeai>=0.3.0  # Uncomment when ready

# GUI dependencies (demo)
# PySide6>=6.9.0  # Uncomment when ready

# Note: This is a demo version. The full application will include all necessary dependencies.
"""
            zipf.writestr("requirements.txt", requirements_content)
            
            # Add demo info file
            info_content = f"""Crow's Eye Marketing Suite - {platform_name} Demo

This is a demo version of the desktop application.
The full version will include:

- Complete Python application with PySide6 GUI
- AI-powered content generation
- Multi-platform social media integration
- Advanced scheduling and automation
- Cross-platform compatibility

Platform: {platform_name}
Version: 1.0.0 (Demo)
Release Date: Coming Soon

For updates, visit: https://crowseye.tech
"""
            zipf.writestr("DEMO_INFO.txt", info_content)
        
        print(f"   ✓ Created {platform_data['filename']} ({zip_path.stat().st_size} bytes)")
    
    print(f"\n✅ Demo downloads created in {downloads_dir}")
    print("\n📋 Next steps:")
    print("1. Test the download functionality in the web application")
    print("2. Replace demo files with real installers when ready")
    print("3. Update download URLs if needed")

if __name__ == "__main__":
    create_demo_downloads() 