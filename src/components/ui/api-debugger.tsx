'use client';

import React, { useState } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Badge } from './badge';
import apiService from '@/services/api';
import { API_CONFIG } from '@/lib/config';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  data?: any;
  time?: number;
}

export function APIDebugger() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('connection');

  const updateTest = (test: string, status: TestResult['status'], message?: string, data?: any) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.test === test);
      if (existing) {
        return prev.map(r => r.test === test ? { ...r, status, message, data, time: Date.now() } : r);
      }
      return [...prev, { test, status, message, data, time: Date.now() }];
    });
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Connection Tests
  const runConnectionTests = async () => {
    setIsLoading(true);
    clearResults();

    // Test 1: API Health
    updateTest('API Health Check', 'pending', 'Checking API health...');
    try {
      const health = await apiService.healthCheck();
      updateTest('API Health Check', 'success', 'API is healthy', health.data);
    } catch (error: any) {
      updateTest('API Health Check', 'error', error.message);
    }

    // Test 2: Authentication Status
    updateTest('Auth Status', 'pending', 'Checking authentication...');
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        updateTest('Auth Status', 'error', 'No authentication token found');
      } else {
        // Make direct API call to check auth status
        const response = await fetch(`${API_CONFIG.baseURL}/api/v1/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const user = await response.json();
          updateTest('Auth Status', 'success', `Authenticated as ${user.email}`, user);
        } else {
          updateTest('Auth Status', 'error', `Authentication failed: ${response.status}`);
        }
      }
    } catch (error: any) {
      updateTest('Auth Status', 'error', `Auth check error: ${error.message}`);
    }

    // Test 3: API Configuration
    updateTest('API Configuration', 'success', 'Configuration loaded', API_CONFIG);

    setIsLoading(false);
  };

  // Media Tests
  const runMediaTests = async () => {
    setIsLoading(true);
    clearResults();

    // Test 1: Media Library
    updateTest('Media Library', 'pending', 'Fetching media library...');
    try {
      const library = await apiService.getMediaLibrary();
      updateTest('Media Library', 'success', `Found ${library.data.items.length} items`, library.data);
    } catch (error: any) {
      updateTest('Media Library', 'error', error.message);
    }

    // Test 2: Galleries
    updateTest('Galleries', 'pending', 'Fetching galleries...');
    try {
      const galleries = await apiService.getMediaGalleries();
      updateTest('Galleries', 'success', `Found ${galleries.data.galleries.length} galleries`, galleries.data);
    } catch (error: any) {
      updateTest('Galleries', 'error', error.message);
    }

    setIsLoading(false);
  };

  // Endpoint Discovery
  const runEndpointDiscovery = async () => {
    setIsLoading(true);
    clearResults();

    const endpoints = [
      { path: '/api/v1/health', method: 'GET', name: 'Health Check' },
      { path: '/api/v1/auth/me', method: 'GET', name: 'Current User' },
      { path: '/api/v1/users/profile', method: 'GET', name: 'User Profile' },
      { path: '/api/v1/media/library', method: 'GET', name: 'Media Library' },
      { path: '/api/v1/posts', method: 'GET', name: 'Posts' },
      { path: '/api/v1/analytics/overview', method: 'GET', name: 'Analytics' },
      { path: '/api/v1/ai/models', method: 'GET', name: 'AI Models' },
    ];

    for (const endpoint of endpoints) {
      updateTest(endpoint.name, 'pending', `Testing ${endpoint.method} ${endpoint.path}...`);
      try {
        const response = await fetch(`${API_CONFIG.baseURL}${endpoint.path}`, {
          method: endpoint.method,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          updateTest(endpoint.name, 'success', `${response.status} OK`, data);
        } else {
          updateTest(endpoint.name, 'error', `${response.status} ${response.statusText}`);
        }
      } catch (error: any) {
        updateTest(endpoint.name, 'error', error.message);
      }
    }

    setIsLoading(false);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '🔄';
      default: return '⏸️';
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">🔧 API Debugger</h2>
        <p className="text-gray-600">Comprehensive API testing and debugging tool</p>
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm">
            <strong>API URL:</strong> {API_CONFIG.baseURL}<br />
            <strong>Environment:</strong> {API_CONFIG.environment}<br />
            <strong>Timeout:</strong> {API_CONFIG.timeout}ms
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="mt-6">
          <Button 
            onClick={runConnectionTests} 
            disabled={isLoading}
            className="mb-4"
          >
            {isLoading ? '🔄 Testing...' : '🚀 Run Connection Tests'}
          </Button>
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <Button 
            onClick={runMediaTests} 
            disabled={isLoading}
            className="mb-4"
          >
            {isLoading ? '🔄 Testing...' : '📸 Run Media Tests'}
          </Button>
        </TabsContent>

        <TabsContent value="endpoints" className="mt-6">
          <Button 
            onClick={runEndpointDiscovery} 
            disabled={isLoading}
            className="mb-4"
          >
            {isLoading ? '🔄 Discovering...' : '🔍 Discover Endpoints'}
          </Button>
        </TabsContent>
      </Tabs>

      {testResults.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Test Results</h3>
            <Button variant="outline" size="sm" onClick={clearResults}>
              Clear Results
            </Button>
          </div>
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{getStatusIcon(result.status)}</span>
                    <span className="font-medium">{result.test}</span>
                  </div>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status.toUpperCase()}
                  </Badge>
                </div>
                {result.message && (
                  <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                )}
                {result.data && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-blue-600 hover:underline">
                      View Response Data
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
} 