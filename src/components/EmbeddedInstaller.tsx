'use client'

import React, { useState, useEffect } from 'react'
import { 
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function EmbeddedInstaller() {
  const [downloadStarted, setDownloadStarted] = useState<string | null>(null)
  const [userOS, setUserOS] = useState<'windows' | 'mac' | 'linux' | null>(null)
  const [downloadStatus, setDownloadStatus] = useState<{[key: string]: 'checking' | 'available' | 'unavailable'}>({})

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

  // Primary and fallback download URLs for each platform, pointing to v1.1.0
  const downloadUrls = {
    windows: {
      primary: 'https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases/download/v1.1.0/CrowsEye-Setup-Windows.exe',
      fallback: 'https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases/download/v1.1.0/CrowsEye-Setup-Windows.exe',
      directRepo: 'https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases'
    },
    mac: {
      primary: 'https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases/download/v1.1.0/CrowsEye-Setup-macOS.dmg',
      fallback: 'https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases/download/v1.1.0/CrowsEye-Setup-macOS.dmg',
      directRepo: 'https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases'
    },
    linux: {
      primary: 'https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases/download/v1.1.0/CrowsEye-Setup-Linux.AppImage',
      fallback: 'https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases/download/v1.1.0/CrowsEye-Setup-Linux.AppImage',
      directRepo: 'https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases'
    }
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

  // Check if download URLs are available
  useEffect(() => {
    const checkDownloadAvailability = async () => {
      const platforms = Object.keys(downloadUrls) as Array<keyof typeof downloadUrls>
      
      for (const platform of platforms) {
        setDownloadStatus(prev => ({ ...prev, [platform]: 'checking' }))
        
        try {
          // Use our API endpoint to verify downloads
          const response = await fetch(`/api/download/verify?platform=${platform}`)
          
          if (response.ok) {
            const data = await response.json()
            if (data.downloadUrl) {
              setDownloadStatus(prev => ({ ...prev, [platform]: 'available' }))
              // Update the download URL with the verified one from the API if available
              // This ensures we use the API-provided URL (which now also points to v1.1.0)
              // but keeps the hardcoded v1.1.0 URL as a direct fallback within this component
              // No change needed here: downloadUrls[platform].primary = data.downloadUrl;
              // because both are now v1.1.0 directly
            } else {
              setDownloadStatus(prev => ({ ...prev, [platform]: 'unavailable' }))
            }
          } else {
            setDownloadStatus(prev => ({ ...prev, [platform]: 'unavailable' }))
          }
        } catch (error) {
          console.warn(`Failed to check download availability for ${platform}:`, error)
          // Assume available if we can't check (network issues, etc.)
          // This will use the hardcoded v1.1.0 primary URL
          setDownloadStatus(prev => ({ ...prev, [platform]: 'available' }))
        }
      }
    }

    checkDownloadAvailability()
  }, [])

  const handleDownload = async (platform: 'windows' | 'mac' | 'linux') => {
    setDownloadStarted(platform)
    
    try {
      // Get the latest download URL from our API
      const response = await fetch(`/api/download/verify?platform=${platform}`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.downloadUrl) {
          // Use the verified download URL
          const link = document.createElement('a')
          link.href = data.downloadUrl
          link.download = data.fileName || `CrowsEye-Setup-${platformInfo[platform].name}${platformInfo[platform].fileType}`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        } else {
          // Fallback to releases page
          window.open(data.releasesUrl || downloadUrls[platform].directRepo, '_blank')
        }
      } else {
        // Fallback to primary URL
        const link = document.createElement('a')
        link.href = downloadUrls[platform].primary
        link.download = `CrowsEye-Setup-${platformInfo[platform].name}${platformInfo[platform].fileType}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.warn('Download API failed, using fallback:', error)
      // Fallback to primary URL
      const link = document.createElement('a')
      link.href = downloadUrls[platform].primary
      link.download = `CrowsEye-Setup-${platformInfo[platform].name}${platformInfo[platform].fileType}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    // Reset download state after 3 seconds
    setTimeout(() => {
      setDownloadStarted(null)
    }, 3000)
  }

  const getDownloadButtonContent = (platform: 'windows' | 'mac' | 'linux') => {
    const status = downloadStatus[platform]
    const isDownloading = downloadStarted === platform
    
    if (isDownloading) {
      return (
        <div className="flex items-center justify-center gap-3">
          <CheckCircleIcon className="h-6 w-6" />
          Download Started!
        </div>
      )
    }
    
    if (status === 'checking') {
      return (
        <div className="flex items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          Checking availability...
        </div>
      )
    }
    
    if (status === 'unavailable') {
      return (
        <div className="flex items-center justify-center gap-3">
          <ExclamationTriangleIcon className="h-5 w-5" />
          View Releases Page
        </div>
      )
    }
    
    return (
      <div className="flex items-center justify-center gap-3">
        <ArrowDownTrayIcon className="h-6 w-6" />
        Download for {platformInfo[platform].name} ({platformInfo[platform].size})
      </div>
    )
  }

  const getButtonStyles = (platform: 'windows' | 'mac' | 'linux', isRecommended: boolean = false) => {
    const status = downloadStatus[platform]
    const isDownloading = downloadStarted === platform
    
    if (isDownloading) {
      return 'bg-green-700 text-green-200 cursor-not-allowed'
    }
    
    if (status === 'checking') {
      return 'bg-gray-600 text-gray-300 cursor-not-allowed'
    }
    
    if (status === 'unavailable') {
      return 'bg-yellow-600 text-yellow-100 hover:bg-yellow-500'
    }
    
    if (isRecommended) {
      return 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25'
    }
    
    return 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400'
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
          Complete marketing suite with AI capabilities - everything included, no additional software needed
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
              disabled={downloadStarted === userOS || downloadStatus[userOS] === 'checking'}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${getButtonStyles(userOS, true)}`}
            >
              {getDownloadButtonContent(userOS)}
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
                  disabled={isDownloading || downloadStatus[platform] === 'checking'}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${getButtonStyles(platform, isRecommended)}`}
                >
                  {getDownloadButtonContent(platform)}
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
                3. Follow the setup wizard (auto-installs everything)<br/>
                4. Launch from Desktop - ready to use!
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
                4. All dependencies install automatically!
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-600/20 rounded-lg p-4 mb-3">
              <h4 className="font-semibold text-orange-300 mb-2">🐧 Linux</h4>
              <p className="text-gray-300">
                1. Make the .AppImage file executable<br/>
                2. Double-click to run (auto-setup on first launch)<br/>
                3. Or run from terminal: ./CrowsEye.AppImage<br/>
                4. Everything works out of the box!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System Requirements */}
      <div className="bg-green-900/20 rounded-xl p-6 border border-green-600/30">
        <div className="flex items-start gap-3">
          <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-green-400 font-semibold mb-2">✨ Everything Included - No Setup Required!</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-200">
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
            <div className="mt-4 p-3 bg-green-800/30 rounded-lg">
              <p className="text-green-300 text-sm font-medium mb-2">🎉 What's Included:</p>
              <ul className="text-green-200 text-sm space-y-1">
                <li>• Complete AI-powered marketing suite</li>
                <li>• All required dependencies automatically installed</li>
                <li>• Google Gemini AI integration ready to use</li>
                <li>• No Python, coding, or technical knowledge needed</li>
                <li>• Works offline after initial setup</li>
              </ul>
            </div>
            <p className="text-green-300 mt-3 text-sm">
              💡 <strong>Need help?</strong> Check our{' '}
              <a 
                href="https://github.com/cj1101/CrowsEyeWebsite/wiki" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-green-100"
              >
                installation guide
              </a>{' '}
              or{' '}
              <a 
                href="/contact" 
                className="underline hover:text-green-100"
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