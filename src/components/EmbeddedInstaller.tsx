'use client'

import React, { useState } from 'react'
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

interface InstallerMetadata {
  version: string;
  size: string;
  lastUpdated: string;
  features: string[];
}

interface PlatformOption {
  name: string;
  icon: string;
  downloadUrl: string;
  size: string;
  description: string;
}

export default function EmbeddedInstaller() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success' | 'error'>('idle')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('windows')
  
  const [metadata] = useState<InstallerMetadata>({
    version: '1.1.0',
    size: '45.2 MB',
    lastUpdated: '2024-01-15',
    features: ['AI Content Generation', 'Multi-Platform Support', 'Media Library', 'Analytics Dashboard', 'VEO AI Video Generation', 'Smart Gallery Generator']
  })

  const platforms: PlatformOption[] = [
    {
      name: 'Windows',
      icon: '🪟',
      downloadUrl: '/downloads/desktop/CrowsEye_Marketing_Suite_1.0.0_Windows.zip',
      size: '45.2 MB',
      description: 'Windows 10/11 (64-bit)'
    },
    {
      name: 'macOS',
      icon: '🍎',
      downloadUrl: '/downloads/desktop/CrowsEye_Marketing_Suite_1.0.0_macOS.zip',
      size: '42.8 MB',
      description: 'macOS 10.15+ (Intel & Apple Silicon)'
    },
    {
      name: 'Linux',
      icon: '🐧',
      downloadUrl: '/downloads/desktop/CrowsEye_Marketing_Suite_1.0.0_Linux.zip',
      size: '41.5 MB',
      description: 'Ubuntu 18.04+ / Debian 10+'
    }
  ]

  const handleDownload = async () => {
    setIsDownloading(true)
    setDownloadStatus('downloading')

    try {
      const selectedPlatformData = platforms.find(p => p.name.toLowerCase() === selectedPlatform)
      if (!selectedPlatformData) {
        throw new Error('Platform not found')
      }

      // Create actual download link
      const link = document.createElement('a')
      link.href = selectedPlatformData.downloadUrl
      link.download = `CrowsEye_Marketing_Suite_${selectedPlatformData.name}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setDownloadStatus('success')
    } catch (error) {
      console.error('Download failed:', error)
      setDownloadStatus('error')
    } finally {
      setIsDownloading(false)
    }
  }

  const selectedPlatformData = platforms.find(p => p.name.toLowerCase() === selectedPlatform)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Download Crow's Eye Marketing Suite
        </h3>
        <p className="text-sm text-gray-600">
          Get the full desktop application with all features
        </p>
      </div>

      {/* Platform Selection */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Choose your platform:</h4>
        <div className="grid grid-cols-3 gap-2">
          {platforms.map((platform) => (
            <button
              key={platform.name.toLowerCase()}
              onClick={() => setSelectedPlatform(platform.name.toLowerCase())}
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                selectedPlatform === platform.name.toLowerCase()
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl mb-1">{platform.icon}</span>
              <span className="text-xs font-medium text-gray-700">{platform.name}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedPlatformData && (
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Platform:</span>
              <span className="font-medium">{selectedPlatformData.description}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Version:</span>
              <span className="font-medium">{metadata.version}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Size:</span>
              <span className="font-medium">{selectedPlatformData.size}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Updated:</span>
              <span className="font-medium">{metadata.lastUpdated}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Features included:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          {metadata?.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className={`w-full flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
          downloadStatus === 'success'
            ? 'bg-green-600 text-white'
            : downloadStatus === 'error'
            ? 'bg-red-600 text-white'
            : isDownloading
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {downloadStatus === 'downloading' && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        )}
        {downloadStatus === 'success' && (
          <CheckCircleIcon className="h-4 w-4 mr-2" />
        )}
        {downloadStatus === 'error' && (
          <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
        )}
        {downloadStatus === 'idle' && <ArrowDownTrayIcon className="h-4 w-4 mr-2" />}
        
        {downloadStatus === 'downloading' && 'Downloading...'}
        {downloadStatus === 'success' && 'Download Complete!'}
        {downloadStatus === 'error' && 'Download Failed'}
        {downloadStatus === 'idle' && `Download for ${selectedPlatformData?.name}`}
      </button>

      {downloadStatus === 'error' && (
        <p className="mt-2 text-xs text-red-600 text-center">
          Download failed. Please try again or contact support.
        </p>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Compatible with Windows, macOS, and Linux</p>
        <p>Free download • No registration required</p>
      </div>
    </div>
  )
} 