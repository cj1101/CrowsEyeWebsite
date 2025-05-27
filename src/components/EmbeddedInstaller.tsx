'use client'

import React, { useState, useEffect } from 'react'
import { 
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline'

export default function EmbeddedInstaller() {
  const [downloadStarted, setDownloadStarted] = useState<string | null>(null)
  const [userOS, setUserOS] = useState<'windows' | 'mac' | 'linux' | null>(null)

  // Detect user's OS automatically
  useEffect(() => {
    const platform = navigator.platform.toLowerCase()
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (platform.includes('win') || userAgent.includes('windows')) {
      setUserOS('windows')
    } else if (platform.includes('mac') || userAgent.includes('mac')) {
      setUserOS('mac')
    } else if (platform.includes('linux') || userAgent.includes('linux')) {
      setUserOS('linux')
    }
  }, [])

  // Download URLs for each platform
  const downloadUrls = {
    windows: 'https://github.com/cj1101/CrowsEyeWebsite/releases/latest/download/CrowsEye-Setup-Windows.exe',
    mac: 'https://github.com/cj1101/CrowsEyeWebsite/releases/latest/download/CrowsEye-Setup-macOS.dmg',
    linux: 'https://github.com/cj1101/CrowsEyeWebsite/releases/latest/download/CrowsEye-Setup-Linux.AppImage'
  }

  const platformInfo = {
    windows: {
      name: 'Windows',
      icon: '🪟',
      fileType: '.exe',
      size: '~45 MB',
      description: 'Compatible with Windows 10 and 11'
    },
    mac: {
      name: 'macOS',
      icon: '🍎',
      fileType: '.dmg',
      size: '~50 MB',
      description: 'Compatible with macOS 10.15 and later'
    },
    linux: {
      name: 'Linux',
      icon: '🐧',
      fileType: '.AppImage',
      size: '~48 MB',
      description: 'Compatible with most Linux distributions'
    }
  }

  const handleDownload = (platform: 'windows' | 'mac' | 'linux') => {
    setDownloadStarted(platform)
    
    // Create a temporary link and trigger download
    const link = document.createElement('a')
    link.href = downloadUrls[platform]
    link.download = `CrowsEye-Setup-${platformInfo[platform].name}${platformInfo[platform].fileType}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Reset download state after 3 seconds
    setTimeout(() => {
      setDownloadStarted(null)
    }, 3000)
  }

  return (
    <div className="bg-gradient-to-r from-primary-900/30 to-primary-600/30 rounded-2xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          🚀 Download Crow's Eye Marketing Suite
        </h2>
        <p className="text-xl text-gray-300 mb-2">
          One-click installation - no technical knowledge required!
        </p>
        <p className="text-gray-400">
          Choose your operating system below and the installer will download immediately
        </p>
      </div>

      {/* Recommended Download (Auto-detected OS) */}
      {userOS && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-900/50 to-green-600/50 rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-600/20 rounded-full p-3 mr-4">
                <ComputerDesktopIcon className="h-8 w-8 text-green-400" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-1">
                  Recommended for You
                </h3>
                <p className="text-green-300">
                  We detected you're using {platformInfo[userOS].name}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => handleDownload(userOS)}
              disabled={downloadStarted === userOS}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                downloadStarted === userOS
                  ? 'bg-green-700 text-green-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25'
              }`}
            >
              {downloadStarted === userOS ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircleIcon className="h-6 w-6" />
                  Download Started!
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <ArrowDownTrayIcon className="h-6 w-6" />
                  Download for {platformInfo[userOS].name} ({platformInfo[userOS].size})
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* All Platform Options */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white text-center mb-6">
          Or choose your platform manually:
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.keys(platformInfo) as Array<keyof typeof platformInfo>).map((platform) => {
            const info = platformInfo[platform]
            const isDownloading = downloadStarted === platform
            const isRecommended = userOS === platform
            
            return (
              <div
                key={platform}
                className={`bg-black/40 rounded-xl p-6 border transition-all duration-300 hover:scale-105 ${
                  isRecommended 
                    ? 'border-green-500/50 bg-green-900/20' 
                    : 'border-gray-600/50 hover:border-primary-500/50'
                }`}
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{info.icon}</div>
                  <h4 className="text-xl font-semibold text-white mb-1">
                    {info.name}
                  </h4>
                  <p className="text-sm text-gray-400 mb-2">{info.description}</p>
                  <p className="text-xs text-gray-500">
                    File size: {info.size}
                  </p>
                </div>
                
                <button
                  onClick={() => handleDownload(platform)}
                  disabled={isDownloading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                    isDownloading
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : isRecommended
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400'
                      : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400'
                  }`}
                >
                  {isDownloading ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircleIcon className="h-5 w-5" />
                      Downloaded!
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <ArrowDownTrayIcon className="h-5 w-5" />
                      Download {info.fileType}
                    </div>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Installation Instructions */}
      <div className="bg-black/30 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          📋 After Download - Simple Installation
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="text-center">
            <div className="bg-blue-600/20 rounded-lg p-4 mb-3">
              <h4 className="font-semibold text-blue-300 mb-2">🪟 Windows</h4>
              <p className="text-gray-300">
                1. Double-click the downloaded .exe file<br/>
                2. Click "Yes" if Windows asks for permission<br/>
                3. Follow the setup wizard<br/>
                4. Launch from Desktop or Start Menu
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-600/20 rounded-lg p-4 mb-3">
              <h4 className="font-semibold text-purple-300 mb-2">🍎 macOS</h4>
              <p className="text-gray-300">
                1. Double-click the downloaded .dmg file<br/>
                2. Drag Crow's Eye to Applications folder<br/>
                3. Right-click and select "Open" first time<br/>
                4. Launch from Applications or Launchpad
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-600/20 rounded-lg p-4 mb-3">
              <h4 className="font-semibold text-orange-300 mb-2">🐧 Linux</h4>
              <p className="text-gray-300">
                1. Make the .AppImage file executable<br/>
                2. Double-click to run, or<br/>
                3. Run from terminal: ./CrowsEye.AppImage<br/>
                4. Optionally integrate with AppImageLauncher
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System Requirements */}
      <div className="bg-yellow-900/20 rounded-xl p-6 border border-yellow-600/30">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-yellow-400 font-semibold mb-2">System Requirements</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-yellow-200">
              <div>
                <strong>Windows:</strong> Windows 10 or 11, 4GB RAM, 500MB storage
              </div>
              <div>
                <strong>macOS:</strong> macOS 10.15+, 4GB RAM, 500MB storage
              </div>
              <div>
                <strong>Linux:</strong> Ubuntu 18.04+/equivalent, 4GB RAM, 500MB storage
              </div>
            </div>
            <p className="text-yellow-300 mt-3 text-sm">
              💡 <strong>Need help?</strong> Check our{' '}
              <a 
                href="https://github.com/cj1101/CrowsEyeWebsite/wiki" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-yellow-100"
              >
                installation guide
              </a>{' '}
              or{' '}
              <a 
                href="/contact" 
                className="underline hover:text-yellow-100"
              >
                contact support
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 