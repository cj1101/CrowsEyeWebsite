#!/usr/bin/env python3
"""
Crow's Eye Marketing Suite - Desktop Application Launcher
Simple launcher with dependency checking and error handling
"""

import sys
import subprocess
import importlib.util
import platform

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python 3.8+ required. Current: {version.major}.{version.minor}")
        print("Please upgrade Python and try again.")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
    return True

def check_dependency(package_name, import_name=None):
    """Check if a package is installed"""
    if import_name is None:
        import_name = package_name
    
    spec = importlib.util.find_spec(import_name)
    if spec is None:
        return False
    return True

def install_dependencies():
    """Install missing dependencies"""
    print("📦 Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False
    except FileNotFoundError:
        print("❌ requirements.txt not found!")
        return False

def main():
    """Main launcher function"""
    print("🦅 Crow's Eye Marketing Suite - Desktop Launcher")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        input("Press Enter to exit...")
        sys.exit(1)
    
    # Check platform
    system = platform.system()
    print(f"🖥️  Platform: {system} {platform.release()}")
    
    # Check required dependencies
    dependencies = [
        ("tkinter", "tkinter"),
        ("PIL", "PIL"),
        ("requests", "requests")
    ]
    
    missing_deps = []
    for package, import_name in dependencies:
        if check_dependency(package, import_name):
            print(f"✅ {package}")
        else:
            print(f"❌ {package} (missing)")
            missing_deps.append(package)
    
    # Install missing dependencies if needed
    if missing_deps:
        print(f"\n📦 Missing dependencies: {', '.join(missing_deps)}")
        response = input("Install missing dependencies? (y/n): ").lower().strip()
        if response in ['y', 'yes']:
            if not install_dependencies():
                input("Press Enter to exit...")
                sys.exit(1)
        else:
            print("❌ Cannot run without required dependencies.")
            input("Press Enter to exit...")
            sys.exit(1)
    
    # Launch the main application
    print("\n🚀 Launching Crow's Eye Marketing Suite...")
    try:
        import main
        main.main()
    except ImportError as e:
        print(f"❌ Failed to import main application: {e}")
        print("Make sure main.py is in the same directory.")
        input("Press Enter to exit...")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Application error: {e}")
        input("Press Enter to exit...")
        sys.exit(1)

if __name__ == "__main__":
    main() 