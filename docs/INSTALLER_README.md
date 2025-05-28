# Crow's Eye Marketing Suite - Automated Installer System

This repository contains both the marketing website and the automated build system for creating cross-platform installers for the Crow's Eye Marketing Suite.

## 🎯 How It Works

The build system automatically monitors the [Crow-s-Eye-Marketing-Agent repository](https://github.com/cj1101/Crow-s-Eye-Marketing-Agent) for updates and creates installers when new code is pushed. This keeps everything centralized in one place while maintaining separation between the application code and the website.

## 🚀 Automated Build Process

### Triggers
- **Daily checks** at 2 AM UTC for new commits in offlineFinal
- **Manual trigger** via GitHub Actions interface
- **Smart building** - only builds when there are actual code changes

### What Gets Built
1. **Windows**: `CrowsEye-Setup-Windows.exe` (NSIS installer)
2. **macOS**: `CrowsEye-Setup-macOS.dmg` (DMG disk image)
3. **Linux**: `CrowsEye-Setup-Linux.AppImage` (Portable executable)

### Build Process
1. **Monitor** offlineFinal repository for changes
2. **Checkout** latest application code
3. **Build** executables for all platforms simultaneously
4. **Package** into professional installers
5. **Release** with automatic versioning
6. **Update** website download links automatically

## 📁 Repository Structure

```
CrowsEyeWebsite/
├── .github/
│   └── workflows/
│       └── build-installers.yml    # Automated build system
├── src/
│   ├── app/                        # Next.js website pages
│   └── components/
│       └── EmbeddedInstaller.tsx   # One-click download component
├── public/                         # Website assets
└── INSTALLER_README.md            # This file
```

## 🔧 How the Website Integration Works

### Download Component
The `EmbeddedInstaller.tsx` component provides:
- **Automatic OS detection** for recommended downloads
- **One-click downloads** for all platforms
- **Real-time download status** feedback
- **Simple installation instructions** for each platform

### Download URLs
The website automatically downloads from:
```
https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases/latest/download/CrowsEye-Setup-Windows.exe
https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases/latest/download/CrowsEye-Setup-macOS.dmg
https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases/latest/download/CrowsEye-Setup-Linux.AppImage
```

## 🎮 Manual Build Trigger

To manually trigger a build:

1. Go to **Actions** tab in this repository
2. Select **Build Cross-Platform Installers**
3. Click **Run workflow**
4. Wait for builds to complete (~15-20 minutes)
5. New release will be created automatically

## 📦 Release Management

### Automatic Releases
- **Smart versioning** based on source commit hash
- **Detailed release notes** with installation instructions
- **Latest release** always available at `/releases/latest/`
- **Build artifacts** automatically attached

### Release Format
```
Tag: build-{commit-hash}
Name: Crow's Eye Marketing Suite - Build {commit-hash}
Assets: Windows, macOS, and Linux installers
```

## 🔍 Monitoring & Troubleshooting

### Check Build Status
1. **Actions tab** shows all build runs
2. **Releases page** shows successful builds
3. **Website downloads** test actual functionality

### Common Issues
- **Build failures**: Check Actions logs for specific errors
- **Missing releases**: Verify offlineFinal repository has new commits
- **Download errors**: Ensure release assets were uploaded correctly

### Debug Steps
1. Check if offlineFinal has new commits
2. Verify GitHub Actions are enabled
3. Look at build logs in Actions tab
4. Test download links manually

## 🎯 Benefits of This Setup

### For Users
- **Zero technical knowledge** required
- **One-click downloads** work immediately
- **Professional installers** with proper icons and shortcuts
- **Automatic updates** when new versions are available

### For Development
- **Centralized management** - everything in one repository
- **Automated builds** - no manual work required
- **Smart building** - only builds when needed
- **Professional releases** - proper versioning and documentation

### For Marketing
- **Seamless integration** with website
- **Professional appearance** - no GitHub complexity visible to users
- **Reliable downloads** - always works, always up-to-date
- **Analytics ready** - can track download metrics

## 🚀 Getting Started

The system is already set up and working! Here's what happens automatically:

1. **Daily monitoring** of offlineFinal repository
2. **Automatic building** when changes are detected
3. **Professional releases** with installers
4. **Website integration** provides one-click downloads

No manual intervention required - everything just works!

## 📊 Success Metrics

Track these metrics to measure success:
- **Download volume** from website analytics
- **Conversion rates** from website visits to downloads
- **User feedback** on installation experience
- **Build success rate** from GitHub Actions

## 🆘 Support

If you need help:
1. **Check Actions logs** for build issues
2. **Test downloads** from the website
3. **Verify source code** in offlineFinal repository
4. **Contact support** via the website contact form

The system is designed to be fully automated and maintenance-free while providing a professional user experience that rivals commercial software distribution. 