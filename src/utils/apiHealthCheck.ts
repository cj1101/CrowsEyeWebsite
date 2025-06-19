import { CrowsEyeAPI } from '@/services/api';

export interface EndpointTest {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requiresAuth: boolean;
  testData?: any;
  expectedStatus: number;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface TestResult {
  test: EndpointTest;
  success: boolean;
  status?: number;
  responseTime: number;
  error?: string;
  response?: any;
  timestamp: string;
}

export class APIHealthChecker {
  private api: CrowsEyeAPI;
  private results: TestResult[] = [];

  constructor() {
    this.api = new CrowsEyeAPI();
  }

  // Critical endpoints that must work for basic functionality
  private criticalEndpoints: EndpointTest[] = [
    // System Health
    { name: 'Health Check', endpoint: '/health', method: 'GET', requiresAuth: false, expectedStatus: 200, category: 'system', priority: 'critical' },
    { name: 'System Health', endpoint: '/health/system', method: 'GET', requiresAuth: false, expectedStatus: 200, category: 'system', priority: 'critical' },
    { name: 'API Test', endpoint: '/api/test', method: 'GET', requiresAuth: false, expectedStatus: 200, category: 'system', priority: 'critical' },

    // Authentication - Core
    { name: 'Login', endpoint: '/auth/login', method: 'POST', requiresAuth: false, expectedStatus: 200, category: 'auth', priority: 'critical',
      testData: { email: 'test@example.com', password: 'TestPass123!' }
    },
    { name: 'Get Current User', endpoint: '/api/v1/auth/me', method: 'GET', requiresAuth: true, expectedStatus: 200, category: 'auth', priority: 'critical' },
    { name: 'Refresh Token', endpoint: '/api/v1/auth/refresh', method: 'POST', requiresAuth: true, expectedStatus: 200, category: 'auth', priority: 'critical' },

    // Core API Functions
    { name: 'List Platforms', endpoint: '/api/v1/platforms/', method: 'GET', requiresAuth: true, expectedStatus: 200, category: 'platforms', priority: 'critical' },
    { name: 'List Posts', endpoint: '/api/v1/posts/', method: 'GET', requiresAuth: true, expectedStatus: 200, category: 'posts', priority: 'critical' },
    { name: 'List Media', endpoint: '/api/v1/media/', method: 'GET', requiresAuth: true, expectedStatus: 200, category: 'media', priority: 'critical' },
    { name: 'Analytics Overview', endpoint: '/api/v1/analytics/overview', method: 'GET', requiresAuth: true, expectedStatus: 200, category: 'analytics', priority: 'critical' },
  ];

