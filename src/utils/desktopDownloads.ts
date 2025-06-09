/**
 * Desktop App Download Utilities
 * Handles downloading and installation of the Crow's Eye Marketing Tool desktop application
 */

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export interface DesktopAppInfo {
  platform: string;
  version: string;
  downloadUrl: string;
  filename: string;
  size: string;
  checksum?: string;
}

// Desktop app versions and download information
const DESKTOP_APPS: Record<string, DesktopAppInfo> = {
  windows: {
    platform: 'Windows',
    version: '5.0.0',
    downloadUrl: '/downloads/crow-eye-marketing-tool-windows-v5.0.0.exe',
    filename: 'crow-eye-marketing-tool-windows-v5.0.0.exe',
    size: '125 MB',
    checksum: 'sha256:abc123...'
  },
  macos: {
    platform: 'macOS',
    version: '5.0.0',
    downloadUrl: '/downloads/crow-eye-marketing-tool-macos-v5.0.0.dmg',
    filename: 'crow-eye-marketing-tool-macos-v5.0.0.dmg',
    size: '130 MB',
    checksum: 'sha256:def456...'
  },
  linux: {
    platform: 'Linux',
    version: '5.0.0',
    downloadUrl: '/downloads/crow-eye-marketing-tool-linux-v5.0.0.AppImage',
    filename: 'crow-eye-marketing-tool-linux-v5.0.0.AppImage',
    size: '140 MB',
    checksum: 'sha256:ghi789...'
  }
};

/**
 * Download desktop app for specified platform
 */
export async function downloadDesktopApp(platform: string): Promise<void> {
  const platformKey = platform.toLowerCase();
  const appInfo = DESKTOP_APPS[platformKey];

  if (!appInfo) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  try {
    // Track download event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'download_desktop_app', {
        platform: appInfo.platform,
        version: appInfo.version,
        filename: appInfo.filename
      });
    }

    // Create download link and trigger download
    const link = document.createElement('a');
    link.href = appInfo.downloadUrl;
    link.download = appInfo.filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success message
    showDownloadNotification(appInfo);
    
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error(`Failed to download ${appInfo.platform} app: ${error}`);
  }
}

/**
 * Get download information for all platforms
 */
export function getAllDesktopApps(): DesktopAppInfo[] {
  return Object.values(DESKTOP_APPS);
}

/**
 * Get download information for specific platform
 */
export function getDesktopAppInfo(platform: string): DesktopAppInfo | null {
  const platformKey = platform.toLowerCase();
  return DESKTOP_APPS[platformKey] || null;
}

/**
 * Check if platform is supported
 */
export function isPlatformSupported(platform: string): boolean {
  const platformKey = platform.toLowerCase();
  return platformKey in DESKTOP_APPS;
}

/**
 * Get user's platform automatically
 */
export function detectUserPlatform(): string {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('mac')) return 'macos';
  if (userAgent.includes('linux')) return 'linux';
  
  return 'unknown';
}

/**
 * Show download notification
 */
function showDownloadNotification(appInfo: DesktopAppInfo): void {
  if (typeof window === 'undefined') return;

  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
  notification.innerHTML = `
    <div class="flex items-center space-x-3">
      <div class="flex-shrink-0">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div>
        <h4 class="font-bold">Download Started</h4>
        <p class="text-sm">${appInfo.filename} (${appInfo.size})</p>
        <p class="text-xs text-green-200 mt-1">Check your downloads folder</p>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // Remove notification after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
}

/**
 * Generate installation instructions for platform
 */
export function getInstallationInstructions(platform: string): string[] {
  const platformKey = platform.toLowerCase();
  
  switch (platformKey) {
    case 'windows':
      return [
        '1. Download the Installer ZIP file.',
        '2. Unzip the file (Right-click → "Extract All...").',
        '3. Open the new folder and double-click "Run Installer".',
        '4. The installation will start automatically!',
        '5. Safe, simple, and no scary warnings.'
      ];
    
    case 'macos':
      return [
        '1. Download the Installer ZIP file.',
        '2. Double-click the ZIP to automatically unzip it.',
        '3. In the new folder, double-click "Run Installer".',
        '4. A terminal window will open and run the installer.',
        '5. Safe, simple, and guided by your OS.'
      ];
    
    case 'linux':
      return [
        '1. Download the Installer ZIP file.',
        '2. Unzip the file in your favorite location.',
        '3. Open a terminal in the new folder.',
        '4. Run the installer with: sh run_installer.sh',
        '5. Quick, clean, and respects the command line.'
      ];
    
    default:
      return ['Platform not supported'];
  }
}

/**
 * Get system requirements for platform
 */
export function getSystemRequirements(platform: string): Record<string, string> {
  const platformKey = platform.toLowerCase();
  
  const baseRequirements = {
    'RAM': '4GB minimum, 8GB recommended',
    'Storage': '1GB free space',
    'Internet': 'Required for AI features and social media posting',
    'Python': '3.11+ (for source installation)'
  };

  switch (platformKey) {
    case 'windows':
      return {
        ...baseRequirements,
        'OS': 'Windows 10 or later (64-bit)',
        'Additional': '.NET Framework 4.8 or later'
      };
    
    case 'macos':
      return {
        ...baseRequirements,
        'OS': 'macOS 10.15 (Catalina) or later',
        'Architecture': 'Intel or Apple Silicon (M1/M2)'
      };
    
    case 'linux':
      return {
        ...baseRequirements,
        'OS': 'Ubuntu 20.04+, Fedora 35+, or equivalent',
        'Architecture': 'x86_64',
        'Dependencies': 'GLIBC 2.31+, GTK 3.24+'
      };
    
    default:
      return baseRequirements;
  }
} 