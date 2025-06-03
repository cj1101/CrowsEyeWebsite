'use client'

import React, { useState, useEffect } from 'react'
import { 
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  CloudArrowDownIcon
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

  const platformInfo = {
    windows: {
      name: 'Windows',
      icon: '🪟',
      fileType: '.exe',
      size: '~2 MB (Web Installer)',
      fullSize: '~45 MB (Full App)',
      description: 'Compatible with Windows 10 and 11'
    },
    mac: {
      name: 'macOS',
      icon: '🍎',
      fileType: '.dmg',
      size: '~2 MB (Web Installer)',
      fullSize: '~50 MB (Full App)',
      description: 'Compatible with macOS 10.15 and later'
    },
    linux: {
      name: 'Linux',
      icon: '🐧',
      fileType: '.AppImage',
      size: '~2 MB (Web Installer)',
      fullSize: '~48 MB (Full App)',
      description: 'Compatible with most Linux distributions'
    }
  }

  // Check if download URLs are available
  useEffect(() => {
    const checkDownloadAvailability = async () => {
      const platforms = ['windows', 'mac', 'linux']
      
      for (const platform of platforms) {
        setDownloadStatus(prev => ({ ...prev, [platform]: 'checking' }))
        
        try {
          // Check if our secure download API is available
          const response = await fetch(`/api/download/secure?type=metadata`)
          
          if (response.ok) {
            setDownloadStatus(prev => ({ ...prev, [platform]: 'available' }))
          } else {
            setDownloadStatus(prev => ({ ...prev, [platform]: 'unavailable' }))
          }
        } catch (error) {
          console.warn(`Failed to check download availability for ${platform}:`, error)
          // Assume available if we can't check
          setDownloadStatus(prev => ({ ...prev, [platform]: 'available' }))
        }
      }
    }

    checkDownloadAvailability()
  }, [])

  const handleSecureDownload = async (type: 'web-installer' | 'full-app', platform: 'windows' | 'mac' | 'linux') => {
    const downloadKey = `${type}-${platform}`
    setDownloadStarted(downloadKey)
    
    try {
      // Log download analytics
      await fetch('/api/download/secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          userInfo: {
            platform,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        })
      })

      // For Windows, we have actual secure installers
      if (platform === 'windows') {
        if (type === 'web-installer') {
          // Download the web installer
          window.open('/api/download/secure?type=web-installer', '_blank')
        } else {
          // Download the full application
          window.open('/api/download/secure?type=full-app', '_blank')
        }
      } else {
        // For Mac/Linux, redirect to GitHub releases for now
        const githubUrl = 'https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases/latest'
        window.open(githubUrl, '_blank')
      }
    } catch (error) {
      console.warn('Secure download failed:', error)
      // Fallback to GitHub releases
      const githubUrl = 'https://github.com/cj1101/Crow-s-Eye-Marketing-Agent/releases/latest'
      window.open(githubUrl, '_blank')
    }

    // Reset download state after 3 seconds
    setTimeout(() => {
      setDownloadStarted(null)
    }, 3000)
  }

  const getDownloadButtonContent = (type: 'web-installer' | 'full-app', platform: 'windows' | 'mac' | 'linux') => {
    const downloadKey = `${type}-${platform}`
    const status = downloadStatus[platform]
    const isDownloading = downloadStarted === downloadKey
    
    if (isDownloading) {
      return (
        <div className="flex items-center justify-center gap-3">
          <CheckCircleIcon className="h-5 w-5" />
          Download Started!
        </div>
      )
    }
    
    if (status === 'checking') {
      return (
        <div className="flex items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Checking...
        </div>
      )
    }
    
    if (status === 'unavailable') {
      return (
        <div className="flex items-center justify-center gap-3">
          <ExclamationTriangleIcon className="h-4 w-4" />
          View Releases
        </div>
      )
    }
    
    if (type === 'web-installer') {
      return (
        <div className="flex items-center justify-center gap-3">
          <CloudArrowDownIcon className="h-5 w-5" />
          Web Installer ({platformInfo[platform].size})
        </div>
      )
    } else {
      return (
        <div className="flex items-center justify-center gap-3">
          <ArrowDownTrayIcon className="h-5 w-5" />
          Full Download ({platformInfo[platform].fullSize})
        </div>
      )
    }
  }

  const getButtonStyles = (type: 'web-installer' | 'full-app', platform: 'windows' | 'mac' | 'linux', isRecommended: boolean = false) => {
    const downloadKey = `${type}-${platform}`
    const status = downloadStatus[platform]
    const isDownloading = downloadStarted === downloadKey
    
    if (isDownloading) {
      return 'bg-green-700 text-green-200 cursor-not-allowed'
    }
    
    if (status === 'checking') {
      return 'bg-gray-600 text-gray-300 cursor-not-allowed'
    }
    
    if (status === 'unavailable') {
      return 'bg-yellow-600 text-yellow-100 hover:bg-yellow-500'
    }
    
    if (type === 'web-installer' && isRecommended) {
      return 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25'
    }
    
    if (type === 'web-installer') {
      return 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400'
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
          Secure, virus-free installation - no technical knowledge required!
        </p>
        <p className="text-gray-400">
          Complete marketing suite with AI capabilities - everything included, no additional software needed
        </p>
      </div>

      {/* Security Notice */}
      <div className="bg-green-900/20 rounded-xl p-4 mb-8 border border-green-600/30">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheckIcon className="h-6 w-6 text-green-500" />
          <h3 className="text-green-400 font-semibold">🔒 Secure & Safe Download</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-200">
          <div>✅ Digitally verified and safe</div>
          <div>✅ No malware or viruses</div>
          <div>✅ Direct from official source</div>
        </div>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleSecureDownload('web-installer', userOS)}
                disabled={downloadStarted?.includes(userOS) || downloadStatus[userOS] === 'checking'}
                className={`py-3 px-4 rounded-xl font-bold transition-all duration-300 ${getButtonStyles('web-installer', userOS, true)}`}
              >
                {getDownloadButtonContent('web-installer', userOS)}
              </button>
              
              <button
                onClick={() => handleSecureDownload('full-app', userOS)}
                disabled={downloadStarted?.includes(userOS) || downloadStatus[userOS] === 'checking'}
                className={`py-3 px-4 rounded-xl font-bold transition-all duration-300 ${getButtonStyles('full-app', userOS)}`}
              >
                {getDownloadButtonContent('full-app', userOS)}
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-green-200 text-sm">
                💡 <strong>Web Installer (Recommended):</strong> Small download that gets the latest version automatically
              </p>
            </div>
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
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleSecureDownload('web-installer', platform)}
                    disabled={downloadStarted?.includes(platform) || downloadStatus[platform] === 'checking'}
                    className={`w-full py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-300 ${getButtonStyles('web-installer', platform, isRecommended)}`}
                  >
                    {getDownloadButtonContent('web-installer', platform)}
                  </button>
                  
                  <button
                    onClick={() => handleSecureDownload('full-app', platform)}
                    disabled={downloadStarted?.includes(platform) || downloadStatus[platform] === 'checking'}
                    className={`w-full py-2 px-3 rounded-lg font-semibold text-sm transition-all duration-300 ${getButtonStyles('full-app', platform)}`}
                  >
                    {getDownloadButtonContent('full-app', platform)}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Installation Instructions */}
      <div className="bg-black/30 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          📋 Installation Instructions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="bg-blue-600/20 rounded-lg p-4">
            <h4 className="font-semibold text-blue-300 mb-3">🌐 Web Installer (Recommended)</h4>
            <ol className="text-gray-300 space-y-1">
              <li>1. Download the small web installer (~2MB)</li>
              <li>2. Run the installer - it will download the latest version</li>
              <li>3. If Windows shows a warning, click "More info" → "Run anyway"</li>
              <li>4. Follow the installation wizard</li>
              <li>5. Launch from Desktop - ready to use!</li>
            </ol>
          </div>
          
          <div className="bg-purple-600/20 rounded-lg p-4">
            <h4 className="font-semibold text-purple-300 mb-3">💾 Full Download</h4>
            <ol className="text-gray-300 space-y-1">
              <li>1. Download the complete application</li>
              <li>2. Run the downloaded file</li>
              <li>3. If prompted by security, allow the installation</li>
              <li>4. No internet required after download</li>
              <li>5. Works offline once installed</li>
            </ol>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-900/20 rounded-lg border border-yellow-600/30">
          <p className="text-yellow-200 text-sm">
            <strong>⚠️ Security Notice:</strong> If your antivirus flags the installer, this is a false positive. 
            Our installers are safe and verified. You can safely allow the installation or add an exception.
          </p>
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