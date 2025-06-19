// Crow's Eye API Comprehensive Test Script
// Copy and paste this entire script into your browser console (F12 > Console)
// Run it while on http://localhost:3000

console.log('🚀 Starting Crow\'s Eye API Comprehensive Test...');
console.log('📍 Testing from:', window.location.origin);

// Configuration
const API_BASE_URL = 'http://localhost:3002';
const API_TIMEOUT = 10000; // 10 seconds

// Test Results Storage
const testResults = {
  system: [],
  auth: [],
  endpoints: [],
  errors: [],
  summary: {}
};

// Utility Functions
const formatDuration = (ms) => `${ms}ms`;
const getTimestamp = () => new Date().toISOString();

const logTest = (category, test, status, message, duration = null) => {
  const result = {
    test,
    status,
    message,
    duration: duration ? formatDuration(duration) : null,
    timestamp: getTimestamp()
  };
  
  testResults[category].push(result);
  
  const statusIcon = {
    'success': '✅',
    'warning': '⚠️',
    'error': '❌',
    'info': 'ℹ️'
  }[status] || 'ℹ️';
  
  console.log(`${statusIcon} [${category.toUpperCase()}] ${test}: ${message}${duration ? ` (${formatDuration(duration)})` : ''}`);
};

// HTTP Request Helper
const makeRequest = async (endpoint, options = {}) => {
  const startTime = Date.now();
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    }
  };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  const finalOptions = { ...defaultOptions, ...options };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), finalOptions.timeout);

    const response = await fetch(url, {
      ...finalOptions,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    
    let responseData;
    try {
      responseData = await response.json();
    } catch {
      responseData = await response.text();
    }

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: responseData,
      duration,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      status: 0,
      statusText: error.name,
      error: error.message,
      duration
    };
  }
};

// Test Categories
const runSystemTests = async () => {
  console.log('\n🔧 Running System Tests...');
  
  // Test 1: Basic Connectivity
  try {
    const result = await makeRequest('/health');
    if (result.success) {
      logTest('system', 'Health Check', 'success', `API is responding (${result.status})`, result.duration);
    } else {
      logTest('system', 'Health Check', 'error', `API unreachable: ${result.error || result.statusText}`, result.duration);
    }
  } catch (error) {
    logTest('system', 'Health Check', 'error', `Connection failed: ${error.message}`);
  }

  // Test 2: CORS Configuration
  try {
    const result = await makeRequest('/api/test', { method: 'OPTIONS' });
    const corsHeaders = ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods'];
    const hasCors = corsHeaders.some(header => result.headers[header.toLowerCase()]);
    
    if (hasCors) {
      logTest('system', 'CORS Configuration', 'success', 'CORS headers present');
    } else {
      logTest('system', 'CORS Configuration', 'warning', 'CORS headers not detected');
    }
  } catch (error) {
    logTest('system', 'CORS Configuration', 'error', `CORS test failed: ${error.message}`);
  }

  // Test 3: API Version
  try {
    const result = await makeRequest('/api/v1/health');
    if (result.success) {
      logTest('system', 'API Version Check', 'success', 'API v1 accessible');
    } else {
      logTest('system', 'API Version Check', 'warning', 'API v1 endpoint not found');
    }
  } catch (error) {
    logTest('system', 'API Version Check', 'error', `Version check failed: ${error.message}`);
  }
};

