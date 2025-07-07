'use client';

import React from 'react';
import AuthTest from '@/components/ui/AuthTest';
import MediaUpload from '@/components/media/MediaUpload';
import { testApiEndpoints } from '@/lib/api-test';

export default function TestAuthPage() {
  const [apiTestResults, setApiTestResults] = React.useState<any[]>([]);
  const [isTestingApi, setIsTestingApi] = React.useState(false);

  const handleTestApi = async () => {
    setIsTestingApi(true);
    try {
      const results = await testApiEndpoints();
      setApiTestResults(results);
    } catch (error) {
      console.error('API test failed:', error);
    } finally {
      setIsTestingApi(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Firebase Auth Bridge Test
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Authentication Test</h2>
            <AuthTest />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Upload Test</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <MediaUpload 
                onUpload={(files) => {
                  console.log('Files uploaded:', files);
                  alert(`Successfully uploaded ${files.length} files!`);
                }}
                multiple={true}
                maxSize={10 * 1024 * 1024} // 10MB
              />
            </div>
          </div>
        </div>

        {/* API Endpoint Test */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">API Endpoint Test</h2>
          <button
            onClick={handleTestApi}
            disabled={isTestingApi}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-4"
          >
            {isTestingApi ? 'Testing...' : 'Test API Endpoints'}
          </button>
          
          {apiTestResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Results:</h3>
              {apiTestResults.map((result, index) => (
                <div key={index} className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">{result.url}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.status === 'success' ? 'bg-green-100 text-green-800' :
                      result.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                  {result.error && (
                    <div className="text-red-600 text-sm mt-1">{result.error}</div>
                  )}
                  {result.responseTime && (
                    <div className="text-gray-500 text-xs mt-1">
                      Response time: {result.responseTime}ms
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>1. <strong>Test Authentication:</strong> Use the login form to sign in with your app credentials</p>
            <p>2. <strong>Verify Firebase Auth:</strong> Click "Test Firebase Auth" to check if the bridge is working</p>
            <p>3. <strong>Test Upload:</strong> Try uploading a file to see if the authentication issue is resolved</p>
            <p>4. <strong>Check Console:</strong> Open browser dev tools to see detailed logs</p>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Expected Behavior:</h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Login should authenticate with both your app AND Firebase Auth</li>
              <li>• "Test Firebase Auth" should show "✅ Authenticated"</li>
              <li>• File uploads should work without 403 errors</li>
              <li>• If client upload fails, server upload should work as fallback</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 