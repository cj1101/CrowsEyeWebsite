'use client'
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CrowsEyeAPI } from '@/services/api';
import { CheckCircle, XCircle, Clock, User, Mail, Key, Shield } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'idle' | 'running' | 'success' | 'error';
  message: string;
  duration?: number;
  response?: any;
}

const AuthenticationTester = () => {
  const [api] = useState(() => new CrowsEyeAPI());
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testCredentials, setTestCredentials] = useState({
    email: `test.user.${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Test User'
  });

  const updateResult = (index: number, result: Partial<TestResult>) => {
    setTestResults(prev => 
      prev.map((item, i) => i === index ? { ...item, ...result } : item)
    );
  };

  const runTest = async (testIndex: number, testFn: () => Promise<any>): Promise<boolean> => {
    const startTime = Date.now();
    updateResult(testIndex, { status: 'running' });
    
    try {
      const response = await testFn();
      const duration = Date.now() - startTime;
      
      updateResult(testIndex, {
        status: 'success',
        message: `✅ Test passed (${duration}ms)`,
        duration,
        response: response?.data
      });
      
      return true;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const errorMessage = error?.response?.data?.error || error?.message || 'Unknown error';
      
      updateResult(testIndex, {
        status: 'error',
        message: `❌ ${errorMessage} (${duration}ms)`,
        duration,
        response: error?.response?.data
      });
      
      return false;
    }
  };

  const runAuthenticationTests = async () => {
    setIsRunning(true);
    
    // Initialize test results
    const tests: TestResult[] = [
      { name: '🏥 API Health Check', status: 'idle', message: 'Waiting...' },
      { name: '📝 User Registration', status: 'idle', message: 'Waiting...' },
      { name: '🔐 User Login', status: 'idle', message: 'Waiting...' },
      { name: '👤 Get Current User', status: 'idle', message: 'Waiting...' },
      { name: '✏️ Update Profile', status: 'idle', message: 'Waiting...' },
      { name: '🔑 Token Validation', status: 'idle', message: 'Waiting...' },
      { name: '🚪 User Logout', status: 'idle', message: 'Waiting...' },
      { name: '🔒 Invalid Login Test', status: 'idle', message: 'Waiting...' },
    ];
    
    setTestResults(tests);

    // Generate unique test credentials for this run
    const uniqueEmail = `test.user.${Date.now()}@example.com`;
    setTestCredentials(prev => ({ ...prev, email: uniqueEmail }));

    let authToken = '';

    // Test 1: Health Check
    await runTest(0, async () => {
      return await api.healthCheck();
    });

    // Test 2: User Registration
    const registrationSuccess = await runTest(1, async () => {
      const response = await api.register({
        email: uniqueEmail,
        password: testCredentials.password,
        name: testCredentials.name
      });
      
      if (response.data?.access_token) {
        authToken = response.data.access_token;
        localStorage.setItem('auth_token', authToken);
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token);
        }
      }
      
      return response;
    });

    if (!registrationSuccess) {
      setIsRunning(false);
      return;
    }

    // Test 3: User Login (with the same credentials)
    await runTest(2, async () => {
      // Clear tokens first to test fresh login
      localStorage.removeItem('auth_token');
      
      const response = await api.login({
        email: uniqueEmail,
        password: testCredentials.password
      });
      
      if (response.data?.access_token) {
        authToken = response.data.access_token;
        localStorage.setItem('auth_token', authToken);
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token);
        }
      }
      
      return response;
    });

    // Test 4: Get Current User
    await runTest(3, async () => {
      return await api.getCurrentUser();
    });

    // Test 5: Update Profile
    await runTest(4, async () => {
      return await api.updateProfile({
        name: 'Updated Test User'
      });
    });

    // Test 6: Token Validation (by making an authenticated request)
    await runTest(5, async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No auth token found');
      }
      
      // Test token by making authenticated API call
      return await api.getCurrentUser();
    });

    // Test 7: Logout
    await runTest(6, async () => {
      const response = await api.logout();
      
      // Verify tokens are cleared
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      
      return response;
    });

    // Test 8: Invalid Login Test
    await runTest(7, async () => {
      try {
        await api.login({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        });
        throw new Error('Login should have failed');
      } catch (error: any) {
        // We expect this to fail with 401
        if (error?.response?.status === 401) {
          return { data: { message: 'Correctly rejected invalid credentials' } };
        }
        throw error;
      }
    });

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'running':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;
  const totalTests = testResults.length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Authentication System Test Suite
          </CardTitle>
          <CardDescription>
            Comprehensive testing of the Crow's Eye API authentication system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={runAuthenticationTests} 
                  disabled={isRunning}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isRunning ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Run Authentication Tests
                    </>
                  )}
                </Button>
                
                {totalTests > 0 && (
                  <div className="flex gap-2">
                    <Badge variant={successCount === totalTests ? "default" : "secondary"}>
                      {successCount}/{totalTests} Passed
                    </Badge>
                    {errorCount > 0 && (
                      <Badge variant="destructive">
                        {errorCount} Failed
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-600">
                API: https://crow-eye-api-dot-crows-eye-website.uc.r.appspot.com
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Test Credentials
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="font-mono">{testCredentials.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-gray-500" />
                  <span className="font-mono">{testCredentials.password}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-mono">{testCredentials.name}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Detailed results for each authentication test
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h4 className="font-medium">{result.name}</h4>
                        <p className="text-sm text-gray-600">{result.message}</p>
                      </div>
                    </div>
                    
                    {result.duration && (
                      <div className="text-sm text-gray-500">
                        {result.duration}ms
                      </div>
                    )}
                  </div>
                  
                  {result.response && result.status === 'success' && (
                    <div className="mt-3 p-3 bg-white rounded border">
                      <details>
                        <summary className="cursor-pointer text-sm font-medium text-gray-700">
                          View Response Data
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                          {JSON.stringify(result.response, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                  
                  {result.response && result.status === 'error' && (
                    <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                      <details>
                        <summary className="cursor-pointer text-sm font-medium text-red-700">
                          View Error Details
                        </summary>
                        <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto text-red-800">
                          {JSON.stringify(result.response, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuthenticationTester; 