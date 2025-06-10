import { NextRequest, NextResponse } from 'next/server';

// Simple test endpoint to verify webhook infrastructure is working
export async function GET(request: NextRequest) {
  console.log('🧪 Test webhook endpoint called');
  
  const searchParams = request.nextUrl.searchParams;
  const testParam = searchParams.get('test');
  
  return NextResponse.json({
    status: 'success',
    message: 'Webhook infrastructure is working',
    timestamp: new Date().toISOString(),
    testParam: testParam,
    webhookEndpoints: [
      {
        path: '/api/webhooks/instagram',
        methods: ['GET', 'POST'],
        purpose: 'Instagram webhook for comments, DMs, mentions'
      },
      {
        path: '/api/webhooks/test',
        methods: ['GET', 'POST'],
        purpose: 'Test endpoint for webhook verification'
      }
    ]
  });
}

export async function POST(request: NextRequest) {
  console.log('🧪 Test webhook POST endpoint called');
  
  try {
    const body = await request.json();
    console.log('📨 Test webhook received data:', body);
    
    return NextResponse.json({
      status: 'success',
      message: 'Test webhook POST received successfully',
      timestamp: new Date().toISOString(),
      receivedData: body
    });
  } catch (error) {
    console.error('💥 Test webhook error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to process test webhook',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 