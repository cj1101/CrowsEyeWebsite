'use client'

import React, { useState } from 'react'
import { 
  CheckCircleIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  CloudArrowDownIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

interface InstallerMetadata {
  version: string;
  size: string;
  lastUpdated: string;
  features: string[];
}

export default function EmbeddedInstaller() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloading' | 'success' | 'error'>('idle')
  const [metadata] = useState<InstallerMetadata>({
    version: '1.0.0',
    size: '45.2 MB',
    lastUpdated: '2024-01-15',
    features: ['AI Content Generation', 'Multi-Platform Support', 'Media Library', 'Analytics Dashboard']
  })

  const handleDownload = async () => {
    setIsDownloading(true)
    setDownloadStatus('downloading')

    try {
      // Mock download process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create a mock download link
      const link = document.createElement('a')
      link.href = '#'
      link.download = 'CrowsEye-Setup.exe'
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

  const platformInfo = {
    windows: {
      name: 'Windows',
      icon: '🪟',
      fileType: '.exe',
      size: '~2 MB (Web Installer)',
      description: 'Compatible with Windows 10 and 11'
    },
    mac: {
      name: 'macOS',
      icon: '🍎',
      fileType: '.dmg',
      size: '~2 MB (Web Installer)',
      description: 'Compatible with macOS 10.15 and later'
    },
    linux: {
      name: 'Linux',
      icon: '🐧',
      fileType: '.AppImage',
      size: '~2 MB (Web Installer)',
      description: 'Compatible with most Linux distributions'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Download Crow's Eye Marketing Suite
        </h3>
        <p className="text-sm text-gray-600">
          Get the full desktop application with all features
        </p>
      </div>

      {metadata && (
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Version:</span>
            <span className="font-medium">{metadata.version}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Size:</span>
            <span className="font-medium">{metadata.size}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Updated:</span>
            <span className="font-medium">{metadata.lastUpdated}</span>
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
        {downloadStatus === 'idle' && 'Download Now'}
      </button>

      {downloadStatus === 'error' && (
        <p className="mt-2 text-xs text-red-600 text-center">
          Download failed. Please try again or contact support.
        </p>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Compatible with Windows 10/11</p>
        <p>Free download • No registration required</p>
      </div>
    </div>
  )
} 