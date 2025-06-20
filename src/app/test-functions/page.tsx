'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { CrowsEyeAPI } from '@/services/api';
import { AlertCircle, CheckCircle, Clock, XCircle, Wifi, WifiOff } from 'lucide-react';
import AuthenticationTester from './auth-test';
import ComprehensiveTestSuite from './comprehensive-test';
import StripeConfigTest from './stripe-config-test';

interface TestResult {
  name: string;
  status: 'idle' | 'running' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
  response?: any;
  error?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  progress: number;
  isRunning: boolean;
}

const API_INTEGRATION_TEST_PAGE = () => {
  const [api] = useState(() => new CrowsEyeAPI());
  const [activeTab, setActiveTab] = useState('comprehensive');
  const [testSuites, setTestSuites] = useState<{ [key: string]: TestSuite }>({
    connectivity: {
      name: 'API Connectivity & Health',
      tests: [],
      progress: 0,
      isRunning: false
    },
    authentication: {
      name: 'Authentication System',
      tests: [],
      progress: 0,
      isRunning: false
    },
    platforms: {
      name: 'Social Media Platforms',
      tests: [],
      progress: 0,
      isRunning: false
    },
    googlePhotos: {
      name: 'Google Photos Integration',
      tests: [],
      progress: 0,
      isRunning: false
    },
    mediaManagement: {
      name: 'Media Management',
      tests: [],
      progress: 0,
      isRunning: false
    },
    aiContent: {
      name: 'AI Content Generation',
      tests: [],
      progress: 0,
      isRunning: false
    },
    scheduling: {
      name: 'Content Scheduling',
      tests: [],
      progress: 0,
      isRunning: false
    },
    analytics: {
      name: 'Analytics & Reporting',
      tests: [],
      progress: 0,
      isRunning: false
    },
    compliance: {
      name: 'Platform Compliance',
      tests: [],
      progress: 0,
      isRunning: false
    }
  });

  const [overallProgress, setOverallProgress] = useState(0);
  const [isTestingAll, setIsTestingAll] = useState(false);

  const runTest = async (testName: string, testFunction: () => Promise<any>): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      const response = await testFunction();
      const duration = Date.now() - startTime;
      
      return {
        name: testName,
        status: 'success',
        message: `Test passed (${duration}ms)`,
        duration,
        response: response?.data
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const isApiDown = error?.response?.status === 502 || error?.code === 'ECONNABORTED';
      
      return {
        name: testName,
        status: isApiDown ? 'warning' : 'error',
        message: isApiDown ? 'API unavailable - using fallback data' : `Test failed: ${error?.message || 'Unknown error'}`,
        duration,
        error: error?.message || 'Unknown error'
      };
    }
  };

  const runConnectivityTests = async () => {
    const suiteKey = 'connectivity';
    setTestSuites(prev => ({
      ...prev,
      [suiteKey]: { ...prev[suiteKey], isRunning: true, progress: 0 }
    }));

    const tests = [
      { name: 'Basic Health Check', fn: () => api.healthCheck() },
      { name: 'System Health Check', fn: () => api.getSystemHealth() },
      { name: 'Test Connection', fn: () => api.testConnection() },
    ];

    const results: TestResult[] = [];
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      const result = await runTest(test.name, test.fn);
      results.push(result);
      
      const progress = ((i + 1) / tests.length) * 100;
      setTestSuites(prev => ({
        ...prev,
        [suiteKey]: { ...prev[suiteKey], tests: [...results], progress }
      }));
    }

    setTestSuites(prev => ({
      ...prev,
      [suiteKey]: { ...prev[suiteKey], isRunning: false }
    }));
  };

  const runAuthenticationTests = async () => {
    const suiteKey = 'authentication';
    setTestSuites(prev => ({
      ...prev,
      [suiteKey]: { ...prev[suiteKey], isRunning: true, progress: 0 }
    }));

    const tests = [
      { name: 'Get Current User', fn: () => api.getCurrentUser() },
      { name: 'User Profile Update', fn: () => api.updateProfile({ name: 'Test User' }) },
    ];

    const results: TestResult[] = [];
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      const result = await runTest(test.name, test.fn);
      results.push(result);
      
      const progress = ((i + 1) / tests.length) * 100;
      setTestSuites(prev => ({
        ...prev,
        [suiteKey]: { ...prev[suiteKey], tests: [...results], progress }
      }));
    }

    setTestSuites(prev => ({
      ...prev,
      [suiteKey]: { ...prev[suiteKey], isRunning: false }
    }));
  };

  const runPlatformTests = async () => {
    const suiteKey = 'platforms';
    setTestSuites(prev => ({
      ...prev,
      [suiteKey]: { ...prev[suiteKey], isRunning: true, progress: 0 }
    }));

    const tests = [
      { name: 'Get Platforms', fn: () => api.getPlatforms() },
      { name: 'Instagram Status', fn: () => api.getPlatformStatus('instagram') },
      { name: 'TikTok Status', fn: () => api.getPlatformStatus('tiktok') },
      { name: 'Pinterest Status', fn: () => api.getPlatformStatus('pinterest') },
    ];

    const results: TestResult[] = [];
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      const result = await runTest(test.name, test.fn);
      results.push(result);
      
      const progress = ((i + 1) / tests.length) * 100;
      setTestSuites(prev => ({
        ...prev,
        [suiteKey]: { ...prev[suiteKey], tests: [...results], progress }
      }));
    }

    setTestSuites(prev => ({
      ...prev,
      [suiteKey]: { ...prev[suiteKey], isRunning: false }
    }));
  };

  const runGooglePhotosTests = async () => {
    const suiteKey = 'googlePhotos';
    setTestSuites(prev => ({
      ...prev,
      [suiteKey]: { ...prev[suiteKey], isRunning: true, progress: 0 }
    }));

    const tests = [
      { name: 'Google Photos Status', fn: () => api.getGooglePhotosStatus() },
      { name: 'List Albums', fn: () => api.listGooglePhotosAlbums() },
      { name: 'Search Photos', fn: () => api.searchGooglePhotos('sunset') },
    ];

    const results: TestResult[] = [];
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      const result = await runTest(test.name, test.fn);
      results.push(result);
      
      const progress = ((i + 1) / tests.length) * 100;
      setTestSuites(prev => ({
        ...prev,
        [suiteKey]: { ...prev[suiteKey], tests: [...results], progress }
      }));
    }

    setTestSuites(prev => ({
      ...prev,
      [suiteKey]: { ...prev[suiteKey], isRunning: false }
    }));
  };

  const runMediaTests = async () => {
    const suiteKey = 'mediaManagement';
    setTestSuites(prev => ({
      ...prev,
      [suiteKey]: { ...prev[suiteKey], isRunning: true, progress: 0 }
    }));

    const tests = [
      { name: 'Get Media Library', fn: () => api.getMediaLibrary() },
      { name: 'Search Media', fn: () => api.searchMedia('test') },
      { name: 'Processing Jobs', fn: () => api.listProcessingJobs() },
    ];

    const results: TestResult[] = [];
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      const result = await runTest(test.name, test.fn);
      results.push(result);
      
      const progress = ((i + 1) / tests.length) * 100;
      setTestSuites(prev => ({
        ...prev,
        [suiteKey]: { ...prev[suiteKey], tests: [...results], progress }
      }));
    }

    setTestSuites(prev => ({
      ...prev,
      [suiteKey]: { ...prev[suiteKey], isRunning: false }
    }));
  };

  const runAITests = async () => {
    const suiteKey = 'aiContent';
    setTestSuites(prev => ({
      ...prev,
      [suiteKey]: { ...prev[suiteKey], isRunning: true, progress: 0 }
    }));

    const tests = [
      { name: 'Generate Caption', fn: () => api.generateCaption({ prompt: 'Test prompt', type: 'caption' }) },
      { name: 'Generate Hashtags', fn: () => api.generateHashtags({ prompt: 'Test content', type: 'hashtags' }) },
      { name: 'Optimize Content', fn: () => api.optimizeContent({ prompt: 'Test content', type: 'optimization' }) },
    ];

    const results: TestResult[] = [];
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      const result = await runTest(test.name, test.fn);
      results.push(result);
      
      const progress = ((i + 1) / tests.length) * 100;
      setTestSuites(prev => ({
        ...prev,
        [suiteKey]: { ...prev[suiteKey], tests: [...results], progress }
      }));
    }

    setTestSuites(prev => ({
      ...prev,
      [suiteKey]: { ...prev[suiteKey], isRunning: false }
    }));
  };

  const runSchedulingTests = async () => {
    const suiteKey = 'scheduling';
    setTestSuites(prev => ({
      ...prev,
      [suiteKey]: { ...prev[suiteKey], isRunning: true, progress: 0 }
    }));

    const tests = [
      { name: 'Get Schedules', fn: () => api.getSchedules() },
    ];

    const results: TestResult[] = [];
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      const result = await runTest(test.name, test.fn);
      results.push(result);
      
      const progress = ((i + 1) / tests.length) * 100;
      setTestSuites(prev => ({
        ...prev,
        [suiteKey]: { ...prev[suiteKey], tests: [...results], progress }
      }));
    }

    setTestSuites(prev => ({
      ...prev,
      [suiteKey]: { ...prev[suiteKey], isRunning: false }
    }));
  };

  const runAnalyticsTests = async () => {
    const suiteKey = 'analytics';
    setTestSuites(prev => ({
      ...prev,
      [suiteKey]: { ...prev[suiteKey], isRunning: true, progress: 0 }
    }));

    const tests = [
      { name: 'Analytics Overview', fn: () => api.getAnalyticsOverview() },
      { name: 'Post Analytics', fn: () => api.getPostAnalytics() },
      { name: 'Platform Analytics', fn: () => api.getPlatformAnalytics() },
    ];

    const results: TestResult[] = [];
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      const result = await runTest(test.name, test.fn);
      results.push(result);
      
      const progress = ((i + 1) / tests.length) * 100;
      setTestSuites(prev => ({
        ...prev,
        [suiteKey]: { ...prev[suiteKey], tests: [...results], progress }
      }));
    }

    setTestSuites(prev => ({
      ...prev,
      [suiteKey]: { ...prev[suiteKey], isRunning: false }
    }));
  };

  const runComplianceTests = async () => {
    const suiteKey = 'compliance';
    setTestSuites(prev => ({
      ...prev,
      [suiteKey]: { ...prev[suiteKey], isRunning: true, progress: 0 }
    }));

    const tests = [
      { name: 'Check Compliance', fn: () => api.checkCompliance({ 
        content: 'Test content', 
        media_urls: [], 
        platforms: ['instagram', 'tiktok'] 
      }) },
      { name: 'Get Compliance Rules', fn: () => api.getComplianceRules() },
    ];

    const results: TestResult[] = [];
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      const result = await runTest(test.name, test.fn);
      results.push(result);
      
      const progress = ((i + 1) / tests.length) * 100;
      setTestSuites(prev => ({
        ...prev,
        [suiteKey]: { ...prev[suiteKey], tests: [...results], progress }
      }));
    }

    setTestSuites(prev => ({
      ...prev,
      [suiteKey]: { ...prev[suiteKey], isRunning: false }
    }));
  };

  const runAllTests = async () => {
    setIsTestingAll(true);
    setOverallProgress(0);
    
    const testFunctions = [
      runConnectivityTests,
      runAuthenticationTests,
      runPlatformTests,
      runGooglePhotosTests,
      runMediaTests,
      runAITests,
      runSchedulingTests,
      runAnalyticsTests,
      runComplianceTests
    ];

    for (let i = 0; i < testFunctions.length; i++) {
      await testFunctions[i]();
      setOverallProgress(((i + 1) / testFunctions.length) * 100);
    }

    setIsTestingAll(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'default',
      warning: 'secondary',
      error: 'destructive',
      running: 'outline',
      idle: 'outline'
    } as const;

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const TestSuiteCard = ({ suiteKey, suite }: { suiteKey: string, suite: TestSuite }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{suite.name}</CardTitle>
            <CardDescription>
              {suite.tests.length > 0 && (
                <>
                  {suite.tests.filter(t => t.status === 'success').length} passed, {' '}
                  {suite.tests.filter(t => t.status === 'warning').length} warnings, {' '}
                  {suite.tests.filter(t => t.status === 'error').length} failed
                </>
              )}
            </CardDescription>
          </div>
          <Button 
            onClick={() => {
              const testFunctions: { [key: string]: () => Promise<void> } = {
                connectivity: runConnectivityTests,
                authentication: runAuthenticationTests,
                platforms: runPlatformTests,
                googlePhotos: runGooglePhotosTests,
                mediaManagement: runMediaTests,
                aiContent: runAITests,
                scheduling: runSchedulingTests,
                analytics: runAnalyticsTests,
                compliance: runComplianceTests
              };
              testFunctions[suiteKey]?.();
            }}
            disabled={suite.isRunning}
            variant="outline"
            size="sm"
          >
            {suite.isRunning ? 'Running...' : 'Run Tests'}
          </Button>
        </div>
        {suite.isRunning && (
          <Progress value={suite.progress} className="mt-2" />
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {suite.tests.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <span className="font-medium">{test.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {test.duration && (
                  <span className="text-sm text-gray-500">{test.duration}ms</span>
                )}
                {getStatusBadge(test.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🧪 Crow's Eye API Integration Testing</h1>
        <p className="text-gray-600 mb-4">
          Comprehensive testing suite for all API endpoints and integrations
        </p>
        
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={runAllTests} disabled={isTestingAll} size="lg">
            {isTestingAll ? 'Running All Tests...' : 'Run All Tests'}
          </Button>
          <div className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-blue-500" />
            <span className="text-sm">API Endpoint: https://crow-eye-api-dot-crows-eye-website.uc.r.appspot.com</span>
          </div>
        </div>

        {isTestingAll && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">Overall Progress</span>
              <span className="text-sm text-gray-500">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="comprehensive">🚀 Comprehensive</TabsTrigger>
          <TabsTrigger value="auth">🔐 Auth Test</TabsTrigger>
          <TabsTrigger value="stripe">💳 Stripe Config</TabsTrigger>
          <TabsTrigger value="all">All Tests</TabsTrigger>
          <TabsTrigger value="essential">Essential</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="comprehensive" className="mt-6">
          <ComprehensiveTestSuite />
        </TabsContent>

        <TabsContent value="auth" className="mt-6">
          <AuthenticationTester />
        </TabsContent>

        <TabsContent value="stripe" className="mt-6">
          <StripeConfigTest />
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4">
            {Object.entries(testSuites).map(([key, suite]) => (
              <TestSuiteCard key={key} suiteKey={key} suite={suite} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="essential" className="mt-6">
          <div className="grid gap-4">
            {['connectivity', 'authentication', 'platforms', 'mediaManagement'].map(key => (
              <TestSuiteCard key={key} suiteKey={key} suite={testSuites[key]} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="mt-6">
          <div className="grid gap-4">
            {['googlePhotos', 'aiContent', 'scheduling', 'analytics', 'compliance'].map(key => (
              <TestSuiteCard key={key} suiteKey={key} suite={testSuites[key]} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default API_INTEGRATION_TEST_PAGE; 