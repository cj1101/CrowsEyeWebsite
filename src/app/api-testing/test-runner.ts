import { CrowsEyeAPI } from '@/services/api';

interface QuickTestResult {
  endpoint: string;
  status: 'success' | 'error' | 'timeout';
  responseTime: number;
  statusCode?: number;
  error?: string;
  isCore: boolean;
}

export class APITestRunner {
  private api: CrowsEyeAPI;
  private baseURL: string;

  constructor() {
    this.api = new CrowsEyeAPI();
    // Get the base URL from the API instance
    this.baseURL = this.api['api']?.defaults?.baseURL || 'https://crow-eye-api-dot-crows-eye-website.uc.r.appspot.com';
    console.log('🔧 API Test Runner initialized with base URL:', this.baseURL);
  }

  // Critical endpoints that MUST work
  private coreEndpoints = [
    { endpoint: '/health', method: 'GET', isCore: true, requiresAuth: false },
    { endpoint: '/api/test', method: 'GET', isCore: true, requiresAuth: false },
    { endpoint: '/api/v1/auth/me', method: 'GET', isCore: true, requiresAuth: true },
    { endpoint: '/api/v1/platforms/', method: 'GET', isCore: true, requiresAuth: true },
    { endpoint: '/api/v1/posts/', method: 'GET', isCore: true, requiresAuth: true },
    { endpoint: '/api/v1/media/', method: 'GET', isCore: true, requiresAuth: true }
  ];

  async testSingleEndpoint(endpoint: string, method: string = 'GET', requiresAuth: boolean = false): Promise<QuickTestResult> {
    const startTime = Date.now();
    const fullUrl = `${this.baseURL}${endpoint}`;
    
    console.log(`🔍 Testing: ${method} ${fullUrl}`);

    try {
      const headers: any = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      // Add auth token if required
      if (requiresAuth) {
        const token = localStorage.getItem('auth_token');
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn('⚠️ Auth required but no token found');
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(fullUrl, {
        method,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      const result: QuickTestResult = {
        endpoint,
        status: response.ok ? 'success' : 'error',
        responseTime,
        statusCode: response.status,
        isCore: this.coreEndpoints.some(e => e.endpoint === endpoint)
      };

      if (!response.ok) {
        result.error = `HTTP ${response.status}: ${response.statusText}`;
      }

      console.log(`${response.ok ? '✅' : '❌'} ${endpoint}: ${response.status} (${responseTime}ms)`);
      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      let errorMessage = 'Unknown error';
      let status: 'error' | 'timeout' = 'error';

      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.name === 'AbortError') {
          status = 'timeout';
          errorMessage = 'Request timeout (>10s)';
        }
      }

      console.error(`❌ ${endpoint}: ${errorMessage} (${responseTime}ms)`);
      
      return {
        endpoint,
        status,
        responseTime,
        error: errorMessage,
        isCore: this.coreEndpoints.some(e => e.endpoint === endpoint)
      };
    }
  }

  async runQuickConnectionTest(): Promise<{
    results: QuickTestResult[];
    summary: {
      total: number;
      passed: number;
      failed: number;
      timeouts: number;
      coreSystemOk: boolean;
      averageResponseTime: number;
    };
  }> {
    console.log('🚀 Starting Quick API Connection Test...');
    console.log('📡 Base URL:', this.baseURL);
    
    const results: QuickTestResult[] = [];

    // Test core endpoints first
    for (const test of this.coreEndpoints) {
      const result = await this.testSingleEndpoint(test.endpoint, test.method, test.requiresAuth);
      results.push(result);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Calculate summary
    const total = results.length;
    const passed = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'error').length;
    const timeouts = results.filter(r => r.status === 'timeout').length;
    const coreSystemOk = results.filter(r => r.isCore && r.status === 'success').length >= 2; // At least health + one other
    const averageResponseTime = Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / total);

    const summary = {
      total,
      passed,
      failed,
      timeouts,
      coreSystemOk,
      averageResponseTime
    };

    console.log('📊 Test Summary:', summary);
    
    return { results, summary };
  }

