#!/usr/bin/env python3
"""
Crow's Eye Marketing Suite - Desktop Application
Main entry point for the AI-powered social media marketing tool
"""

import sys
import os
import webbrowser
from pathlib import Path

def main():
    """
    Main entry point for Crow's Eye Marketing Suite
    
    This desktop application launches the web-based marketing suite
    in the user's default browser for the best experience.
    """
    
    print("🚀 Starting Crow's Eye Marketing Suite...")
    
    # URL of the web application
    web_app_url = "https://crows-eye-website.web.app"
    
    try:
        # Open the web application in the default browser
        print(f"📱 Opening Crow's Eye Marketing Suite at: {web_app_url}")
        webbrowser.open(web_app_url)
        
        print("✅ Crow's Eye Marketing Suite launched successfully!")
        print("💡 The application is now running in your web browser.")
        print("🔗 Bookmark the URL for quick access: https://crows-eye-website.web.app")
        
        # Keep the application running briefly to show the message
        input("\nPress Enter to close this launcher...")
        
    except Exception as e:
        print(f"❌ Error launching Crow's Eye Marketing Suite: {e}")
        print("🌐 Please manually visit: https://crows-eye-website.web.app")
        input("\nPress Enter to close...")
        sys.exit(1)

if __name__ == "__main__":
    main() 