const runAuthTests = async () => {
  console.log('\n🔐 Running Authentication Tests...');
  
  // Test 1: Check current auth status
  const token = localStorage.getItem('auth_token');
  if (token) {
    logTest('auth', 'Token Presence', 'info', 'Auth token found in localStorage');
    
    // Test token validity
    try {
      const result = await makeRequest('/api/v1/auth/me');
      if (result.success) {
        logTest('auth', 'Token Validation', 'success', `User authenticated: ${result.data?.name || 'Unknown'}`);
      } else {
        logTest('auth', 'Token Validation', 'warning', `Token invalid: ${result.statusText}`);
      }
    } catch (error) {
      logTest('auth', 'Token Validation', 'error', `Token check failed: ${error.message}`);
    }
  } else {
    logTest('auth', 'Token Presence', 'warning', 'No auth token found');
  }

  // Test 2: Registration endpoint
  try {
    const testUser = {
      email: `test_${Date.now()}@example.com`,
      password: 'TestPass123!',
      name: 'API Test User'
    };
    
    const result = await makeRequest('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(testUser)
    });
    
    if (result.status === 201 || result.status === 200) {
      logTest('auth', 'Registration Endpoint', 'success', 'Registration endpoint accessible');
    } else if (result.status === 409) {
      logTest('auth', 'Registration Endpoint', 'success', 'Registration endpoint working (user exists)');
    } else {
      logTest('auth', 'Registration Endpoint', 'warning', `Unexpected response: ${result.status}`);
    }
  } catch (error) {
    logTest('auth', 'Registration Endpoint', 'error', `Registration test failed: ${error.message}`);
  }

  // Test 3: Login endpoint
  try {
    const result = await makeRequest('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'invalid'
      })
    });
    
    if (result.status === 401) {
      logTest('auth', 'Login Endpoint', 'success', 'Login endpoint accessible (rejected invalid creds)');
    } else if (result.status === 200) {
      logTest('auth', 'Login Endpoint', 'success', 'Login endpoint working');
    } else {
      logTest('auth', 'Login Endpoint', 'warning', `Unexpected response: ${result.status}`);
    }
  } catch (error) {
    logTest('auth', 'Login Endpoint', 'error', `Login test failed: ${error.message}`);
  }
};

const runEndpointTests = async () => {
  console.log('\n🔗 Running Core Endpoint Tests...');
  
  const coreEndpoints = [
    { path: '/api/v1/platforms/', method: 'GET', name: 'Platforms List' },
    { path: '/api/v1/posts/', method: 'GET', name: 'Posts List' },
    { path: '/api/v1/media/', method: 'GET', name: 'Media Library' },
    { path: '/api/v1/schedule/', method: 'GET', name: 'Scheduled Posts' },
    { path: '/api/v1/analytics/overview', method: 'GET', name: 'Analytics Overview' },
    { path: '/api/v1/ai/generate-caption', method: 'POST', name: 'AI Caption Generation' },
    { path: '/api/v1/templates/', method: 'GET', name: 'Templates' },
    { path: '/api/v1/highlights/', method: 'GET', name: 'Highlights' }
  ];

  for (const endpoint of coreEndpoints) {
    try {
      const options = { method: endpoint.method };
      
      // Add test data for POST requests
      if (endpoint.method === 'POST') {
        if (endpoint.path.includes('caption')) {
          options.body = JSON.stringify({
            prompt: 'Test caption generation',
            platform: 'instagram',
            tone: 'casual'
          });
        }
      }

      const result = await makeRequest(endpoint.path, options);
      
      if (result.success) {
        logTest('endpoints', endpoint.name, 'success', `${endpoint.method} ${result.status}`, result.duration);
      } else if (result.status === 401) {
        logTest('endpoints', endpoint.name, 'warning', 'Authentication required');
      } else if (result.status === 404) {
        logTest('endpoints', endpoint.name, 'error', 'Endpoint not found');
      } else {
        logTest('endpoints', endpoint.name, 'warning', `${result.status}: ${result.statusText}`);
      }
    } catch (error) {
      logTest('endpoints', endpoint.name, 'error', `Request failed: ${error.message}`);
    }
  }
};

