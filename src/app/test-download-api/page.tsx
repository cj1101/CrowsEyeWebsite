'use client'

import React, { useState } from 'react'

interface TestResult {
  status: number | string
  data?: any
  error?: string
}

export default function TestDownloadAPI() {
  const [results, setResults] = useState<{[key: string]: TestResult}>({})
  const [loading, setLoading] = useState<{[key: string]: boolean}>({})

  const testPlatform = async (platform: string) => {
    setLoading((prev: {[key: string]: boolean}) => ({ ...prev, [platform]: true }))
    
    try {
      const response = await fetch(`/api/download/verify?platform=${platform}`)
      const data = await response.json()
      
      setResults((prev: {[key: string]: TestResult}) => ({
        ...prev,
        [platform]: {
          status: response.status,
          data: data
        }
      }))
    } catch (error) {
      setResults((prev: {[key: string]: TestResult}) => ({
        ...prev,
        [platform]: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }))
    } finally {
      setLoading((prev: {[key: string]: boolean}) => ({ ...prev, [platform]: false }))
    }
  }

  const testGitHubAPI = async () => {
    setLoading((prev: {[key: string]: boolean}) => ({ ...prev, github: true }))
    
    try {
      const response = await fetch('https://api.github.com/repos/cj1101/offlineFinal/releases/latest')
      const data = await response.json()
      
      setResults((prev: {[key: string]: TestResult}) => ({
        ...prev,
        github: {
          status: response.status,
          data: data
        }
      }))
    } catch (error) {
      setResults((prev: {[key: string]: TestResult}) => ({
        ...prev,
        github: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }))
    } finally {
      setLoading((prev: {[key: string]: boolean}) => ({ ...prev, github: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Download API Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Platform APIs</h2>
            <div className="space-y-4">
              {['windows', 'mac', 'linux'].map(platform => (
                <div key={platform}>
                  <button
                    onClick={() => testPlatform(platform)}
                    disabled={loading[platform]}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded mr-4"
                  >
                    {loading[platform] ? 'Testing...' : `Test ${platform}`}
                  </button>
                  {results[platform] && (
                    <div className="mt-2 p-3 bg-gray-700 rounded text-sm">
                      <div className="font-semibold">Status: {results[platform].status}</div>
                      <pre className="mt-2 overflow-auto">
                        {JSON.stringify(results[platform], null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test GitHub API Direct</h2>
            <button
              onClick={testGitHubAPI}
              disabled={loading.github}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded"
            >
              {loading.github ? 'Testing...' : 'Test GitHub API'}
            </button>
            {results.github && (
              <div className="mt-4 p-3 bg-gray-700 rounded text-sm">
                <div className="font-semibold">Status: {results.github.status}</div>
                <pre className="mt-2 overflow-auto max-h-96">
                  {JSON.stringify(results.github, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Repository Information</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Repository:</strong> https://github.com/cj1101/Crow-s-Eye-Marketing-Agent</div>
            <div><strong>Expected Files:</strong></div>
            <ul className="list-disc list-inside ml-4">
              <li>CrowsEye-Setup-Windows.exe</li>
              <li>CrowsEye-Setup-macOS.dmg</li>
              <li>CrowsEye-Setup-Linux.AppImage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 