  // All endpoints for comprehensive testing
  private allEndpoints: EndpointTest[] = [
    ...this.criticalEndpoints,
    
    // Authentication - Extended
    { name: 'Register', endpoint: '/api/v1/auth/register', method: 'POST', requiresAuth: false, expectedStatus: 201, category: 'auth', priority: 'high',
      testData: { email: 'newtest@example.com', password: 'TestPass123!', name: 'New Test User' }
    },
    { name: 'Logout', endpoint: '/api/v1/auth/logout', method: 'POST', requiresAuth: true, expectedStatus: 200, category: 'auth', priority: 'high' },

    // User Management
    { name: 'Get Profile', endpoint: '/api/v1/users/profile', method: 'GET', requiresAuth: true, expectedStatus: 200, category: 'users', priority: 'high' },
    { name: 'Update Profile', endpoint: '/api/v1/users/profile', method: 'PUT', requiresAuth: true, expectedStatus: 200, category: 'users', priority: 'medium',
      testData: { name: 'Updated Test User', bio: 'Test bio update' }
    },
    { name: 'Get User Settings', endpoint: '/api/v1/users/settings', method: 'GET', requiresAuth: true, expectedStatus: 200, category: 'users', priority: 'medium' },
    { name: 'Update Settings', endpoint: '/api/v1/users/settings', method: 'PUT', requiresAuth: true, expectedStatus: 200, category: 'users', priority: 'medium',
      testData: { theme: 'dark', notifications: true }
    },

    // Platform Management
    { name: 'Instagram Auth URL', endpoint: '/api/v1/platforms/instagram/auth-url', method: 'GET', requiresAuth: true, expectedStatus: 200, category: 'platforms', priority: 'high' },
    { name: 'TikTok Auth URL', endpoint: '/api/v1/platforms/tiktok/auth-url', method: 'GET', requiresAuth: true, expectedStatus: 200, category: 'platforms', priority: 'high' },
    { name: 'Instagram Profile', endpoint: '/api/v1/platforms/instagram/profile', method: 'GET', requiresAuth: true, expectedStatus: 200, category: 'platforms', priority: 'medium' },

    // Posts & Content
    { name: 'Create Post', endpoint: '/api/v1/posts/', method: 'POST', requiresAuth: true, expectedStatus: 201, category: 'posts', priority: 'high',
      testData: { content: 'Test post content', platforms: ['instagram'], hashtags: ['#test'] }
    },

    // Media Management
    { name: 'Media Gallery', endpoint: '/api/v1/media/gallery', method: 'GET', requiresAuth: true, expectedStatus: 200, category: 'media', priority: 'high' },

    // AI Content Generation
    { name: 'Generate Caption', endpoint: '/api/v1/ai/generate-caption', method: 'POST', requiresAuth: true, expectedStatus: 200, category: 'ai', priority: 'high',
      testData: { prompt: 'Create a caption for a sunset photo', tone: 'casual', platform: 'instagram' }
    },
    { name: 'Generate Hashtags', endpoint: '/api/v1/ai/generate-hashtags', method: 'POST', requiresAuth: true, expectedStatus: 200, category: 'ai', priority: 'high',
      testData: { content: 'Beautiful sunset at the beach', platform: 'instagram', count: 10 }
    },
    { name: 'Content Ideas', endpoint: '/api/v1/ai/content-ideas', method: 'POST', requiresAuth: true, expectedStatus: 200, category: 'ai', priority: 'medium',
      testData: { niche: 'travel', platforms: ['instagram', 'tiktok'], count: 5 }
    },

    // Scheduling
    { name: 'List Schedules', endpoint: '/api/v1/schedule/', method: 'GET', requiresAuth: true, expectedStatus: 200, category: 'scheduling', priority: 'high' },
    { name: 'Schedule Post', endpoint: '/api/v1/schedule/', method: 'POST', requiresAuth: true, expectedStatus: 201, category: 'scheduling', priority: 'high',
      testData: { post_id: 'test_post_id', scheduled_time: '2024-12-31T12:00:00Z', platforms: ['instagram'] }
    },
    { name: 'Schedule Calendar', endpoint: '/api/v1/schedule/calendar', method: 'GET', requiresAuth: true, expectedStatus: 200, category: 'scheduling', priority: 'medium' },

    // Analytics - Extended
    { name: 'Platform Analytics', endpoint: '/api/v1/analytics/platforms', method: 'GET', requiresAuth: true, expectedStatus: 200, category: 'analytics', priority: 'high' },
    { name: 'Performance Metrics', endpoint: '/api/v1/analytics/performance', method: 'GET', requiresAuth: true, expectedStatus: 200, category: 'analytics', priority: 'medium' },
    { name: 'Export Analytics', endpoint: '/api/v1/analytics/export', method: 'POST', requiresAuth: true, expectedStatus: 200, category: 'analytics', priority: 'medium',
      testData: { format: 'csv', date_range: { start: '2024-01-01', end: '2024-12-31' } }
    },

    // Templates
    { name: 'List Templates', endpoint: '/api/v1/templates/', method: 'GET', requiresAuth: true, expectedStatus: 200, category: 'templates', priority: 'medium' },
    { name: 'Create Template', endpoint: '/api/v1/templates/', method: 'POST', requiresAuth: true, expectedStatus: 201, category: 'templates', priority: 'medium',
      testData: { name: 'Test Template', content: 'Template content', category: 'general' }
    },
    { name: 'Template Categories', endpoint: '/api/v1/templates/categories', method: 'GET', requiresAuth: true, expectedStatus: 200, category: 'templates', priority: 'low' },

    // Google Photos Integration
    { name: 'Google Photos Status', endpoint: '/api/v1/google-photos/status', method: 'GET', requiresAuth: true, expectedStatus: 200, category: 'google-photos', priority: 'medium' },
    { name: 'List Albums', endpoint: '/api/v1/google-photos/albums', method: 'GET', requiresAuth: true, expectedStatus: 200, category: 'google-photos', priority: 'medium' },

    // Video Processing
    { name: 'Processing Jobs', endpoint: '/api/v1/video/processing/jobs', method: 'GET', requiresAuth: true, expectedStatus: 200, category: 'video', priority: 'medium' },
    { name: 'Processing Stats', endpoint: '/api/v1/video/processing/stats', method: 'GET', requiresAuth: true, expectedStatus: 200, category: 'video', priority: 'low' },

    // Compliance
    { name: 'Compliance Rules', endpoint: '/api/v1/compliance/rules', method: 'GET', requiresAuth: true, expectedStatus: 200, category: 'compliance', priority: 'medium' },
    { name: 'Check Content Compliance', endpoint: '/api/v1/compliance/check', method: 'POST', requiresAuth: true, expectedStatus: 200, category: 'compliance', priority: 'medium',
      testData: { content: 'Test content for compliance check', platforms: ['instagram'] }
    }
  ];

