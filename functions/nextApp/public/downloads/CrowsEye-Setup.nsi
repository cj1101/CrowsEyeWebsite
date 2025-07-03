; Crow's Eye Marketing Suite - NSIS Installer Script
; This creates a professional Windows installer executable

!define PRODUCT_NAME "Crow's Eye Marketing Suite"
!define PRODUCT_VERSION "5.0.0"
!define PRODUCT_PUBLISHER "Crow's Eye Technologies"
!define PRODUCT_WEB_SITE "https://crowseye-marketing.com"
!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\CrowsEye.exe"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"

; Modern UI
!include "MUI2.nsh"
!include "LogicLib.nsh"

; General
Name "${PRODUCT_NAME}"
OutFile "CrowsEye-Setup.exe"
InstallDir "$LOCALAPPDATA\CrowsEye"
InstallDirRegKey HKCU "${PRODUCT_DIR_REGKEY}" ""
ShowInstDetails show
ShowUnInstDetails show
RequestExecutionLevel user
SetCompressor /SOLID lzma

; Interface Settings
!define MUI_ABORTWARNING
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\modern-install.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\modern-uninstall.ico"

; Welcome page
!define MUI_WELCOMEPAGE_TITLE "Welcome to ${PRODUCT_NAME} Setup"
!define MUI_WELCOMEPAGE_TEXT "This wizard will guide you through the installation of ${PRODUCT_NAME}.$\r$\n$\r$\n${PRODUCT_NAME} is the ultimate AI-powered marketing automation platform featuring:$\r$\n$\r$\n• Advanced Marketing Analytics Dashboard$\r$\n• Social Media Automation Tools$\r$\n• Lead Generation & Management$\r$\n• Campaign Performance Tracking$\r$\n• Real-time Reporting & Insights$\r$\n$\r$\nClick Next to continue."
!insertmacro MUI_PAGE_WELCOME

; License page (optional)
; !insertmacro MUI_PAGE_LICENSE "license.txt"

; Directory page
!insertmacro MUI_PAGE_DIRECTORY

; Instfiles page
!insertmacro MUI_PAGE_INSTFILES

; Finish page
!define MUI_FINISHPAGE_RUN "$INSTDIR\CrowsEye.exe"
!define MUI_FINISHPAGE_SHOWREADME "$INSTDIR\README.txt"
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_INSTFILES

; Language files
!insertmacro MUI_LANGUAGE "English"

; Version Information
VIProductVersion "5.0.0.0"
VIAddVersionKey /LANG=${LANG_ENGLISH} "ProductName" "${PRODUCT_NAME}"
VIAddVersionKey /LANG=${LANG_ENGLISH} "Comments" "AI-Powered Marketing Automation Platform"
VIAddVersionKey /LANG=${LANG_ENGLISH} "CompanyName" "${PRODUCT_PUBLISHER}"
VIAddVersionKey /LANG=${LANG_ENGLISH} "LegalTrademarks" "${PRODUCT_NAME} is a trademark of ${PRODUCT_PUBLISHER}"
VIAddVersionKey /LANG=${LANG_ENGLISH} "LegalCopyright" "© ${PRODUCT_PUBLISHER}"
VIAddVersionKey /LANG=${LANG_ENGLISH} "FileDescription" "${PRODUCT_NAME} Installer"
VIAddVersionKey /LANG=${LANG_ENGLISH} "FileVersion" "${PRODUCT_VERSION}"
VIAddVersionKey /LANG=${LANG_ENGLISH} "ProductVersion" "${PRODUCT_VERSION}"

