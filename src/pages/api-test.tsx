import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function ApiTest() {
  const [apiStatus, setApiStatus] = useState<string>('Testing...');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testApiConnection();
  }, []);

  const getApiUrl = () => {
    // Try production API first since it's more reliable
    return 'https://crow-eye-api-605899951231.us-central1.run.app';
  };

  const testApiConnection = async () => {
    try {
      const apiUrl = getApiUrl();
      console.log('Testing API:', apiUrl);
      
      const response = await fetch(`${apiUrl}/api/test`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        setApiStatus('✅ Connected to Production API');
        setApiResponse(data);
        setError(null);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('API connection error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setApiStatus('❌ Failed to connect to API');
    }
  };

  const testHealthEndpoint = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/health`);
      if (response.ok) {
        const data = await response.json();
        setApiResponse(data);
      }
    } catch (err) {
      console.error('Health check failed:', err);
    }
  };

  const testCapabilitiesEndpoint = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/capabilities`);
      if (response.ok) {
        const data = await response.json();
        setApiResponse(data);
      }
    } catch (err) {
      console.error('Capabilities check failed:', err);
    }
  };

  const testMediaEndpoint = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/media/`);
      if (response.ok) {
        const data = await response.json();
        setApiResponse(data);
      }
    } catch (err) {
      console.error('Media endpoint failed:', err);
    }
  };

  const testGalleryEndpoint = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/gallery/`);
      if (response.ok) {
        const data = await response.json();
        setApiResponse(data);
      }
    } catch (err) {
      console.error('Gallery endpoint failed:', err);
    }
  };

  const testHighlightsEndpoint = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/highlights/`);
      if (response.ok) {
        const data = await response.json();
        setApiResponse(data);
      }
    } catch (err) {
      console.error('Highlights endpoint failed:', err);
    }
  };

  return (
    <>
      <Head>
        <title>API Connection Test - Crow's Eye</title>
      </Head>
      
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            API Connection Test
          </h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            <p className="text-lg mb-4">{apiStatus}</p>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={testApiConnection}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Test Connection
              </button>
              <button
                onClick={testHealthEndpoint}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Test Health
              </button>
              <button
                onClick={testCapabilitiesEndpoint}
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              >
                Test Capabilities
              </button>
              <button
                onClick={testMediaEndpoint}
                className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
              >
                Test Media
              </button>
              <button
                onClick={testGalleryEndpoint}
                className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
              >
                Test Gallery
              </button>
              <button
                onClick={testHighlightsEndpoint}
                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
              >
                Test Highlights
              </button>
            </div>
            
            {apiResponse && (
              <div className="bg-gray-100 p-4 rounded">
                <h3 className="font-semibold mb-2">API Response:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Configuration</h2>
            <ul className="space-y-2">
              <li><strong>Current API:</strong> {getApiUrl()}</li>
              <li><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</li>
              <li><strong>Available Endpoints:</strong> /health, /api/test, /api/capabilities, /api/media, /api/gallery, /api/highlights</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
} 