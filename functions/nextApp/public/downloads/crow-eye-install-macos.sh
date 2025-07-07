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

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "pip3 is not installed!"
    echo "Please install pip3. Usually it comes with Python 3."
    echo "If you installed Python via Homebrew, try: brew reinstall python3"
    exit 1
fi

# Create installation directory
INSTALL_DIR="$HOME/Applications/CrowsEye"
echo "Creating installation directory: $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"

# Navigate to installation directory
cd "$INSTALL_DIR"

# Download the application files (placeholder for actual download)
echo "Downloading Crow's Eye Marketing Tool..."
# In production, this would download from GitHub releases
# For now, we'll create a placeholder structure

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

# Create run script
echo "Creating run script..."
cat > run_crows_eye.sh << 'EOF'
#!/bin/bash
cd "$HOME/Applications/CrowsEye"
source venv/bin/activate
python3 run.py
EOF

chmod +x run_crows_eye.sh

# Create macOS app bundle structure
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
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleSignature</key>
    <string>????</string>
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

# Create alias on Desktop
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
if [ -L "$HOME/Desktop/Crow's Eye.app" ]; then
    echo "Desktop alias created"
fi
echo ""
echo "To start the application:"
echo "1. Double-click 'Crow's Eye.app' from your desktop or Applications folder, or"
echo "2. Run: $INSTALL_DIR/run_crows_eye.sh"
echo ""
echo "Note: This installer currently sets up a basic environment."
echo "The full application files will be available when the project is ready."
echo ""
echo "You may need to allow the app in System Preferences > Security & Privacy"
echo "if macOS blocks it on first run."
echo "" 