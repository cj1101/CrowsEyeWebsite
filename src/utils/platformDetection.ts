export type Platform = 'windows' | 'macos' | 'linux' | 'unknown';

export interface PlatformInfo {
  platform: Platform;
  name: string;
  downloadUrl: string;
  filename: string;
  instructions: string[];
}

export function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('mac')) return 'macos';
  if (userAgent.includes('linux')) return 'linux';
  
  return 'unknown';
}

export function getPlatformInfo(platform: Platform): PlatformInfo {
  const platformConfigs: Record<Platform, PlatformInfo> = {
    windows: {
      platform: 'windows',
      name: 'Windows',
      downloadUrl: '/api/download/windows',
      filename: 'CrowsEye-Installer.zip',
      instructions: [
        '🔽 Download the Installer ZIP file.',
        '📂 Unzip the file (Right-click → "Extract All...").',
        '🚀 In the new folder, double-click "Run Installer".',
        '✨ The installation will start automatically!',
        '✅ Safe, simple, and no scary warnings.'
      ]
    },
    macos: {
      platform: 'macos',
      name: 'macOS',
      downloadUrl: '/api/download/macos',
      filename: 'CrowsEye-Installer-macOS.zip',
      instructions: [
        '🔽 Download the Installer ZIP file.',
        '📂 Double-click the ZIP to automatically unzip it.',
        '🚀 In the new folder, double-click "Run Installer".',
        '✨ A terminal window will open and run the installer.',
        '✅ Safe, simple, and guided by your OS.'
      ]
    },
    linux: {
      platform: 'linux',
      name: 'Linux',
      downloadUrl: '/api/download/linux',
      filename: 'CrowsEye-Installer-Linux.zip',
      instructions: [
        '🔽 Download the Installer ZIP file.',
        '📂 Unzip the file in your favorite location.',
        '🚀 Open a terminal in the new folder.',
        '✨ Run the installer with: sh run_installer.sh',
        '✅ Quick, clean, and respects the command line.'
      ]
    },
    unknown: {
      platform: 'unknown',
      name: 'Your Platform',
      downloadUrl: '/api/download/source',
      filename: 'CrowsEye-Marketing-Tool-Source.zip',
      instructions: [
        'Download the source code',
        'Extract the ZIP file',
        'Install Python 3.8 or newer',
        'Run: pip install -r requirements.txt',
        'Launch with: python main.py'
      ]
    }
  };
  
  return platformConfigs[platform];
}

export function getAllPlatformInfo(): PlatformInfo[] {
  return [
    getPlatformInfo('windows'),
    getPlatformInfo('macos'),
    getPlatformInfo('linux'),
  ];
} 