const checkEnvironment = () => {
  console.log('\n🌍 Environment Check...');
  
  // Check if we're running in development
  const isDev = window.location.hostname === 'localhost';
  logTest('system', 'Environment', 'info', `Running in ${isDev ? 'development' : 'production'} mode`);
  
  // Check current URL
  logTest('system', 'Frontend URL', 'info', window.location.origin);
  logTest('system', 'Backend URL', 'info', API_BASE_URL);
  
  // Check localStorage
  const keys = Object.keys(localStorage);
  logTest('system', 'LocalStorage', 'info', `${keys.length} items stored`);
  
  // Check if service worker is running
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      logTest('system', 'Service Worker', 'info', `${registrations.length} registrations`);
    });
  }
};

const performNetworkDiagnostics = async () => {
  console.log('\n🔍 Network Diagnostics...');
  
  // Test different endpoints to identify patterns
  const diagnosticTests = [
    { url: API_BASE_URL, name: 'Base URL' },
    { url: `${API_BASE_URL}/health`, name: 'Health Endpoint' },
    { url: `${API_BASE_URL}/api/v1/health`, name: 'API v1 Health' },
    { url: 'http://localhost:3002', name: 'Direct Backend Access' }
  ];

  for (const test of diagnosticTests) {
    try {
      const startTime = Date.now();
      const response = await fetch(test.url, { 
        method: 'HEAD',
        mode: 'cors'
      });
      const duration = Date.now() - startTime;
      
      logTest('system', `Network: ${test.name}`, 'success', `Reachable (${response.status})`, duration);
    } catch (error) {
      logTest('system', `Network: ${test.name}`, 'error', `Failed: ${error.message}`);
    }
  }
};

const generateReport = () => {
  console.log('\n📊 TEST SUMMARY');
  console.log('==================');
  
  const categories = ['system', 'auth', 'endpoints'];
  const totals = { success: 0, warning: 0, error: 0, total: 0 };
  
  categories.forEach(category => {
    const tests = testResults[category];
    const categoryTotals = tests.reduce((acc, test) => {
      acc[test.status]++;
      acc.total++;
      return acc;
    }, { success: 0, warning: 0, error: 0, total: 0 });
    
    console.log(`\n${category.toUpperCase()}:`);
    console.log(`  ✅ Success: ${categoryTotals.success}`);
    console.log(`  ⚠️  Warning: ${categoryTotals.warning}`);
    console.log(`  ❌ Error: ${categoryTotals.error}`);
    console.log(`  📊 Total: ${categoryTotals.total}`);
    
    Object.keys(totals).forEach(key => {
      totals[key] += categoryTotals[key];
    });
  });
  
  console.log('\nOVERALL:');
  console.log(`  ✅ Success: ${totals.success}`);
  console.log(`  ⚠️  Warning: ${totals.warning}`);
  console.log(`  ❌ Error: ${totals.error}`);
  console.log(`  📊 Total: ${totals.total}`);
  
  const successRate = Math.round((totals.success / totals.total) * 100);
  console.log(`  🎯 Success Rate: ${successRate}%`);
  
  testResults.summary = {
    successRate,
    totals,
    timestamp: getTimestamp()
  };
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (testResults.system.some(t => t.test === 'Health Check' && t.status === 'error')) {
    console.log('  • Backend server is not running - start with: cd desktop_app/backend && npm run dev');
  }
  if (testResults.auth.some(t => t.test === 'Token Presence' && t.status === 'warning')) {
    console.log('  • No authentication token found - sign in first');
  }
  if (totals.error > 0) {
    console.log('  • Check Network tab in DevTools for detailed error information');
    console.log('  • Verify environment variables are set correctly');
  }
  
  return testResults;
};

// Main Test Runner
const runAllTests = async () => {
  console.clear();
  console.log('🔬 CROW\'S EYE API DIAGNOSTIC SUITE');
  console.log('=====================================');
  
  try {
    checkEnvironment();
    await performNetworkDiagnostics();
    await runSystemTests();
    await runAuthTests();
    await runEndpointTests();
    
    const report = generateReport();
    
    console.log('\n🔍 Detailed results available in: window.testResults');
    window.testResults = report;
    
    return report;
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    return { error: error.message };
  }
};

// Auto-run the tests
runAllTests(); 