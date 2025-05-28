# Crow's Eye Marketing Suite - Build System

This directory contains the automated build system for creating cross-platform installers for the Crow's Eye Marketing Suite.

## 🚀 Quick Start

### Automatic Builds (Recommended)

The easiest way to create installers is using GitHub Actions:

1. **Push to main branch** - Builds are triggered automatically
2. **Create a release** - Installers are automatically attached to the release
3. **Download from releases** - Users can download from your GitHub releases page

### Manual Local Builds

For testing or development:

```bash
# Install build dependencies
pip install -r requirements-build.txt

# Run the build script
python build.py
```

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `.github/workflows/build-installers.yml` | GitHub Actions workflow for automated builds |
| `CrowsEye.spec` | PyInstaller specification file |
| `requirements-build.txt` | Build dependencies |
| `build.py` | Local build script for testing |

## 🔧 Setup Instructions

### 1. Add Files to Your Repository

Copy these files to your `offlineFinal` repository:

```
offlineFinal/
├── .github/
│   └── workflows/
│       └── build-installers.yml
├── CrowsEye.spec
├── requirements-build.txt
├── build.py
└── assets/
    ├── icon.ico     # Windows icon (required)
    ├── icon.icns    # macOS icon (required)
    └── icon.png     # Linux icon (required)
```

### 2. Create Icons

You need platform-specific icons in the `assets/` directory:

- **Windows**: `assets/icon.ico` (256x256 recommended)
- **macOS**: `assets/icon.icns` (512x512 recommended)  
- **Linux**: `assets/icon.png` (256x256 recommended)

**Icon Conversion Tools:**
- Online: [ConvertICO](https://convertio.co/ico-converter/)
- macOS: `iconutil` (built-in)
- Cross-platform: [ImageMagick](https://imagemagick.org/)

### 3. Update Your Requirements

Make sure your main `requirements.txt` includes all necessary dependencies. The build system will use this file.

### 4. Test Locally (Optional)

Before pushing to GitHub, test the build locally:

```bash
python build.py
```

This will:
- Install build dependencies
- Check for required files
- Build the executable
- Create a platform-specific installer

## 🤖 GitHub Actions Workflow

### Triggers

The workflow runs on:
- **Push to main/master** - Creates build artifacts
- **Pull requests** - Tests the build process
- **Releases** - Creates and attaches installers to the release

### Build Process

1. **Windows Build**:
   - Uses PyInstaller to create `.exe`
   - Uses NSIS to create installer
   - Output: `CrowsEye-Setup-Windows.exe`

2. **macOS Build**:
   - Uses PyInstaller to create app bundle
   - Uses dmgbuild to create DMG
   - Output: `CrowsEye-Setup-macOS.dmg`

3. **Linux Build**:
   - Uses PyInstaller to create executable
   - Creates AppImage for universal compatibility
   - Output: `CrowsEye-Setup-Linux.AppImage`

### Accessing Build Artifacts

- **Development builds**: Download from the Actions tab
- **Release builds**: Automatically attached to GitHub releases

## 📦 Creating a Release

To create installers for distribution:

1. **Create a new release** on GitHub:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Go to GitHub** → Releases → Create new release

3. **Fill in release details** and publish

4. **Wait for builds** - Installers will be automatically attached

## 🔍 Troubleshooting

### Common Issues

**Build fails with missing dependencies:**
```bash
# Update requirements-build.txt with missing packages
pip freeze > requirements-build.txt
```

**Missing icons:**
- Ensure all three icon files exist in `assets/`
- Check file permissions and formats

**PyInstaller issues:**
- Update the `CrowsEye.spec` file
- Add missing modules to `hiddenimports`

**Platform-specific issues:**
- Windows: Ensure NSIS is available in GitHub Actions
- macOS: Check code signing requirements
- Linux: Verify Qt dependencies

### Debug Builds

To debug build issues:

1. **Check GitHub Actions logs** in the Actions tab
2. **Run locally** with `python build.py`
3. **Test PyInstaller directly**:
   ```bash
   pyinstaller CrowsEye.spec --clean
   ```

### Manual PyInstaller Commands

If the automated build fails, try these manual commands:

**Windows:**
```bash
pyinstaller --onefile --windowed --name "CrowsEye" --icon=assets/icon.ico main.py
```

**macOS:**
```bash
pyinstaller --onefile --windowed --name "CrowsEye" --icon=assets/icon.icns main.py
```

**Linux:**
```bash
pyinstaller --onefile --windowed --name "CrowsEye" main.py
```

## 🎯 Integration with Website

Your website's download component expects these exact file names:

- `CrowsEye-Setup-Windows.exe`
- `CrowsEye-Setup-macOS.dmg`
- `CrowsEye-Setup-Linux.AppImage`

The GitHub Actions workflow creates files with these exact names and uploads them to releases, making them available at:

```
https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases/download/v1.1.0/CrowsEye-Setup-Windows.exe
https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases/download/v1.1.0/CrowsEye-Setup-macOS.dmg
https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases/download/v1.1.0/CrowsEye-Setup-Linux.AppImage
```

## 📋 Checklist

Before your first release:

- [ ] All build files copied to repository
- [ ] Icons created for all platforms
- [ ] `requirements.txt` is complete
- [ ] Local build test successful
- [ ] GitHub Actions workflow enabled
- [ ] Test release created
- [ ] Website download links verified

## 🆘 Support

If you encounter issues:

1. Check the GitHub Actions logs
2. Test the build locally with `python build.py`
3. Verify all required files are present
4. Check that your `main.py` runs without errors

The build system is designed to be robust and handle most common scenarios automatically. The GitHub Actions workflow will create professional installers that work seamlessly with your one-click download website. 