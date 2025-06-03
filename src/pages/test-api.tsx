import { useState } from 'react';
import { NextPage } from 'next';

const TestAPI: NextPage = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string>('');

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpass'
        })
      });
      
      const data = await response.json();
      setResult(`Login Response: ${JSON.stringify(data, null, 2)}`);
      
      if (data.access_token) {
        setToken(data.access_token);
      }
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testContentGeneration = async () => {
    if (!token) {
      setResult('Please login first to get a token');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/marketing/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content_type: 'social_post',
          prompt: 'Create a marketing post about coffee'
        })
      });
      
      const data = await response.json();
      setResult(`Content Generation Response: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testPythonBridge = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/marketing/analytics', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token || 'fake-token'}`
        }
      });
      
      const data = await response.json();
      setResult(`Python Bridge Test: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">API Integration Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          
          <div className="space-y-4">
            <button
              onClick={testLogin}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Login API'}
            </button>
            
            <button
              onClick={testContentGeneration}
              disabled={loading || !token}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
            >
              {loading ? 'Testing...' : 'Test Content Generation'}
            </button>
            
            <button
              onClick={testPythonBridge}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
            >
              {loading ? 'Testing...' : 'Test Python Bridge'}
            </button>
          </div>
          
          {token && (
            <div className="mt-4 p-3 bg-gray-100 rounded">
              <p className="text-sm text-gray-600">JWT Token: {token.substring(0, 50)}...</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-96 text-sm">
            {result || 'No results yet. Click a test button above.'}
          </pre>
        </div>
        
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Setup Notes:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Make sure you've created a <code>.env.local</code> file with JWT_SECRET</li>
            <li>• Update the Python bridge script with your actual tool's class names</li>
            <li>• The login test uses mock credentials (no real authentication yet)</li>
            <li>• Content generation will try to call your Python tool via the bridge</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestAPI; 