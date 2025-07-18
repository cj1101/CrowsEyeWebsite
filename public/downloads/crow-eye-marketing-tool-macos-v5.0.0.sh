#!/bin/bash

# Crow's Eye Marketing Tool - macOS Installer
clear
echo "================================================================"
echo "            Crow's Eye Marketing Tool - macOS Installer"
echo "================================================================"
echo ""
echo "Installing Crow's Eye Marketing Tool on macOS..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed!"
    echo "Please install Python 3.8 or higher:"
    echo "1. Download from https://www.python.org/downloads/macos/"
    echo "2. Or install via Homebrew: brew install python3"
    echo "3. Or install Xcode Command Line Tools: xcode-select --install"
    echo "Then re-run this installer."
    exit 1
fi

# Create installation directory
INSTALL_DIR="$HOME/Applications/CrowsEye"
echo "Creating installation directory: $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Download application files from GitHub
echo "Downloading Crow's Eye Marketing Tool..."
if command -v curl &> /dev/null; then
    curl -L https://github.com/charlpcronje/crows-eye-website/releases/latest/download/crows-eye-source.zip -o crows-eye-source.zip
elif command -v wget &> /dev/null; then
    wget https://github.com/charlpcronje/crows-eye-website/releases/latest/download/crows-eye-source.zip
else
    echo "Warning: Neither curl nor wget found. Setting up basic environment..."
fi

if [ -f "crows-eye-source.zip" ]; then
    unzip -q crows-eye-source.zip
    rm crows-eye-source.zip
else
    echo "Warning: Could not download source files. Setting up basic environment..."
fi

echo "Setting up virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "Installing dependencies..."
cat > requirements.txt << EOF
PySide6==6.9.0
requests==2.28.2
python-dateutil==2.8.2
python-dotenv==1.0.0
Pillow==11.2.1
google-generativeai==0.4.1
EOF

pip install -r requirements.txt

# Create run script if source files weren't downloaded
if [ ! -f "run.py" ]; then
    echo "Creating basic run script..."
    cat > run.py << 'EOF'
import sys
import os
print("Crow's Eye Marketing Tool")
print("Please download the full application from https://crowseye.dev")
input("Press Enter to exit...")
EOF
fi

# Create macOS app bundle
echo "Creating macOS app bundle..."
mkdir -p "Crow's Eye.app/Contents/MacOS"
mkdir -p "Crow's Eye.app/Contents/Resources"

# Create Info.plist
cat > "Crow's Eye.app/Contents/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>CrowsEye</string>
    <key>CFBundleIdentifier</key>
    <string>com.crowseye.marketingtool</string>
    <key>CFBundleName</key>
    <string>Crow's Eye Marketing Tool</string>
    <key>CFBundleVersion</key>
    <string>5.0.0</string>
    <key>CFBundleShortVersionString</key>
    <string>5.0</string>
</dict>
</plist>
EOF

# Create app launcher
cat > "Crow's Eye.app/Contents/MacOS/CrowsEye" << 'EOF'
#!/bin/bash
BASEDIR=$(dirname "$0")
cd "$BASEDIR/../../.."
source venv/bin/activate
python3 run.py
EOF

chmod +x "Crow's Eye.app/Contents/MacOS/CrowsEye"

# Create desktop alias
if [ -d "$HOME/Desktop" ]; then
    echo "Creating desktop alias..."
    ln -sf "$INSTALL_DIR/Crow's Eye.app" "$HOME/Desktop/Crow's Eye.app"
fi

echo ""
echo "================================================================"
echo "Installation Complete!"
echo "================================================================"
echo ""
echo "Crow's Eye Marketing Tool has been installed to: $INSTALL_DIR"
echo "App bundle created: $INSTALL_DIR/Crow's Eye.app"
echo ""
echo "To start the application:"
echo "1. Double-click 'Crow's Eye.app' from your desktop or Applications folder"
echo ""
echo "You may need to allow the app in System Preferences > Security & Privacy"
echo "if macOS blocks it on first run."
echo ""
