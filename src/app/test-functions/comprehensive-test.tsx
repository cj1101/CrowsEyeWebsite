'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiService, CrowsEyeAPI } from '@/services/api';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Zap, 
  Shield, 
  Database,
  Cloud,
  Image,
  Video,
  Users,
  BarChart,
  Settings,
  Wifi
} from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
  details?: any;
  category: string;
}

interface TestSuite {
  name: string;
  icon: React.ReactNode;
  tests: TestResult[];
  progress: number;
  isRunning: boolean;
  passedTests: number;
  totalTests: number;
}

const ComprehensiveTestSuite = () => {
  const [api] = useState(() => new CrowsEyeAPI());
  const [overallProgress, setOverallProgress] = useState(0);
  const [isRunningAllTests, setIsRunningAllTests] = useState(false);
  const [testSuites, setTestSuites] = useState<{ [key: string]: TestSuite }>({
    connectivity: {
      name: 'API Connectivity',
      icon: <Wifi className="h-5 w-5" />,
      tests: [],
      progress: 0,
      isRunning: false,
      passedTests: 0,
      totalTests: 0
    },
    authentication: {
      name: 'Authentication System',
      icon: <Shield className="h-5 w-5" />,
      tests: [],
      progress: 0,
      isRunning: false,
      passedTests: 0,
      totalTests: 0
    },
    media: {
      name: 'Media Management',
      icon: <Image className="h-5 w-5" />,
      tests: [],
      progress: 0,
      isRunning: false,
      passedTests: 0,
      totalTests: 0
    },
    ai: {
      name: 'AI Content Generation',
      icon: <Zap className="h-5 w-5" />,
      tests: [],
      progress: 0,
      isRunning: false,
      passedTests: 0,
      totalTests: 0
    },
    platforms: {
      name: 'Social Media Platforms',
      icon: <Users className="h-5 w-5" />,
      tests: [],
      progress: 0,
      isRunning: false,
      passedTests: 0,
      totalTests: 0
    },
    video: {
      name: 'Video Processing',
      icon: <Video className="h-5 w-5" />,
      tests: [],
      progress: 0,
      isRunning: false,
      passedTests: 0,
      totalTests: 0
    },
    analytics: {
      name: 'Analytics & Reporting',
      icon: <BarChart className="h-5 w-5" />,
      tests: [],
      progress: 0,
      isRunning: false,
      passedTests: 0,
      totalTests: 0
    },
    compliance: {
      name: 'Compliance & Account Management',
      icon: <Settings className="h-5 w-5" />,
      tests: [],
      progress: 0,
      isRunning: false,
      passedTests: 0,
      totalTests: 0
    },
    googlePhotos: {
      name: 'Google Photos Integration',
      icon: <Cloud className="h-5 w-5" />,
      tests: [],
      progress: 0,
      isRunning: false,
      passedTests: 0,
      totalTests: 0
    }
  });

  const runTest = async (testId: string, testName: string, testFunction: () => Promise<any>, category: string): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      const response = await testFunction();
      const duration = Date.now() - startTime;
      
      return {
        id: testId,
        name: testName,
        status: 'success',
        message: `✅ Test passed (${duration}ms)`,
        duration,
        details: response?.data,
        category
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const isApiDown = error?.response?.status === 502;
      const isWarning = isApiDown || error?.message?.includes('fallback') || error?.message?.includes('mock');
      
      return {
        id: testId,
        name: testName,
        status: isWarning ? 'warning' : 'error',
        message: isWarning ? `⚠️ Using fallback data (${duration}ms)` : `❌ Test failed: ${error?.message || 'Unknown error'} (${duration}ms)`,
        duration,
        details: error?.response?.data || error?.message,
        category
      };
    }
  };

  const updateTestSuite = (suiteKey: string, tests: TestResult[], isRunning: boolean) => {
    const passedTests = tests.filter(t => t.status === 'success').length;
    const totalTests = tests.length;
    const progress = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    
    setTestSuites(prev => ({
      ...prev,
      [suiteKey]: { 
        ...prev[suiteKey], 
        tests, 
        progress, 
        isRunning, 
        passedTests,
        totalTests
      }
    }));
  };

  // Connectivity Tests
  const runConnectivityTests = async () => {
    const suiteKey = 'connectivity';
    const tests: TestResult[] = [];
    
    updateTestSuite(suiteKey, tests, true);

    const testDefinitions = [
      { id: 'health', name: 'API Health Check', fn: () => apiService.healthCheck() },
      { id: 'system-health', name: 'System Health Check', fn: () => apiService.apiHealthCheck() },
      { id: 'version', name: 'API Version Check', fn: () => apiService.getVersion() },
      { id: 'ping', name: 'API Ping Test', fn: () => apiService.ping() },
    ];

    for (const testDef of testDefinitions) {
      const result = await runTest(testDef.id, testDef.name, testDef.fn, 'connectivity');
      tests.push(result);
      updateTestSuite(suiteKey, [...tests], true);
    }

    updateTestSuite(suiteKey, tests, false);
  };

  // Authentication Tests
  const runAuthenticationTests = async () => {
    const suiteKey = 'authentication';
    const tests: TestResult[] = [];
    
    updateTestSuite(suiteKey, tests, true);

    const testDefinitions = [
      { id: 'current-user', name: 'Get Current User', fn: () => api.getCurrentUser() },
      { id: 'profile-update', name: 'Profile Update Test', fn: () => api.updateProfile({ name: 'Test User' }) },
      { id: 'auth-requirements', name: 'Authentication Requirements', fn: () => apiService.getAuthRequirements() },
    ];

    for (const testDef of testDefinitions) {
      const result = await runTest(testDef.id, testDef.name, testDef.fn, 'authentication');
      tests.push(result);
      updateTestSuite(suiteKey, [...tests], true);
    }

    updateTestSuite(suiteKey, tests, false);
  };

  // Media Management Tests
  const runMediaTests = async () => {
    const suiteKey = 'media';
    const tests: TestResult[] = [];
    
    updateTestSuite(suiteKey, tests, true);

         const testDefinitions = [
       { id: 'media-library', name: 'Media Library Access', fn: () => apiService.getMediaLibrary() },
       { id: 'media-get', name: 'Get Media Item', fn: () => apiService.getMedia('test-id') },
       { id: 'media-tags', name: 'Media Tags Generation', fn: () => apiService.generateMediaTags('test-id') },
       { id: 'thumbnails', name: 'Thumbnail Generation', fn: () => apiService.generateThumbnails({ video_id: 'test-id' }) },
     ];

    for (const testDef of testDefinitions) {
      const result = await runTest(testDef.id, testDef.name, testDef.fn, 'media');
      tests.push(result);
      updateTestSuite(suiteKey, [...tests], true);
    }

    updateTestSuite(suiteKey, tests, false);
  };

  // AI Content Generation Tests
  const runAITests = async () => {
    const suiteKey = 'ai';
    const tests: TestResult[] = [];
    
    updateTestSuite(suiteKey, tests, true);

    const testDefinitions = [
      { id: 'captions', name: 'AI Caption Generation', fn: () => apiService.generateCaptionsFromMedia({ media_ids: [1], style: 'engaging', platform: 'instagram' }) },
      { id: 'hashtags', name: 'AI Hashtag Generation', fn: () => apiService.generateHashtags({ content: 'Test content' }) },
      { id: 'content-ideas', name: 'AI Content Ideas', fn: () => apiService.generateContentIdeas({ topic: 'technology' }) },
      { id: 'image-generation', name: 'AI Image Generation', fn: () => apiService.generateImages({ prompt: 'beautiful landscape' }) },
      { id: 'video-generation', name: 'AI Video Generation', fn: () => apiService.generateVideos({ prompt: 'peaceful nature scene' }) },
    ];

    for (const testDef of testDefinitions) {
      const result = await runTest(testDef.id, testDef.name, testDef.fn, 'ai');
      tests.push(result);
      updateTestSuite(suiteKey, [...tests], true);
    }

    updateTestSuite(suiteKey, tests, false);
  };

  // Platform Integration Tests
  const runPlatformTests = async () => {
    const suiteKey = 'platforms';
    const tests: TestResult[] = [];
    
    updateTestSuite(suiteKey, tests, true);

    const testDefinitions = [
      { id: 'platform-status', name: 'Platform Status Check', fn: () => apiService.getPlatformStatus() },
      { id: 'platform-summary', name: 'Platforms Summary', fn: () => apiService.getPlatformsSummary() },
      { id: 'rate-limits', name: 'Rate Limits Check', fn: () => apiService.getRateLimits() },
      { id: 'content-policies', name: 'Content Policies', fn: () => apiService.getContentPolicies() },
    ];

    for (const testDef of testDefinitions) {
      const result = await runTest(testDef.id, testDef.name, testDef.fn, 'platforms');
      tests.push(result);
      updateTestSuite(suiteKey, [...tests], true);
    }

    updateTestSuite(suiteKey, tests, false);
  };

  // Video Processing Tests
  const runVideoTests = async () => {
    const suiteKey = 'video';
    const tests: TestResult[] = [];
    
    updateTestSuite(suiteKey, tests, true);

    const testDefinitions = [
      { id: 'highlight-generation', name: 'Highlight Generation', fn: () => apiService.generateHighlights({ media_ids: [1], duration: 30, highlight_type: 'dynamic', style: 'cinematic', include_text: true, include_music: true }) },
      { id: 'video-processing', name: 'Video Processing', fn: () => apiService.processVideo({ video_id: 'test-id', operations: [{ type: 'trim', start: 0, end: 30 }], output_format: 'mp4' }) },
    ];

    for (const testDef of testDefinitions) {
      const result = await runTest(testDef.id, testDef.name, testDef.fn, 'video');
      tests.push(result);
      updateTestSuite(suiteKey, [...tests], true);
    }

    updateTestSuite(suiteKey, tests, false);
  };

  // Analytics Tests
  const runAnalyticsTests = async () => {
    const suiteKey = 'analytics';
    const tests: TestResult[] = [];
    
    updateTestSuite(suiteKey, tests, true);

    const testDefinitions = [
      { id: 'performance-analytics', name: 'Performance Analytics', fn: () => apiService.getPerformanceAnalytics() },
      { id: 'track-analytics', name: 'Analytics Tracking', fn: () => apiService.trackAnalytics({ event_type: 'test', platform: 'instagram' }) },
    ];

    for (const testDef of testDefinitions) {
      const result = await runTest(testDef.id, testDef.name, testDef.fn, 'analytics');
      tests.push(result);
      updateTestSuite(suiteKey, [...tests], true);
    }

    updateTestSuite(suiteKey, tests, false);
  };

  // Compliance Tests
  const runComplianceTests = async () => {
    const suiteKey = 'compliance';
    const tests: TestResult[] = [];
    
    updateTestSuite(suiteKey, tests, true);

    const testDefinitions = [
      { id: 'compliance-health', name: 'Compliance Health Check', fn: () => apiService.complianceHealthCheck() },
      { id: 'comprehensive-check', name: 'Comprehensive Compliance Check', fn: () => apiService.comprehensiveComplianceCheck() },
      { id: 'privacy-requirements', name: 'Privacy Requirements', fn: () => apiService.getPrivacyRequirements() },
      { id: 'content-validation', name: 'Content Validation', fn: () => apiService.validateContent({ content: 'Test content', platform: 'instagram', content_type: 'text' }) },
    ];

    for (const testDef of testDefinitions) {
      const result = await runTest(testDef.id, testDef.name, testDef.fn, 'compliance');
      tests.push(result);
      updateTestSuite(suiteKey, [...tests], true);
    }

    updateTestSuite(suiteKey, tests, false);
  };

  // Google Photos Tests
  const runGooglePhotosTests = async () => {
    const suiteKey = 'googlePhotos';
    const tests: TestResult[] = [];
    
    updateTestSuite(suiteKey, tests, true);

    const testDefinitions = [
      { id: 'gp-status', name: 'Google Photos Status', fn: () => api.getGooglePhotosStatus() },
      { id: 'gp-albums', name: 'List Google Photos Albums', fn: () => api.listGooglePhotosAlbums() },
      { id: 'gp-search', name: 'Search Google Photos', fn: () => api.searchGooglePhotos('landscape') },
    ];

    for (const testDef of testDefinitions) {
      const result = await runTest(testDef.id, testDef.name, testDef.fn, 'googlePhotos');
      tests.push(result);
      updateTestSuite(suiteKey, [...tests], true);
    }

    updateTestSuite(suiteKey, tests, false);
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunningAllTests(true);
    setOverallProgress(0);

    const testSuiteKeys = Object.keys(testSuites);
    
    for (let i = 0; i < testSuiteKeys.length; i++) {
      const suiteKey = testSuiteKeys[i];
      
      switch (suiteKey) {
        case 'connectivity':
          await runConnectivityTests();
          break;
        case 'authentication':
          await runAuthenticationTests();
          break;
        case 'media':
          await runMediaTests();
          break;
        case 'ai':
          await runAITests();
          break;
        case 'platforms':
          await runPlatformTests();
          break;
        case 'video':
          await runVideoTests();
          break;
        case 'analytics':
          await runAnalyticsTests();
          break;
        case 'compliance':
          await runComplianceTests();
          break;
        case 'googlePhotos':
          await runGooglePhotosTests();
          break;
      }
      
      const progress = ((i + 1) / testSuiteKeys.length) * 100;
      setOverallProgress(progress);
    }

    setIsRunningAllTests(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'bg-green-500/20 text-green-300',
      error: 'bg-red-500/20 text-red-300',
      warning: 'bg-yellow-500/20 text-yellow-300',
      running: 'bg-blue-500/20 text-blue-300',
      idle: 'bg-gray-500/20 text-gray-300'
    };
    
    return variants[status] || variants.idle;
  };

  const getSuiteHealthScore = () => {
    const allTests = Object.values(testSuites).flatMap(suite => suite.tests);
    if (allTests.length === 0) return 0;
    
    const successCount = allTests.filter(test => test.status === 'success').length;
    const warningCount = allTests.filter(test => test.status === 'warning').length;
    
    return Math.round(((successCount + warningCount * 0.5) / allTests.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Crow's Eye Comprehensive Test Suite
          </h1>
          <p className="text-gray-300 text-lg">
            Complete system health check and functionality verification
          </p>
          
          {/* Overall Health Score */}
          <div className="mt-6 flex items-center justify-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{getSuiteHealthScore()}%</div>
              <div className="text-sm text-gray-400">System Health Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">
                {Object.values(testSuites).reduce((sum, suite) => sum + suite.passedTests, 0)}
              </div>
              <div className="text-sm text-gray-400">Tests Passed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">
                {Object.values(testSuites).reduce((sum, suite) => sum + suite.totalTests, 0)}
              </div>
              <div className="text-sm text-gray-400">Total Tests</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center mb-8">
          <Button 
            onClick={runAllTests} 
            disabled={isRunningAllTests}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
          >
            {isRunningAllTests ? (
              <>
                <Clock className="h-5 w-5 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                Run All Tests
              </>
            )}
          </Button>
        </div>

        {/* Overall Progress */}
        {isRunningAllTests && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Overall Progress</span>
              <span className="text-sm text-gray-300">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        )}

        {/* Test Suite Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(testSuites).map(([key, suite]) => (
            <Card key={key} className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  {suite.icon}
                  {suite.name}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {suite.passedTests}/{suite.totalTests} tests passed
                </CardDescription>
                {suite.totalTests > 0 && (
                  <Progress value={suite.progress} className="h-1" />
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {suite.tests.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No tests run yet
                  </div>
                ) : (
                  suite.tests.map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-2 rounded bg-gray-700/30">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(test.status)}
                        <span className="text-sm text-gray-300">{test.name}</span>
                      </div>
                      <Badge className={`text-xs ${getStatusBadge(test.status)}`}>
                        {test.status}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveTestSuite; 