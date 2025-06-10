import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Instagram webhook configuration
const INSTAGRAM_WEBHOOK_SECRET = process.env.INSTAGRAM_WEBHOOK_SECRET || 'your-webhook-secret';
const INSTAGRAM_VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || 'your-verify-token';

// GET handler for webhook verification
export async function GET(request: NextRequest) {
  console.log('📥 Instagram webhook verification request received');
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    console.log('🔍 Verification params:', { mode, token, challenge });

    // Verify that this is a valid subscription request
    if (mode === 'subscribe' && token === INSTAGRAM_VERIFY_TOKEN) {
      console.log('✅ Instagram webhook verified successfully');
      return new NextResponse(challenge, { status: 200 });
    } else {
      console.error('❌ Instagram webhook verification failed');
      return new NextResponse('Forbidden', { status: 403 });
    }
  } catch (error) {
    console.error('💥 Instagram webhook verification error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST handler for webhook events
export async function POST(request: NextRequest) {
  console.log('📨 Instagram webhook event received');
  
  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    console.log('🔐 Verifying webhook signature...');
    
    // Verify the webhook signature
    if (!verifySignature(body, signature)) {
      console.error('❌ Instagram webhook signature verification failed');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Parse the webhook data
    const webhookData = JSON.parse(body);
    console.log('📊 Instagram webhook data:', JSON.stringify(webhookData, null, 2));

    // Process the webhook event
    await processInstagramWebhook(webhookData);

    console.log('✅ Instagram webhook processed successfully');
    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('💥 Instagram webhook processing error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Verify webhook signature
function verifySignature(body: string, signature: string | null): boolean {
  if (!signature) {
    console.error('❌ No signature provided');
    return false;
  }

  try {
    // Remove 'sha256=' prefix if present
    const cleanSignature = signature.replace('sha256=', '');
    
    // Create expected signature
    const expectedSignature = crypto
      .createHmac('sha256', INSTAGRAM_WEBHOOK_SECRET)
      .update(body, 'utf8')
      .digest('hex');

    // Compare signatures using crypto.timingSafeEqual to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(cleanSignature, 'hex')
    );

    console.log('🔐 Signature verification result:', isValid);
    return isValid;
  } catch (error) {
    console.error('💥 Signature verification error:', error);
    return false;
  }
}

// Process Instagram webhook events
async function processInstagramWebhook(webhookData: any) {
  console.log('🔄 Processing Instagram webhook data...');

  try {
    // Handle different event types
    if (webhookData.object === 'instagram') {
      for (const entry of webhookData.entry || []) {
        await processInstagramEntry(entry);
      }
    } else if (webhookData.object === 'page') {
      // Handle Facebook page events that might include Instagram
      for (const entry of webhookData.entry || []) {
        if (entry.messaging) {
          await processInstagramMessaging(entry.messaging);
        }
        if (entry.changes) {
          await processInstagramChanges(entry.changes);
        }
      }
    } else {
      console.log('ℹ️ Unknown webhook object type:', webhookData.object);
    }
  } catch (error) {
    console.error('💥 Error processing Instagram webhook:', error);
    throw error;
  }
}

// Process Instagram entry data
async function processInstagramEntry(entry: any) {
  console.log('📝 Processing Instagram entry:', entry.id);

  try {
    // Handle messaging events (comments, DMs, mentions)
    if (entry.messaging) {
      await processInstagramMessaging(entry.messaging);
    }

    // Handle changes (posts, stories, live videos)
    if (entry.changes) {
      await processInstagramChanges(entry.changes);
    }

    // Handle specific Instagram events
    if (entry.time) {
      console.log('⏰ Event timestamp:', new Date(entry.time * 1000).toISOString());
    }
  } catch (error) {
    console.error('💥 Error processing Instagram entry:', error);
    throw error;
  }
}

// Process Instagram messaging events
async function processInstagramMessaging(messaging: any[]) {
  console.log('💬 Processing Instagram messaging events:', messaging.length);

  for (const event of messaging) {
    try {
      const senderId = event.sender?.id;
      const recipientId = event.recipient?.id;
      const timestamp = event.timestamp;

      console.log('📨 Message event:', {
        sender: senderId,
        recipient: recipientId,
        timestamp: new Date(timestamp).toISOString()
      });

      // Handle different message types
      if (event.message) {
        await handleInstagramMessage(event);
      } else if (event.postback) {
        await handleInstagramPostback(event);
      } else if (event.reaction) {
        await handleInstagramReaction(event);
      } else {
        console.log('ℹ️ Unknown messaging event type:', Object.keys(event));
      }
    } catch (error) {
      console.error('💥 Error processing messaging event:', error);
    }
  }
}

// Process Instagram changes (posts, stories, etc.)
async function processInstagramChanges(changes: any[]) {
  console.log('🔄 Processing Instagram changes:', changes.length);

  for (const change of changes) {
    try {
      console.log('📊 Change event:', {
        field: change.field,
        value: change.value
      });

      // Handle different change types
      switch (change.field) {
        case 'comments':
          await handleInstagramComment(change.value);
          break;
        case 'mentions':
          await handleInstagramMention(change.value);
          break;
        case 'story_insights':
          await handleInstagramStoryInsights(change.value);
          break;
        case 'live_comments':
          await handleInstagramLiveComment(change.value);
          break;
        default:
          console.log('ℹ️ Unhandled change field:', change.field);
      }
    } catch (error) {
      console.error('💥 Error processing change event:', error);
    }
  }
}

// Handle Instagram direct messages
async function handleInstagramMessage(event: any) {
  console.log('💬 Processing Instagram message');

  try {
    const message = event.message;
    const senderId = event.sender.id;

    if (message.text) {
      console.log('📝 Text message:', message.text);
      // Process text message
      await processTextMessage(senderId, message.text, event);
    } else if (message.attachments) {
      console.log('📎 Message with attachments:', message.attachments.length);
      // Process media attachments
      await processMediaMessage(senderId, message.attachments, event);
    }
  } catch (error) {
    console.error('💥 Error handling Instagram message:', error);
  }
}

// Handle Instagram comments
async function handleInstagramComment(commentData: any) {
  console.log('💭 Processing Instagram comment');

  try {
    const commentId = commentData.id;
    const text = commentData.text;
    const parentId = commentData.parent_id;

    console.log('💭 Comment details:', {
      id: commentId,
      text: text,
      isReply: !!parentId
    });

    // Process the comment (auto-reply, moderation, etc.)
    await processComment(commentId, text, commentData);
  } catch (error) {
    console.error('💥 Error handling Instagram comment:', error);
  }
}

// Handle Instagram mentions
async function handleInstagramMention(mentionData: any) {
  console.log('🏷️ Processing Instagram mention');

  try {
    const mediaId = mentionData.media_id;
    const commentId = mentionData.comment_id;

    console.log('🏷️ Mention details:', {
      mediaId,
      commentId
    });

    // Process the mention
    await processMention(mediaId, commentId, mentionData);
  } catch (error) {
    console.error('💥 Error handling Instagram mention:', error);
  }
}

// Handle other event types
async function handleInstagramPostback(event: any) {
  console.log('🔙 Processing Instagram postback');
  // Implement postback handling
}

async function handleInstagramReaction(event: any) {
  console.log('😀 Processing Instagram reaction');
  // Implement reaction handling
}

async function handleInstagramStoryInsights(insightsData: any) {
  console.log('📊 Processing Instagram story insights');
  // Implement insights processing
}

async function handleInstagramLiveComment(commentData: any) {
  console.log('🔴 Processing Instagram live comment');
  // Implement live comment handling
}

// Business logic functions (implement based on your needs)
async function processTextMessage(senderId: string, text: string, event: any) {
  console.log(`📝 Processing text message from ${senderId}: ${text}`);
  
  // TODO: Implement your business logic here
  // Example: Auto-reply, save to database, trigger notifications, etc.
  
  // You could:
  // 1. Save the message to your database
  // 2. Trigger auto-replies based on keywords
  // 3. Send notifications to your team
  // 4. Integrate with your CRM system
}

async function processMediaMessage(senderId: string, attachments: any[], event: any) {
  console.log(`📎 Processing media message from ${senderId} with ${attachments.length} attachments`);
  
  // TODO: Implement media processing logic
  // You could:
  // 1. Download and store the media files
  // 2. Run image/video analysis
  // 3. Generate automatic responses
  // 4. Moderate content
}

async function processComment(commentId: string, text: string, commentData: any) {
  console.log(`💭 Processing comment ${commentId}: ${text}`);
  
  // TODO: Implement comment processing logic
  // You could:
  // 1. Auto-moderate comments
  // 2. Auto-reply to comments
  // 3. Save comments to analytics
  // 4. Flag inappropriate content
}

async function processMention(mediaId: string, commentId: string, mentionData: any) {
  console.log(`🏷️ Processing mention in media ${mediaId}, comment ${commentId}`);
  
  // TODO: Implement mention processing logic
  // You could:
  // 1. Respond to mentions
  // 2. Track brand mentions
  // 3. Engage with users who mention you
  // 4. Save mention data for analytics
} 