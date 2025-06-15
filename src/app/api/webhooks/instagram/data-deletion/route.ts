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

// Generate confirmation code for data deletion
function generateConfirmationCode(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Handle Instagram data deletion request
async function processDataDeletionRequest(data: any) {
  console.log('🗑️ Processing Instagram data deletion request:', JSON.stringify(data, null, 2));
  
  try {
    // Extract user information from the deletion request
    const userId = data.user_id;
    const signedRequest = data.signed_request;
    
    console.log(`🗑️ Data deletion requested for user ${userId}`);
    
    // Generate a unique confirmation code for this deletion request
    const confirmationCode = generateConfirmationCode();
    
    // Here you would typically:
    // 1. Mark user data for deletion in your database
    // 2. Schedule actual data deletion (you have 30 days to complete it)
    // 3. Remove user's access tokens
    // 4. Delete user's posts, media, and other data
    // 5. Log the deletion request
    // 6. Send confirmation to user (optional)
    
    // Example deletion operations:
    // await markUserDataForDeletion(userId, confirmationCode);
    // await scheduleDataDeletion(userId, confirmationCode);
    // await removeUserTokens(userId);
    // await deleteUserPosts(userId);
    // await deleteUserMedia(userId);
    // await logDataDeletionRequest(userId, confirmationCode);
    
    console.log(`✅ Data deletion request processed for user ${userId}, confirmation: ${confirmationCode}`);
    
    return { 
      success: true, 
      userId, 
      confirmationCode,
      message: 'Data deletion request has been received and will be processed within 30 days'
    };
  } catch (error) {
    console.error('💥 Error processing data deletion request:', error);
    throw error;
  }
}

// POST handler for data deletion requests
export async function POST(request: NextRequest) {
  console.log('🗑️ Instagram data deletion request received');
  
  try {
    const signature = request.headers.get('x-hub-signature-256');
    const body = await request.text();

    console.log('🔐 Verifying data deletion request signature...');
    
    if (!verifySignature(body, signature || '')) {
      console.error('❌ Instagram data deletion signature verification failed');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = JSON.parse(body);
    console.log('📊 Instagram data deletion request data received');
    
    // Process the data deletion request
    const result = await processDataDeletionRequest(data);

    console.log('✅ Instagram data deletion request processed successfully');
    
    // Return the required response format for Instagram
    return NextResponse.json({ 
      url: `${request.nextUrl.origin}/api/webhooks/instagram/data-deletion/status?code=${result.confirmationCode}`,
      confirmation_code: result.confirmationCode
    });
  } catch (error) {
    console.error('💥 Instagram data deletion processing error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// GET handler for checking deletion status
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const confirmationCode = searchParams.get('code');
  
  if (confirmationCode) {
    // Check the status of a specific deletion request
    console.log(`🔍 Checking deletion status for confirmation code: ${confirmationCode}`);
    
    // Here you would check the actual deletion status from your database
    // const deletionStatus = await getDeletionStatus(confirmationCode);
    
    return NextResponse.json({
      success: true,
      confirmationCode,
      status: 'processing', // 'processing', 'completed', 'failed'
      message: 'Data deletion is in progress and will be completed within 30 days',
      timestamp: new Date().toISOString()
    });
  }
  
  // General endpoint info
  return NextResponse.json({
    success: true,
    message: 'Instagram data deletion request endpoint is active',
    timestamp: new Date().toISOString(),
    url: request.url,
    usage: 'POST to submit deletion requests, GET with ?code=CONFIRMATION_CODE to check status'
  });
} 