  async testEndpoint(test: EndpointTest): Promise<TestResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    try {
      let response;
      const headers: any = {};

      // Add auth token if required
      if (test.requiresAuth) {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Authentication required but no token found');
        }
        headers.Authorization = `Bearer ${token}`;
      }

      // Make the API call based on method
      switch (test.method) {
        case 'GET':
          response = await fetch(`${this.api['api'].defaults.baseURL}${test.endpoint}`, {
            method: 'GET',
            headers: { ...headers, 'Content-Type': 'application/json' }
          });
          break;
        case 'POST':
          response = await fetch(`${this.api['api'].defaults.baseURL}${test.endpoint}`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: test.testData ? JSON.stringify(test.testData) : undefined
          });
          break;
        case 'PUT':
          response = await fetch(`${this.api['api'].defaults.baseURL}${test.endpoint}`, {
            method: 'PUT',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: test.testData ? JSON.stringify(test.testData) : undefined
          });
          break;
        case 'DELETE':
          response = await fetch(`${this.api['api'].defaults.baseURL}${test.endpoint}`, {
            method: 'DELETE',
            headers: { ...headers, 'Content-Type': 'application/json' }
          });
          break;
        default:
          throw new Error(`Unsupported method: ${test.method}`);
      }

      const responseTime = Date.now() - startTime;
      const responseData = await response.json().catch(() => null);

      const result: TestResult = {
        test,
        success: response.status === test.expectedStatus,
        status: response.status,
        responseTime,
        response: responseData,
        timestamp
      };

