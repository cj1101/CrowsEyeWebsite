#!/bin/bash

# Crow's Eye Marketing Tool - Linux Installer
clear
echo "================================================================"
echo "            Crow's Eye Marketing Tool - Linux Installer"
echo "================================================================"
echo ""
echo "Installing Crow's Eye Marketing Tool on Linux..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed!"
    echo "Please install Python 3.8 or higher using your package manager:"
    echo "  Ubuntu/Debian: sudo apt install python3 python3-pip python3-venv"
    echo "  CentOS/RHEL: sudo yum install python3 python3-pip"
    echo "  Arch: sudo pacman -S python python-pip"
    echo "Then re-run this installer."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "pip3 is not installed!"
    echo "Please install pip3 using your package manager:"
    echo "  Ubuntu/Debian: sudo apt install python3-pip"
    echo "  CentOS/RHEL: sudo yum install python3-pip"
    echo "Then re-run this installer."
    exit 1
fi

# Create installation directory
INSTALL_DIR="$HOME/CrowsEye"
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
cd "$HOME/CrowsEye"
source venv/bin/activate
python3 run.py
EOF

chmod +x run_crows_eye.sh

# Create desktop entry if desktop environment is available
if [ -d "$HOME/.local/share/applications" ]; then
    echo "Creating desktop entry..."
    cat > "$HOME/.local/share/applications/crows-eye.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Crow's Eye Marketing Tool
Comment=AI-powered social media marketing platform
Exec=$INSTALL_DIR/run_crows_eye.sh
Icon=$INSTALL_DIR/icon.png
Terminal=false
Categories=Office;
EOF
fi

echo ""
echo "================================================================"
echo "Installation Complete!"
echo "================================================================"
echo ""
echo "Crow's Eye Marketing Tool has been installed to: $INSTALL_DIR"
if [ -f "$HOME/.local/share/applications/crows-eye.desktop" ]; then
    echo "Desktop entry created in applications menu"
fi
echo ""
echo "To start the application:"
echo "1. Look for 'Crow's Eye Marketing Tool' in your applications menu, or"
echo "2. Run: $INSTALL_DIR/run_crows_eye.sh"
echo ""
echo "Note: This installer currently sets up a basic environment."
echo "The full application files will be available when the project is ready."
echo "" 