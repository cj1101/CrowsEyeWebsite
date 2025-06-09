'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  CommandLineIcon,
  FolderIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

interface InstallationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  details?: string[];
}

interface PlatformInfo {
  name: string;
  icon: React.ComponentType<any>;
  downloadUrl: string;
  size: string;
  requirements: string[];
  instructions: string[];
}

export default function WebAppInstaller() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('windows');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [installationSteps, setInstallationSteps] = useState<InstallationStep[]>([
    {
      id: 'download',
      title: 'Download Package',
      description: 'Download the Crow\'s Eye Web Application package',
      status: 'pending'
    },
    {
      id: 'extract',
      title: 'Extract Files',
      description: 'Extract the downloaded ZIP file to your desired location',
      status: 'pending',
      details: [
        'Right-click the downloaded ZIP file',
        'Select "Extract All..." or use your preferred extraction tool',
        'Choose a destination folder (e.g., C:\\CrowsEye or ~/CrowsEye)',
        'Click "Extract" to complete the process'
      ]
    },
    {
      id: 'dependencies',
      title: 'Install Dependencies',
      description: 'Install required dependencies using npm or yarn',
      status: 'pending',
      details: [
        'Open terminal/command prompt in the extracted folder',
        'Run: npm install (or yarn install)',
        'Wait for all dependencies to be installed',
        'This may take a few minutes depending on your internet connection'
      ]
    },
    {
      id: 'configure',
      title: 'Configure Application',
      description: 'Set up your environment and API keys',
      status: 'pending',
      details: [
        'Copy .env.example to .env.local',
        'Add your API keys and configuration',
        'Configure Firebase settings if needed',
        'Set up any required integrations'
      ]
    },
    {
      id: 'run',
      title: 'Start Application',
      description: 'Launch the development server',
      status: 'pending',
      details: [
        'Run: npm run dev (or yarn dev)',
        'Open your browser to http://localhost:3000',
        'The application should now be running locally',
        'You can now access all features of Crow\'s Eye Web App'
      ]
    }
  ]);

  const platforms: Record<string, PlatformInfo> = {
    windows: {
      name: 'Windows',
      icon: ComputerDesktopIcon,
      downloadUrl: '/downloads/crowseye-web-app-windows.zip',
      size: '45.2 MB',
      requirements: [
        'Windows 10 or later',
        'Node.js 18+ (LTS recommended)',
        'npm 8+ or yarn 1.22+',
        '2GB free disk space',
        'Internet connection for dependencies'
      ],
      instructions: [
        'Download the ZIP file',
        'Extract to your preferred location',
        'Open Command Prompt or PowerShell',
        'Navigate to the extracted folder',
        'Run installation commands'
      ]
    },
    mac: {
      name: 'macOS',
      icon: ComputerDesktopIcon,
      downloadUrl: '/downloads/crowseye-web-app-macos.zip',
      size: '44.8 MB',
      requirements: [
        'macOS 10.15 (Catalina) or later',
        'Node.js 18+ (LTS recommended)',
        'npm 8+ or yarn 1.22+',
        '2GB free disk space',
        'Internet connection for dependencies'
      ],
      instructions: [
        'Download the ZIP file',
        'Double-click to extract automatically',
        'Open Terminal application',
        'Navigate to the extracted folder',
        'Run installation commands'
      ]
    },
    linux: {
      name: 'Linux',
      icon: CommandLineIcon,
      downloadUrl: '/downloads/crowseye-web-app-linux.zip',
      size: '43.9 MB',
      requirements: [
        'Ubuntu 18.04+ / CentOS 7+ / Similar',
        'Node.js 18+ (LTS recommended)',
        'npm 8+ or yarn 1.22+',
        '2GB free disk space',
        'Internet connection for dependencies'
      ],
      instructions: [
        'Download the ZIP file',
        'Extract using unzip command or file manager',
        'Open terminal in the extracted directory',
        'Make sure Node.js is installed',
        'Run installation commands'
      ]
    }
  };

  const currentPlatform = platforms[selectedPlatform];

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    // Update first step to active
    setInstallationSteps(prev => prev.map(step => 
      step.id === 'download' 
        ? { ...step, status: 'active' }
        : step
    ));

    try {
      // Simulate download progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setDownloadProgress(i);
      }

      // Create and trigger download
      const link = document.createElement('a');
      link.href = currentPlatform.downloadUrl;
      link.download = `crowseye-web-app-${selectedPlatform}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Mark download as completed
      setInstallationSteps(prev => prev.map(step => 
        step.id === 'download' 
          ? { ...step, status: 'completed' }
          : step.id === 'extract'
          ? { ...step, status: 'active' }
          : step
      ));

    } catch (error) {
      setInstallationSteps(prev => prev.map(step => 
        step.id === 'download' 
          ? { ...step, status: 'error' }
          : step
      ));
    } finally {
      setIsDownloading(false);
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'active':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'active':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Install Crow's Eye Web Application
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Download and set up the complete Crow's Eye marketing suite on your local machine. 
          Same powerful features, now running locally with full control.
        </p>
      </div>

      {/* Platform Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Choose Your Platform
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(platforms).map(([key, platform]) => {
            const IconComponent = platform.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedPlatform(key)}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200 text-left
                  ${selectedPlatform === key
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {platform.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {platform.size}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* System Requirements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          System Requirements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Requirements</h3>
            <ul className="space-y-2">
              {currentPlatform.requirements.map((req, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Quick Setup</h3>
            <ul className="space-y-2">
              {currentPlatform.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Download Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Download Package
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Get the complete Crow's Eye Web Application for {currentPlatform.name}
            </p>
          </div>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>Download ({currentPlatform.size})</span>
              </>
            )}
          </button>
        </div>

        {isDownloading && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Download Progress</span>
              <span>{downloadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Installation Steps */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          Installation Steps
        </h2>
        <div className="space-y-4">
          {installationSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${getStepColor(step.status)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getStepIcon(step.status)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{step.title}</h3>
                  <p className="text-sm opacity-80 mb-2">{step.description}</p>
                  
                  {step.details && step.status !== 'pending' && (
                    <div className="mt-3 space-y-1">
                      {step.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-start space-x-2 text-xs">
                          <span className="flex-shrink-0 w-4 h-4 bg-current opacity-20 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                            {detailIndex + 1}
                          </span>
                          <span className="opacity-70">{detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Important Notes
            </h3>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>• This is the same application you're currently using, but running locally</li>
              <li>• All your data stays on your machine - complete privacy and control</li>
              <li>• Requires internet connection only for AI features and social media integrations</li>
              <li>• Updates can be downloaded and installed manually when available</li>
              <li>• For support, visit our documentation or contact our team</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 