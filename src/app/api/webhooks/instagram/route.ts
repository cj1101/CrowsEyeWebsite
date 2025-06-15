import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Environment variables
const INSTAGRAM_VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || 'your-verify-token-here';
const INSTAGRAM_WEBHOOK_SECRET = process.env.INSTAGRAM_WEBHOOK_SECRET || 'your-webhook-secret-here';

// Verify webhook signature
function verifySignature(body: string, signature: string): boolean {
  if (!signature) {
    return false;
  }

  try {
    const cleanSignature = signature.replace('sha256=', '');
    const expectedSignature = crypto
      .createHmac('sha256', INSTAGRAM_WEBHOOK_SECRET)
      .update(body, 'utf8')
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(cleanSignature, 'hex')
    );
  } catch (error) {
    console.error('Signature validation error:', error);
    return false;
  }
}

// Process Instagram webhook events
async function processInstagramWebhook(data: any) {
  console.log('📊 Processing Instagram webhook data:', JSON.stringify(data, null, 2));
  
  // Handle different event types
  if (data.object === 'instagram') {
    for (const entry of data.entry) {
      // Handle messaging events
      if (entry.messaging) {
        for (const message of entry.messaging) {
          console.log('💬 Message event:', message);
          // Process direct messages here
        }
      }
      
      // Handle changes (comments, mentions)
      if (entry.changes) {
        for (const change of entry.changes) {
          console.log('🔄 Change event:', change);
          
          if (change.field === 'comments') {
            console.log('💬 Comment event:', change.value);
            // Process comment here
          }
          
          if (change.field === 'mentions') {
            console.log('📢 Mention event:', change.value);
            // Process mention here
          }
        }
      }
    }
  }
}

// GET handler for webhook verification
export async function GET(request: NextRequest) {
  console.log('📥 Instagram webhook verification request received');
  
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('🔍 Verification params:', { mode, token, challenge });

  if (mode === 'subscribe' && token === INSTAGRAM_VERIFY_TOKEN) {
    console.log('✅ Instagram webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.error('❌ Instagram webhook verification failed');
    console.error('Expected token:', INSTAGRAM_VERIFY_TOKEN);
    console.error('Received token:', token);
    return new NextResponse('Forbidden', { status: 403 });
  }
}

// POST handler for webhook events
export async function POST(request: NextRequest) {
  console.log('📥 Instagram webhook event received');
  
  try {
    const signature = request.headers.get('x-hub-signature-256');
    const body = await request.text();

    console.log('🔐 Verifying webhook signature...');
    
    if (!verifySignature(body, signature || '')) {
      console.error('❌ Instagram webhook signature verification failed');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = JSON.parse(body);
    console.log('📊 Instagram webhook data:', data);
    
    // Process the webhook event
    await processInstagramWebhook(data);

    console.log('✅ Instagram webhook processed successfully');
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('💥 Instagram webhook processing error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 