      if (!result.success) {
        result.error = `Expected status ${test.expectedStatus}, got ${response.status}`;
      }

      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        test,
        success: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp
      };
    }
  }

  async runCriticalTests(): Promise<TestResult[]> {
    console.log('🔍 Running critical API endpoint tests...');
    const results = [];

    for (const test of this.criticalEndpoints) {
      console.log(`Testing: ${test.name} (${test.method} ${test.endpoint})`);
      const result = await this.testEndpoint(test);
      results.push(result);
      
      if (!result.success) {
        console.error(`❌ CRITICAL FAILURE: ${test.name} - ${result.error}`);
      } else {
        console.log(`✅ ${test.name} - ${result.responseTime}ms`);
      }
    }

    this.results = results;
    return results;
  }

  async runAllTests(): Promise<TestResult[]> {
    console.log('🔍 Running comprehensive API endpoint tests...');
    const results = [];

    for (const test of this.allEndpoints) {
      console.log(`Testing: ${test.name} (${test.method} ${test.endpoint})`);
      const result = await this.testEndpoint(test);
      results.push(result);
      
      if (!result.success) {
        console.error(`❌ ${test.name} - ${result.error || 'Failed'}`);
      } else {
        console.log(`✅ ${test.name} - ${result.responseTime}ms`);
      }

      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.results = results;
    return results;
  }

  getTestSummary(): {
    total: number;
    passed: number;
    failed: number;
    criticalFailures: number;
    averageResponseTime: number;
    categoryBreakdown: { [key: string]: { passed: number; failed: number; } };
  } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;
    const criticalFailures = this.results.filter(r => !r.success && r.test.priority === 'critical').length;
    const averageResponseTime = this.results.reduce((sum, r) => sum + r.responseTime, 0) / total;

    const categoryBreakdown: { [key: string]: { passed: number; failed: number; } } = {};
    this.results.forEach(result => {
      const category = result.test.category;
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = { passed: 0, failed: 0 };
      }
      if (result.success) {
        categoryBreakdown[category].passed++;
      } else {
        categoryBreakdown[category].failed++;
      }
    });

    return {
      total,
      passed,
      failed,
      criticalFailures,
      averageResponseTime: Math.round(averageResponseTime),
      categoryBreakdown
    };
  }

  getFailedTests(): TestResult[] {
    return this.results.filter(r => !r.success);
  }

  getCriticalFailures(): TestResult[] {
    return this.results.filter(r => !r.success && r.test.priority === 'critical');
  }

  generateReport(): string {
    const summary = this.getTestSummary();
    const failedTests = this.getFailedTests();
    const criticalFailures = this.getCriticalFailures();

    let report = `
🔍 CROW'S EYE API HEALTH CHECK REPORT
=====================================

📊 SUMMARY:
- Total Tests: ${summary.total}
- Passed: ${summary.passed} (${Math.round((summary.passed / summary.total) * 100)}%)
- Failed: ${summary.failed} (${Math.round((summary.failed / summary.total) * 100)}%)
- Critical Failures: ${summary.criticalFailures}
- Average Response Time: ${summary.averageResponseTime}ms

📈 BREAKDOWN BY CATEGORY:
`;

    Object.entries(summary.categoryBreakdown).forEach(([category, stats]) => {
      const total = stats.passed + stats.failed;
      const passRate = Math.round((stats.passed / total) * 100);
      report += `- ${category}: ${stats.passed}/${total} (${passRate}%)\n`;
    });

    if (criticalFailures.length > 0) {
      report += `\n🚨 CRITICAL FAILURES (${criticalFailures.length}):`;
      criticalFailures.forEach(failure => {
        report += `\n- ${failure.test.name} (${failure.test.endpoint}): ${failure.error}`;
      });
    }

    if (failedTests.length > 0 && failedTests.length > criticalFailures.length) {
      report += `\n⚠️  OTHER FAILURES:`;
      failedTests
        .filter(f => f.test.priority !== 'critical')
        .forEach(failure => {
          report += `\n- ${failure.test.name} (${failure.test.endpoint}): ${failure.error}`;
        });
    }

    report += `\n\n✅ RECOMMENDATIONS:`;
    if (criticalFailures.length > 0) {
      report += `\n1. FIX CRITICAL FAILURES IMMEDIATELY - Core functionality is broken`;
    }
    if (summary.averageResponseTime > 2000) {
      report += `\n2. Investigate slow response times (${summary.averageResponseTime}ms average)`;
    }
    if (summary.failed > 0) {
      report += `\n3. Review and fix ${summary.failed} failed endpoints`;
    }
    if (summary.passed === summary.total) {
      report += `\n🎉 ALL TESTS PASSING! API is fully functional.`;
    }

    return report;
  }
}

// Export a pre-configured instance
export const apiHealthChecker = new APIHealthChecker();

// Utility functions for quick checks
export const runQuickHealthCheck = async (): Promise<boolean> => {
  const checker = new APIHealthChecker();
  const results = await checker.runCriticalTests();
  const criticalFailures = results.filter(r => !r.success && r.test.priority === 'critical');
  return criticalFailures.length === 0;
};

export const getAPIStatus = async (): Promise<'healthy' | 'degraded' | 'down'> => {
  try {
    const checker = new APIHealthChecker();
    const results = await checker.runCriticalTests();
    const summary = checker.getTestSummary();
    
    if (summary.criticalFailures > 0) {
      return 'down';
    } else if (summary.failed > 0) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  } catch (error) {
    return 'down';
  }
}; 