  async testWithAuth(email: string, password: string): Promise<boolean> {
    console.log('🔐 Testing authentication...');
    
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.access_token) {
          localStorage.setItem('auth_token', data.data.access_token);
          console.log('✅ Authentication successful');
          return true;
        }
      }
      
      console.error('❌ Authentication failed:', response.status, response.statusText);
      return false;

    } catch (error) {
      console.error('❌ Authentication error:', error);
      return false;
    }
  }

  generateReport(results: QuickTestResult[], summary: any): string {
    let report = `
🦅 CROW'S EYE API CONNECTION TEST REPORT
========================================

🔗 Base URL: ${this.baseURL}
📊 Test Results: ${summary.passed}/${summary.total} passed (${Math.round((summary.passed/summary.total)*100)}%)
⏱️  Average Response: ${summary.averageResponseTime}ms
🔧 Core System Status: ${summary.coreSystemOk ? '✅ OPERATIONAL' : '❌ DEGRADED'}

📋 DETAILED RESULTS:
`;

    results.forEach(result => {
      const status = result.status === 'success' ? '✅' : 
                    result.status === 'timeout' ? '⏰' : '❌';
      const core = result.isCore ? '[CORE]' : '[REG]';
      
      report += `${status} ${core} ${result.endpoint} - ${result.responseTime}ms`;
      if (result.statusCode) {
        report += ` (${result.statusCode})`;
      }
      if (result.error) {
        report += ` - ${result.error}`;
      }
      report += '\n';
    });

    const failedTests = results.filter(r => r.status !== 'success');
    if (failedTests.length > 0) {
      report += `\n🚨 FAILED TESTS (${failedTests.length}):`;
      failedTests.forEach(test => {
        report += `\n- ${test.endpoint}: ${test.error || 'Unknown error'}`;
      });
    }

    report += `\n\n💡 RECOMMENDATIONS:`;
    if (!summary.coreSystemOk) {
      report += `\n1. 🚨 CRITICAL: Core system is not responding properly`;
    }
    if (summary.timeouts > 0) {
      report += `\n2. ⏰ ${summary.timeouts} endpoints are timing out - check network/server`;
    }
    if (summary.averageResponseTime > 2000) {
      report += `\n3. 🐌 Slow response times (${summary.averageResponseTime}ms) - investigate performance`;
    }
    if (failedTests.some(t => t.statusCode === 401)) {
      report += `\n4. 🔐 Authentication issues detected - verify JWT tokens`;
    }
    if (failedTests.some(t => t.statusCode === 502 || t.statusCode === 503)) {
      report += `\n5. 🔧 Server errors detected - backend may be down`;
    }
    if (summary.passed === summary.total) {
      report += `\n🎉 ALL SYSTEMS GO! API is fully operational.`;
    }

    return report;
  }
}

// Export functions for immediate use
export const runQuickAPITest = async (): Promise<void> => {
  const tester = new APITestRunner();
  const { results, summary } = await tester.runQuickConnectionTest();
  const report = tester.generateReport(results, summary);
  console.log(report);
  return;
};

export const testAPIConnection = async (email?: string, password?: string): Promise<boolean> => {
  const tester = new APITestRunner();
  
  // Test basic connectivity first
  const healthResult = await tester.testSingleEndpoint('/health', 'GET', false);
  if (healthResult.status !== 'success') {
    console.error('🚨 Basic health check failed - API is not reachable');
    return false;
  }

  // Test auth if credentials provided
  if (email && password) {
    const authSuccess = await tester.testWithAuth(email, password);
    if (!authSuccess) {
      console.error('🚨 Authentication failed');
      return false;
    }
  }

  console.log('✅ API connection test passed');
  return true;
};

// Window global for browser console access
if (typeof window !== 'undefined') {
  (window as any).runAPITest = runQuickAPITest;
  (window as any).testAPI = testAPIConnection;
  (window as any).APITestRunner = APITestRunner;
} 