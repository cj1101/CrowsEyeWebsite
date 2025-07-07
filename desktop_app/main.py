#!/usr/bin/env python3
"""
🦅 Crow's Eye Marketing Suite - Desktop Application

Main entry point for the desktop application.
This provides a cross-platform GUI interface for the Crow's Eye Marketing Suite.

Features:
- AI-powered content generation
- Media management and processing
- Local data storage and sync
- Cross-platform compatibility (Windows, macOS, Linux)

Usage:
    python main.py
    python -m desktop_app
"""

import sys
import os
from pathlib import Path

# Add the src directory to the Python path
current_dir = Path(__file__).parent
src_dir = current_dir / "src"
sys.path.insert(0, str(src_dir))

def main():
    """Main entry point for the desktop application"""
    try:
        # Import and run the desktop application
        from src.core.app import main as app_main
        return app_main()
    except ImportError as e:
        print(f"❌ Failed to import desktop application: {e}")
        print("Make sure all dependencies are installed:")
        print("pip install -r requirements.txt")
        return 1
    except Exception as e:
        print(f"❌ Failed to start desktop application: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 