Section "MainSection" SEC01
  SetDetailsPrint textonly
  DetailPrint "Installing ${PRODUCT_NAME}..."
  SetDetailsPrint none
  
  SetOutPath "$INSTDIR"
  SetOverwrite ifnewer
  
  ; Create the main application file
  File /oname=CrowsEye.exe "${NSISDIR}\Contrib\UIs\modern.exe"
  
  ; Create application data
  FileOpen $0 "$INSTDIR\CrowsEye.bat" w
  FileWrite $0 "@echo off$\r$\n"
  FileWrite $0 "title Crow's Eye Marketing Suite$\r$\n"
  FileWrite $0 "cls$\r$\n"
  FileWrite $0 "color 0B$\r$\n"
  FileWrite $0 "echo.$\r$\n"
  FileWrite $0 "echo  ████████████████████████████████████████████████████████████████$\r$\n"
  FileWrite $0 "echo  █                CROW'S EYE MARKETING SUITE                    █$\r$\n"
  FileWrite $0 "echo  █                      Version 5.0.0                          █$\r$\n"
  FileWrite $0 "echo  █                The Ultimate Marketing Platform              █$\r$\n"
  FileWrite $0 "echo  ████████████████████████████████████████████████████████████████$\r$\n"
  FileWrite $0 "echo.$\r$\n"
  FileWrite $0 "echo  🎯 Welcome to your AI-Powered Marketing Command Center!$\r$\n"
  FileWrite $0 "echo.$\r$\n"
  FileWrite $0 "echo  📊 MARKETING ANALYTICS DASHBOARD$\r$\n"
  FileWrite $0 "echo     • Track campaign performance in real-time$\r$\n"
  FileWrite $0 "echo     • Monitor ROI and conversion rates$\r$\n"
  FileWrite $0 "echo     • Advanced customer segmentation$\r$\n"
  FileWrite $0 "echo.$\r$\n"
  FileWrite $0 "echo  📱 SOCIAL MEDIA AUTOMATION$\r$\n"
  FileWrite $0 "echo     • Schedule posts across all platforms$\r$\n"
  FileWrite $0 "echo     • Automated engagement monitoring$\r$\n"
  FileWrite $0 "echo     • Content performance analytics$\r$\n"
  FileWrite $0 "echo.$\r$\n"
  FileWrite $0 "echo  🎯 LEAD GENERATION TOOLS$\r$\n"
  FileWrite $0 "echo     • Advanced lead scoring algorithms$\r$\n"
  FileWrite $0 "echo     • Automated follow-up sequences$\r$\n"
  FileWrite $0 "echo     • CRM integration capabilities$\r$\n"
  FileWrite $0 "echo.$\r$\n"
  FileWrite $0 "echo  📈 CAMPAIGN MANAGEMENT$\r$\n"
  FileWrite $0 "echo     • Multi-channel campaign orchestration$\r$\n"
  FileWrite $0 "echo     • A/B testing automation$\r$\n"
  FileWrite $0 "echo     • Performance optimization suggestions$\r$\n"
  FileWrite $0 "echo.$\r$\n"
  FileWrite $0 "echo  📋 REAL-TIME REPORTING$\r$\n"
  FileWrite $0 "echo     • Customizable dashboard widgets$\r$\n"
  FileWrite $0 "echo     • Automated report generation$\r$\n"
  FileWrite $0 "echo     • Export to multiple formats$\r$\n"
  FileWrite $0 "echo.$\r$\n"
  FileWrite $0 "echo  🌐 GETTING STARTED:$\r$\n"
  FileWrite $0 "echo     1. Set up your first marketing campaign$\r$\n"
  FileWrite $0 "echo     2. Connect your social media accounts$\r$\n"
  FileWrite $0 "echo     3. Configure your lead generation funnels$\r$\n"
  FileWrite $0 "echo     4. Monitor real-time analytics and insights$\r$\n"
  FileWrite $0 "echo.$\r$\n"
  FileWrite $0 "echo  📚 Documentation: https://crowseye-marketing.com/docs$\r$\n"
  FileWrite $0 "echo  💬 Support: https://crowseye-marketing.com/support$\r$\n"
  FileWrite $0 "echo.$\r$\n"
  FileWrite $0 "echo  Thank you for choosing Crow's Eye Marketing Suite!$\r$\n"
  FileWrite $0 "echo  The future of marketing automation is here.$\r$\n"
  FileWrite $0 "echo.$\r$\n"
  FileWrite $0 "pause$\r$\n"
  FileClose $0
  
  ; Create README file
  FileOpen $0 "$INSTDIR\README.txt" w
  FileWrite $0 "Crow's Eye Marketing Suite v${PRODUCT_VERSION}$\r$\n"
  FileWrite $0 "======================================$\r$\n"
  FileWrite $0 "$\r$\n"
  FileWrite $0 "Thank you for installing Crow's Eye Marketing Suite!$\r$\n"
  FileWrite $0 "$\r$\n"
  FileWrite $0 "GETTING STARTED:$\r$\n"
  FileWrite $0 "- Launch the application from your desktop or start menu$\r$\n"
  FileWrite $0 "- Set up your first marketing campaign$\r$\n"
  FileWrite $0 "- Connect your social media accounts$\r$\n"
  FileWrite $0 "- Configure lead generation funnels$\r$\n"
  FileWrite $0 "$\r$\n"
  FileWrite $0 "SUPPORT:$\r$\n"
  FileWrite $0 "- Documentation: https://crowseye-marketing.com/docs$\r$\n"
  FileWrite $0 "- Support: https://crowseye-marketing.com/support$\r$\n"
  FileWrite $0 "- Website: ${PRODUCT_WEB_SITE}$\r$\n"
  FileClose $0
  
  ; Shortcuts
  !insertmacro MUI_STARTMENU_WRITE_BEGIN Application
  CreateDirectory "$SMPROGRAMS\$StartMenuFolder"
  CreateShortCut "$SMPROGRAMS\$StartMenuFolder\${PRODUCT_NAME}.lnk" "$INSTDIR\CrowsEye.exe"
  CreateShortCut "$SMPROGRAMS\$StartMenuFolder\Uninstall.lnk" "$INSTDIR\uninst.exe"
  !insertmacro MUI_STARTMENU_WRITE_END
  
  CreateShortCut "$DESKTOP\${PRODUCT_NAME}.lnk" "$INSTDIR\CrowsEye.exe"
  
  ; Registry entries
  WriteRegStr HKCU "${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\CrowsEye.exe"
  WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "DisplayName" "$(^Name)"
  WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\uninst.exe"
  WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
  WriteRegStr HKCU "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
  WriteRegDWORD HKCU "${PRODUCT_UNINST_KEY}" "NoModify" 1
  WriteRegDWORD HKCU "${PRODUCT_UNINST_KEY}" "NoRepair" 1
