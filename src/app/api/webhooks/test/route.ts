import { NextRequest, NextResponse } from 'next/server';

// Test webhook endpoint
export async function GET(request: NextRequest) {
  console.log('🧪 Test webhook endpoint called');
  
  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    method: 'GET',
    message: 'Test webhook endpoint is working!'
  });
}

export async function POST(request: NextRequest) {
  console.log('🧪 Test webhook POST endpoint called');
  
  try {
    const body = await request.json();
    console.log('📊 Test webhook received data:', body);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      method: 'POST',
      receivedData: body,
      message: 'Test webhook POST endpoint is working!'
    });
  } catch (error) {
    console.error('💥 Test webhook error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process request'
    }, { status: 500 });
  }
} 