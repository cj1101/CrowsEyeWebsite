'use client'

import React from 'react'

export default function TestDownload() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Download Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Test Downloads:</h2>
          
          <div className="space-y-2">
            <div>
              <a 
                href="/api/download/installer" 
                className="bg-blue-600 text-white px-4 py-2 rounded inline-block mr-4"
              >
                Download Python Installer
              </a>
              <span className="text-gray-400">Should download: crows-eye-installer.py</span>
            </div>
            
            <div>
              <a 
                href="/api/download/windows-installer" 
                className="bg-green-600 text-white px-4 py-2 rounded inline-block mr-4"
              >
                Download Windows Installer
              </a>
              <span className="text-gray-400">Should download: crows-eye-installer.bat</span>
            </div>
            
            <div>
              <a 
                href="https://github.com/cj1101/offlineFinal/archive/refs/heads/main.zip" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-600 text-white px-4 py-2 rounded inline-block mr-4"
              >
                Download GitHub ZIP
              </a>
              <span className="text-gray-400">Should download from GitHub</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1 text-gray-300">
            <li>Click each download link above</li>
            <li>Check your Downloads folder</li>
            <li>Verify the files downloaded correctly</li>
            <li>If any fail, check browser console for errors</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 