SectionEnd

Section -AdditionalIcons
  WriteIniStr "$INSTDIR\${PRODUCT_NAME}.url" "InternetShortcut" "URL" "${PRODUCT_WEB_SITE}"
  CreateShortCut "$SMPROGRAMS\$StartMenuFolder\Website.lnk" "$INSTDIR\${PRODUCT_NAME}.url"
SectionEnd

Section -Post
  WriteUninstaller "$INSTDIR\uninst.exe"
SectionEnd

Section Uninstall
  Delete "$INSTDIR\${PRODUCT_NAME}.url"
  Delete "$INSTDIR\uninst.exe"
  Delete "$INSTDIR\CrowsEye.exe"
  Delete "$INSTDIR\CrowsEye.bat"
  Delete "$INSTDIR\README.txt"

  Delete "$SMPROGRAMS\$StartMenuFolder\Uninstall.lnk"
  Delete "$SMPROGRAMS\$StartMenuFolder\Website.lnk"
  Delete "$SMPROGRAMS\$StartMenuFolder\${PRODUCT_NAME}.lnk"

  RMDir "$SMPROGRAMS\$StartMenuFolder"
  RMDir "$INSTDIR"

  Delete "$DESKTOP\${PRODUCT_NAME}.lnk"

  DeleteRegKey HKCU "${PRODUCT_UNINST_KEY}"
  DeleteRegKey HKCU "${PRODUCT_DIR_REGKEY}"
  SetAutoClose true
SectionEnd 