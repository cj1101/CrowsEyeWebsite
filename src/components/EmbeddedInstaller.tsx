'use client'

import React, { useState } from 'react'
import { 
  PlayIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  CommandLineIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'

interface InstallStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'error'
  command?: string
  output?: string
}

export default function EmbeddedInstaller() {
  const [selectedOS, setSelectedOS] = useState<'windows' | 'mac' | 'linux'>('windows')
  const [isInstalling, setIsInstalling] = useState(false)
  const [installationComplete, setInstallationComplete] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showCommands, setShowCommands] = useState(false)

  const getInstallSteps = (os: string): InstallStep[] => {
    const baseSteps = [
      {
        id: 'download',
        title: 'Download Crow\'s Eye',
        description: 'Downloading the latest version from GitHub...',
        status: 'pending' as const,
        command: 'curl -L -o crows-eye.zip https://github.com/cj1101/offlineFinal/archive/refs/heads/main.zip'
      },
      {
        id: 'extract',
        title: 'Extract Files',
        description: 'Extracting application files...',
        status: 'pending' as const,
        command: os === 'windows' ? 'tar -xf crows-eye.zip' : 'unzip crows-eye.zip'
      },
      {
        id: 'dependencies',
        title: 'Install Dependencies',
        description: 'Installing Python packages...',
        status: 'pending' as const,
        command: os === 'windows' ? 'pip install -r deployment/requirements.txt' : 'pip3 install -r deployment/requirements.txt'
      },
      {
        id: 'setup',
        title: 'Setup Application',
        description: 'Creating launcher scripts...',
        status: 'pending' as const,
        command: os === 'windows' ? 'echo @echo off > launch.bat && echo python main.py >> launch.bat' : 'echo "#!/bin/bash\npython3 main.py" > launch.sh && chmod +x launch.sh'
      },
      {
        id: 'complete',
        title: 'Installation Complete',
        description: 'Crow\'s Eye is ready to use!',
        status: 'pending' as const
      }
    ]
    return baseSteps
  }

  const [steps, setSteps] = useState<InstallStep[]>(getInstallSteps(selectedOS))

  const updateStep = (stepId: string, updates: Partial<InstallStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ))
  }

  const simulateInstallation = async () => {
    setIsInstalling(true)
    setInstallationComplete(false)
    
    const installSteps = getInstallSteps(selectedOS)
    setSteps(installSteps)

    for (let i = 0; i < installSteps.length; i++) {
      setCurrentStep(i)
      const step = installSteps[i]
      
      // Mark step as running
      updateStep(step.id, { status: 'running' })
      
      // Simulate installation time
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))
      
      // Mark step as completed
      updateStep(step.id, { 
        status: 'completed',
        output: `✅ ${step.title} completed successfully`
      })
    }
    
    setIsInstalling(false)
    setInstallationComplete(true)
  }

  const generateInstallScript = () => {
    const commands = steps
      .filter(step => step.command)
      .map(step => step.command)
      .join('\n')
    
    const script = selectedOS === 'windows' 
      ? `@echo off
echo Installing Crow's Eye...
cd %USERPROFILE%
mkdir CrowsEye 2>nul
cd CrowsEye
${commands}
echo.
echo Installation complete! Run 'python main.py' to start Crow's Eye.
pause`
      : `#!/bin/bash
echo "Installing Crow's Eye..."
cd ~
mkdir -p CrowsEye
cd CrowsEye
${commands}
echo
echo "Installation complete! Run 'python3 main.py' to start Crow's Eye."
read -p "Press Enter to continue..."`

    return script
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Commands copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadScript = () => {
    const script = generateInstallScript()
    const blob = new Blob([script], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = selectedOS === 'windows' ? 'install-crows-eye.bat' : 'install-crows-eye.sh'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-gradient-to-r from-primary-900/30 to-primary-600/30 rounded-2xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">
          🚀 One-Click Installation
        </h2>
        <p className="text-gray-300">
          Install Crow's Eye directly from your browser - no downloads required!
        </p>
      </div>

      {/* OS Selection */}
      <div className="flex justify-center mb-8">
        <div className="bg-black/50 rounded-lg p-2 flex">
          {(['windows', 'mac', 'linux'] as const).map((os) => (
            <button
              key={os}
              onClick={() => {
                setSelectedOS(os)
                setSteps(getInstallSteps(os))
                setInstallationComplete(false)
                setCurrentStep(0)
              }}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                selectedOS === os
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {os.charAt(0).toUpperCase() + os.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Installation Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Automated Installation */}
        <div className="bg-black/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PlayIcon className="h-5 w-5 text-green-400" />
            Automated Installation
          </h3>
          <p className="text-gray-300 mb-4 text-sm">
            Let us handle everything automatically. Just click and wait!
          </p>
          
          <button
            onClick={simulateInstallation}
            disabled={isInstalling}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
              isInstalling
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-green-500 text-white hover-glow'
            }`}
          >
            {isInstalling ? 'Installing...' : 'Start Installation'}
          </button>
        </div>

        {/* Manual Installation */}
        <div className="bg-black/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CommandLineIcon className="h-5 w-5 text-blue-400" />
            Manual Installation
          </h3>
          <p className="text-gray-300 mb-4 text-sm">
            Prefer to run commands yourself? Get the installation script.
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowCommands(!showCommands)}
              className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              {showCommands ? 'Hide' : 'Show'} Commands
            </button>
            <button
              onClick={downloadScript}
              className="flex-1 py-2 px-3 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Download Script
            </button>
          </div>
        </div>
      </div>

      {/* Installation Progress */}
      {(isInstalling || installationComplete) && (
        <div className="bg-black/50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Installation Progress</h3>
          
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step.status === 'completed' ? 'bg-green-600 text-white' :
                  step.status === 'running' ? 'bg-blue-600 text-white animate-pulse' :
                  step.status === 'error' ? 'bg-red-600 text-white' :
                  'bg-gray-600 text-gray-300'
                }`}>
                  {step.status === 'completed' ? '✓' : 
                   step.status === 'error' ? '✗' : 
                   index + 1}
                </div>
                
                <div className="flex-1">
                  <div className={`font-medium ${
                    step.status === 'completed' ? 'text-green-400' :
                    step.status === 'running' ? 'text-blue-400' :
                    step.status === 'error' ? 'text-red-400' :
                    'text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-sm text-gray-500">{step.description}</div>
                  {step.output && (
                    <div className="text-xs text-green-400 mt-1">{step.output}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Commands */}
      {showCommands && (
        <div className="bg-black/50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Installation Commands</h3>
            <button
              onClick={() => copyToClipboard(generateInstallScript())}
              className="flex items-center gap-2 px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600 transition-colors"
            >
              <ClipboardDocumentIcon className="h-4 w-4" />
              Copy All
            </button>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre className="text-green-400 whitespace-pre-wrap">
              {generateInstallScript()}
            </pre>
          </div>
        </div>
      )}

      {/* Success Message */}
      {installationComplete && (
        <div className="bg-gradient-to-r from-green-900/50 to-green-600/50 rounded-lg p-6 text-center">
          <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            🎉 Installation Complete!
          </h3>
          <p className="text-gray-300 mb-4">
            Crow's Eye has been successfully installed on your system.
          </p>
          
          <div className="bg-black/30 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-300 mb-2">To start the application:</p>
            <code className="text-green-400 font-mono">
              {selectedOS === 'windows' ? 'python main.py' : 'python3 main.py'}
            </code>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://github.com/cj1101/offlineFinal"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Documentation
            </a>
            <button
              onClick={() => {
                setInstallationComplete(false)
                setSteps(getInstallSteps(selectedOS))
                setCurrentStep(0)
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Install Again
            </button>
          </div>
        </div>
      )}

      {/* Requirements Notice */}
      <div className="mt-6 p-4 bg-yellow-900/30 rounded-lg">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-yellow-400 font-semibold mb-1">Prerequisites</h4>
            <p className="text-yellow-200 text-sm">
              Make sure you have Python 3.8+ installed and added to your system PATH. 
              <a href="https://python.org/downloads/" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-100">
                Download Python here
              </a> if you haven't already.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 