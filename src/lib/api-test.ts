import { API_CONFIG } from './config';

export interface ApiTestResult {
  url: string;
  status: 'success' | 'error' | 'timeout';
  response?: any;
  error?: string;
  responseTime?: number;
}

/**
 * Test API endpoints to see which ones are available
 */
export async function testApiEndpoints(): Promise<ApiTestResult[]> {
  const endpoints = [
    'http://localhost:8001/api/v1/auth/login',
    'http://localhost:8001/api/v1/health',
    'https://firebasestorage.googleapis.com/api/v1/auth/login',
    'https://firebasestorage.googleapis.com/api/v1/auth/login',
  ];

  const results: ApiTestResult[] = [];

  for (const url of endpoints) {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 Testing endpoint: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add a timeout
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        console.log(`✅ ${url} - Status: ${response.status} (${responseTime}ms)`);
        results.push({
          url,
          status: 'success',
          responseTime,
        });
      } else {
        console.log(`⚠️ ${url} - Status: ${response.status} (${responseTime}ms)`);
        results.push({
          url,
          status: 'error',
          error: `HTTP ${response.status}: ${response.statusText}`,
          responseTime,
        });
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      console.log(`❌ ${url} - Error: ${error.message} (${responseTime}ms)`);
      results.push({
        url,
        status: 'error',
        error: error.message,
        responseTime,
      });
    }
  }

  return results;
}

/**
 * Test a specific API endpoint with a POST request
 */
export async function testApiPost(url: string, data: any): Promise<ApiTestResult> {
  const startTime = Date.now();
  
  try {
    console.log(`🔍 Testing POST: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const responseData = await response.json();
      console.log(`✅ ${url} - Status: ${response.status} (${responseTime}ms)`);
      return {
        url,
        status: 'success',
        response: responseData,
        responseTime,
      };
    } else {
      console.log(`⚠️ ${url} - Status: ${response.status} (${responseTime}ms)`);
      return {
        url,
        status: 'error',
        error: `HTTP ${response.status}: ${response.statusText}`,
        responseTime,
      };
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.log(`❌ ${url} - Error: ${error.message} (${responseTime}ms)`);
    return {
      url,
      status: 'error',
      error: error.message,
      responseTime,
    };
  }
} 