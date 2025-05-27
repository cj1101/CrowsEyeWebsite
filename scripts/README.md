# Scripts Directory

This directory contains all build, setup, and deployment scripts for the project.

## 📜 Available Scripts

### Build & Deployment Scripts
- **`clean-build.js`** - Cleans build artifacts and prepares for fresh build
- **`clean-deploy.ps1`** - PowerShell script for clean deployment process
- **`clean-deploy.sh`** - Bash script for clean deployment process

### Setup Scripts
- **`setup.js`** - Initial project setup and configuration
- **`setup-firebase.js`** - Firebase-specific setup and configuration
- **`firebase-setup-custom-domain.js`** - Custom domain configuration for Firebase

### Python Build Scripts
- **`build.py`** - Standard Python build script
- **`build_enhanced.py`** - Enhanced build script with additional features
- **`python_auth_integration.py`** - Python authentication integration utilities

### Configuration Files
- **`requirements-build.txt`** - Python dependencies for build scripts
- **`requirements-enhanced.txt`** - Python dependencies for enhanced build
- **`CrowsEye.spec`** - PyInstaller specification file

## 🚀 Usage

### Node.js Scripts
Run Node.js scripts from the project root:

```bash
# Setup project
npm run setup

# Setup Firebase
npm run setup-firebase

# Clean build
npm run clean
```

### Python Scripts
Run Python scripts directly:

```bash
# Standard build
python scripts/build.py

# Enhanced build
python scripts/build_enhanced.py
```

### Shell Scripts
Run shell scripts for deployment:

```bash
# On Windows (PowerShell)
.\scripts\clean-deploy.ps1

# On Unix/Linux/macOS
./scripts/clean-deploy.sh
```

## 📋 Requirements

### Node.js Scripts
- Node.js 18+
- npm dependencies installed

### Python Scripts
- Python 3.8+
- Install requirements: `pip install -r scripts/requirements-build.txt`

### Shell Scripts
- PowerShell (Windows) or Bash (Unix/Linux/macOS)
- Firebase CLI installed and configured

## 🔧 Configuration

Scripts may require environment variables or configuration files:
- Check individual script files for specific requirements
- Ensure Firebase CLI is authenticated
- Set up necessary environment variables in `.env.local`

## 📝 Adding New Scripts

When adding new scripts:
1. Place them in this `scripts/` directory
2. Update this README with script description
3. Update `package.json` scripts section if needed
4. Ensure proper file permissions for shell scripts
5. Add appropriate error handling and logging 