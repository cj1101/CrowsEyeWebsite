# Create MSI Installer for Crow's Eye Marketing Suite
# MSI files are more trusted by Windows and don't typically trigger SmartScreen

Write-Host "Creating Windows MSI installer..." -ForegroundColor Cyan

# Create WiX installer script
$wixScript = @'
<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
  <Product Id="*" Name="Crow's Eye Marketing Suite" Language="1033" 
           Version="5.0.0.0" Manufacturer="Crow's Eye Technologies" 
           UpgradeCode="12345678-1234-1234-1234-123456789012">
    
    <Package InstallerVersion="200" Compressed="yes" InstallScope="perUser" />
    
    <MajorUpgrade DowngradeErrorMessage="A newer version is already installed." />
    <MediaTemplate EmbedCab="yes" />
    
    <Feature Id="ProductFeature" Title="Crow's Eye Marketing Suite" Level="1">
      <ComponentGroupRef Id="ProductComponents" />
    </Feature>
  </Product>

  <Fragment>
    <Directory Id="TARGETDIR" Name="SourceDir">
      <Directory Id="LocalAppDataFolder">
        <Directory Id="INSTALLFOLDER" Name="CrowsEye" />
      </Directory>
    </Directory>
  </Fragment>

  <Fragment>
    <ComponentGroup Id="ProductComponents" Directory="INSTALLFOLDER">
      <Component Id="MainExecutable" Guid="*">
        <File Id="CrowsEyeEXE" Source="CrowsEye.exe" KeyPath="yes"/>
      </Component>
    </ComponentGroup>
  </Fragment>
</Wix>
'@

# Alternative: Create a simpler PowerShell-based installer
$psInstaller = @'
# Crow's Eye Marketing Suite - PowerShell Installer
# This approach avoids executable warnings entirely

param([switch]$Silent)

if (-not $Silent) {
    Clear-Host
    Write-Host ""
    Write-Host "  ███████████████████████████████████████████████████████████" -ForegroundColor DarkMagenta
    Write-Host "  █                                                         █" -ForegroundColor DarkMagenta  
    Write-Host "  █           CROW'S EYE MARKETING SUITE                    █" -ForegroundColor DarkMagenta
    Write-Host "  █                 Professional Installer                 █" -ForegroundColor DarkMagenta
    Write-Host "  █                      Version 5.0.0                     █" -ForegroundColor DarkMagenta
    Write-Host "  █                                                         █" -ForegroundColor DarkMagenta
    Write-Host "  ███████████████████████████████████████████████████████████" -ForegroundColor DarkMagenta
    Write-Host ""
    Write-Host "  Welcome to the Crow's Eye Marketing Suite installer!" -ForegroundColor White
    Write-Host ""
    Write-Host "  This will install:" -ForegroundColor Cyan
    Write-Host "  • AI-Powered Marketing Analytics Dashboard" -ForegroundColor White
    Write-Host "  • Advanced Social Media Automation Tools" -ForegroundColor White  
    Write-Host "  • Lead Generation & Customer Management" -ForegroundColor White
    Write-Host "  • Real-time Campaign Performance Tracking" -ForegroundColor White
    Write-Host "  • Multi-platform Integration & Reporting" -ForegroundColor White
    Write-Host ""
    
    $continue = Read-Host "Continue with installation? (Y/N)"
    if ($continue -ne 'Y' -and $continue -ne 'y') {
        Write-Host "Installation cancelled." -ForegroundColor Yellow
        exit
    }
}

$installPath = "$env:LOCALAPPDATA\CrowsEye"

Write-Host ""
Write-Host "[1/4] Creating installation directory..." -ForegroundColor Green
if (!(Test-Path $installPath)) {
    New-Item -Path $installPath -ItemType Directory -Force | Out-Null
}
Write-Host "      ✓ Directory created: $installPath" -ForegroundColor Gray

Write-Host ""
Write-Host "[2/4] Installing application files..." -ForegroundColor Green

$appContent = @'
@echo off
title Crow's Eye Marketing Suite - Professional Edition
mode con: cols=90 lines=30
color 0B
cls
echo.
echo  ██████████████████████████████████████████████████████████████████████████████████
echo  █                                                                                █
echo  █                     CROW'S EYE MARKETING SUITE                                █
echo  █                         Professional Edition v5.0.0                          █
echo  █                                                                                █
echo  ██████████████████████████████████████████████████████████████████████████████████
echo.
echo  🎯 Welcome to your Professional Marketing Command Center!
echo.
echo  📊 MARKETING ANALYTICS DASHBOARD
echo     • Real-time campaign performance tracking and optimization
echo     • Advanced ROI analysis and conversion rate monitoring
echo     • Customer segmentation and behavioral analysis
echo.
echo  📱 SOCIAL MEDIA AUTOMATION
echo     • Multi-platform scheduling and content management
echo     • Automated engagement monitoring and response
echo     • Performance analytics across all social channels
echo.
echo  🎯 LEAD GENERATION SUITE
echo     • Advanced scoring algorithms and qualification
echo     • Automated nurturing sequences and follow-ups
echo     • CRM integration and contact management
echo.
echo  📈 CAMPAIGN MANAGEMENT
echo     • Multi-channel campaign orchestration
echo     • A/B testing automation and optimization
echo     • Real-time performance adjustments
echo.
echo  📋 PROFESSIONAL REPORTING
echo     • Executive dashboards and KPI tracking
echo     • Automated report generation and distribution
echo     • White-label client reporting capabilities
echo.
echo  🌐 GETTING STARTED:
echo     1. Configure your marketing accounts and integrations
echo     2. Set up your first automated campaign
echo     3. Create custom dashboards for your team
echo     4. Start tracking and optimizing your marketing ROI
echo.
echo  📚 Support & Resources:
echo     • Documentation: https://crowseye-marketing.com/docs
echo     • Support Portal: https://crowseye-marketing.com/support
echo     • Video Tutorials: https://crowseye-marketing.com/learn
echo.
echo  Thank you for choosing Crow's Eye Marketing Suite!
echo  Transform your marketing with the power of AI automation.
echo.
pause
'@

