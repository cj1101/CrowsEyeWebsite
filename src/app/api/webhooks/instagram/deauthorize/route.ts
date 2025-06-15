import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Environment variables
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

// Handle Instagram app deauthorization
async function processDeauthorization(data: any) {
  console.log('🔓 Processing Instagram deauthorization:', JSON.stringify(data, null, 2));
  
  try {
    // Extract user information from the deauthorization data
    const userId = data.user_id;
    const signedRequest = data.signed_request;
    
    console.log(`🔓 User ${userId} has deauthorized the app`);
    
    // Here you would typically:
    // 1. Remove user's access tokens from your database
    // 2. Stop any scheduled posts for this user
    // 3. Clean up user-related data (if required)
    // 4. Log the deauthorization event
    
    // Example cleanup operations:
    // await removeUserTokens(userId);
    // await cancelScheduledPosts(userId);
    // await logDeauthorizationEvent(userId);
    
    console.log(`✅ Successfully processed deauthorization for user ${userId}`);
    
    return { success: true, userId };
  } catch (error) {
    console.error('💥 Error processing deauthorization:', error);
    throw error;
  }
}

// POST handler for deauthorization callbacks
export async function POST(request: NextRequest) {
  console.log('🔓 Instagram deauthorization callback received');
  
  try {
    const signature = request.headers.get('x-hub-signature-256');
    const body = await request.text();

    console.log('🔐 Verifying deauthorization signature...');
    
    if (!verifySignature(body, signature || '')) {
      console.error('❌ Instagram deauthorization signature verification failed');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = JSON.parse(body);
    console.log('📊 Instagram deauthorization data received');
    
    // Process the deauthorization
    const result = await processDeauthorization(data);

    console.log('✅ Instagram deauthorization processed successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'Deauthorization processed',
      userId: result.userId 
    });
  } catch (error) {
    console.error('💥 Instagram deauthorization processing error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// GET handler for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Instagram deauthorization callback endpoint is active',
    timestamp: new Date().toISOString(),
    url: request.url
  });
} 