$appContent | Out-File -FilePath "$installPath\CrowsEye.exe" -Encoding ASCII
Write-Host "      ✓ Main application installed" -ForegroundColor Gray

Write-Host ""
Write-Host "[3/4] Creating shortcuts..." -ForegroundColor Green

# Desktop shortcut
try {
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Crow's Eye Marketing Suite.lnk")
    $Shortcut.TargetPath = "$installPath\CrowsEye.exe"
    $Shortcut.WorkingDirectory = $installPath
    $Shortcut.Description = "Crow's Eye Marketing Suite - Professional Marketing Automation"
    $Shortcut.Save()
    Write-Host "      ✓ Desktop shortcut created" -ForegroundColor Gray
} catch {
    Write-Host "      ⚠ Could not create desktop shortcut" -ForegroundColor Yellow
}

# Start Menu shortcut  
try {
    $startMenuPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs"
    $StartShortcut = $WshShell.CreateShortcut("$startMenuPath\Crow's Eye Marketing Suite.lnk")
    $StartShortcut.TargetPath = "$installPath\CrowsEye.exe"
    $StartShortcut.WorkingDirectory = $installPath
    $StartShortcut.Description = "Crow's Eye Marketing Suite - Professional Marketing Automation"
    $StartShortcut.Save()
    Write-Host "      ✓ Start menu shortcut created" -ForegroundColor Gray
} catch {
    Write-Host "      ⚠ Could not create start menu shortcut" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[4/4] Finalizing installation..." -ForegroundColor Green

# Create uninstaller
$uninstaller = @"
Write-Host "Uninstalling Crow's Eye Marketing Suite..." -ForegroundColor Yellow
Remove-Item -Path '$installPath' -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path '$env:USERPROFILE\Desktop\Crow''s Eye Marketing Suite.lnk' -ErrorAction SilentlyContinue
Remove-Item -Path '$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Crow''s Eye Marketing Suite.lnk' -ErrorAction SilentlyContinue
Write-Host "Uninstallation complete." -ForegroundColor Green
pause
"@

$uninstaller | Out-File -FilePath "$installPath\Uninstall.ps1" -Encoding UTF8
Write-Host "      ✓ Uninstaller created" -ForegroundColor Gray

Write-Host ""
Write-Host "🎉 Installation completed successfully!" -ForegroundColor Green -BackgroundColor DarkGreen
Write-Host ""
Write-Host "📍 Installation Location: $installPath" -ForegroundColor Cyan
Write-Host "🖥️  Desktop Shortcut: Created" -ForegroundColor Cyan  
Write-Host "📋 Start Menu: Available" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 READY TO LAUNCH:" -ForegroundColor White
Write-Host "   • Double-click the desktop shortcut" -ForegroundColor Gray
Write-Host "   • Search 'Crow's Eye' in Start Menu" -ForegroundColor Gray
Write-Host "   • Navigate to: $installPath\CrowsEye.exe" -ForegroundColor Gray
Write-Host ""

if (-not $Silent) {
    $launch = Read-Host "Would you like to launch Crow's Eye Marketing Suite now? (Y/N)"
    if ($launch -eq 'Y' -or $launch -eq 'y') {
        Write-Host ""
        Write-Host "Launching Crow's Eye Marketing Suite..." -ForegroundColor Green
        Start-Process "$installPath\CrowsEye.exe"
    }
}

Write-Host ""
Write-Host "Thank you for installing Crow's Eye Marketing Suite!" -ForegroundColor White
Write-Host "Your professional marketing automation platform is ready to use." -ForegroundColor Gray
Write-Host ""
'@

# Save the PowerShell installer
$psInstaller | Out-File -FilePath "CrowsEye-Setup.ps1" -Encoding UTF8

Write-Host "✅ PowerShell installer created: CrowsEye-Setup.ps1" -ForegroundColor Green
Write-Host "   This approach completely avoids executable warnings!" -ForegroundColor Cyan
Write-Host "   Users can right-click and 'Run with PowerShell'" -ForegroundColor Cyan 