const functions = require('firebase-functions');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const crypto = require('crypto');

const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

exports.nextjsFunc = functions.https.onRequest(async (req, res) => {
  await app.prepare();
  const parsedUrl = parse(req.url, true);
  await handle(req, res, parsedUrl);
});

// Individual API endpoints
exports.marketingPosts = functions.https.onRequest(async (req, res) => {
  // Your marketing posts API logic here
  res.json({ message: 'Marketing posts API' });
});

exports.marketingStats = functions.https.onRequest(async (req, res) => {
  // Your marketing stats API logic here
  res.json({ message: 'Marketing stats API' });
});

exports.marketingMedia = functions.https.onRequest(async (req, res) => {
  // Your marketing media API logic here
  res.json({ message: 'Marketing media API' });
});

// Instagram webhook configuration
const INSTAGRAM_WEBHOOK_SECRET = functions.config().instagram?.webhook_secret || 'your-webhook-secret';
const INSTAGRAM_VERIFY_TOKEN = functions.config().instagram?.verify_token || 'your-verify-token';

// Instagram webhook endpoint
exports.instagramWebhook = functions.https.onRequest(async (req, res) => {
  console.log('📥 Instagram webhook request received:', req.method);
  
  if (req.method === 'GET') {
    // Webhook verification
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('🔍 Verification params:', { mode, token, challenge });

    if (mode === 'subscribe' && token === INSTAGRAM_VERIFY_TOKEN) {
      console.log('✅ Instagram webhook verified successfully');
      res.status(200).send(challenge);
    } else {
      console.error('❌ Instagram webhook verification failed');
      res.status(403).send('Forbidden');
    }
  } else if (req.method === 'POST') {
    // Webhook event processing
    try {
      const signature = req.get('x-hub-signature-256');
      const body = JSON.stringify(req.body);

      console.log('🔐 Verifying webhook signature...');
      
      if (!verifySignature(body, signature)) {
        console.error('❌ Instagram webhook signature verification failed');
        return res.status(401).send('Unauthorized');
      }

      console.log('📊 Instagram webhook data:', req.body);
      
      // Process the webhook event
      await processInstagramWebhook(req.body);

      console.log('✅ Instagram webhook processed successfully');
      res.status(200).send('OK');
    } catch (error) {
      console.error('💥 Instagram webhook processing error:', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
});

// Test webhook endpoint
exports.testWebhook = functions.https.onRequest(async (req, res) => {
  console.log('🧪 Test webhook endpoint called');
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    method: req.method,
    message: 'Test webhook endpoint is working!'
  });
});

// Helper functions
function verifySignature(body, signature) {
  if (!signature) {
    console.error('❌ No signature provided');
    return false;
  }

  try {
    const cleanSignature = signature.replace('sha256=', '');
    const expectedSignature = crypto
      .createHmac('sha256', INSTAGRAM_WEBHOOK_SECRET)
      .update(body, 'utf8')
      .digest('hex');

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

async function processInstagramWebhook(webhookData) {
  console.log('🔄 Processing Instagram webhook data...');
  
  try {
    if (webhookData.object === 'instagram') {
      for (const entry of webhookData.entry || []) {
        console.log('📝 Processing Instagram entry:', entry.id);
        
        // Handle messaging events
        if (entry.messaging) {
          for (const event of entry.messaging) {
            console.log('💬 Message event:', event);
            // Add your message processing logic here
          }
        }

        // Handle changes (comments, mentions, etc.)
        if (entry.changes) {
          for (const change of entry.changes) {
            console.log('🔄 Change event:', change.field, change.value);
            // Add your change processing logic here
          }
        }
      }
    }
  } catch (error) {
    console.error('💥 Error processing Instagram webhook:', error);
    throw error;
  }
}

// Instagram deauthorization callback
exports.instagramDeauthorize = functions.https.onRequest(async (req, res) => {
  console.log('🔓 Instagram deauthorization callback received');
  
  if (req.method === 'POST') {
    try {
      const signature = req.get('x-hub-signature-256');
      const body = JSON.stringify(req.body);

      console.log('🔐 Verifying deauthorization signature...');
      
      if (!verifySignature(body, signature)) {
        console.error('❌ Instagram deauthorization signature verification failed');
        return res.status(401).send('Unauthorized');
      }

      console.log('📊 Instagram deauthorization data:', req.body);
      
      // Process deauthorization
      const userId = req.body.user_id;
      console.log(`🔓 User ${userId} has deauthorized the app`);
      
      // Add your deauthorization logic here:
      // - Remove user tokens
      // - Cancel scheduled posts
      // - Clean up user data
      
      console.log('✅ Instagram deauthorization processed successfully');
      res.json({ 
        success: true, 
        message: 'Deauthorization processed',
        userId: userId 
      });
    } catch (error) {
      console.error('💥 Instagram deauthorization processing error:', error);
      res.status(500).send('Internal Server Error');
    }
  } else if (req.method === 'GET') {
    res.json({
      success: true,
      message: 'Instagram deauthorization callback endpoint is active',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(405).send('Method Not Allowed');
  }
});

// Instagram data deletion request
exports.instagramDataDeletion = functions.https.onRequest(async (req, res) => {
  console.log('🗑️ Instagram data deletion request received');
  
  if (req.method === 'POST') {
    try {
      const signature = req.get('x-hub-signature-256');
      const body = JSON.stringify(req.body);

      console.log('🔐 Verifying data deletion request signature...');
      
      if (!verifySignature(body, signature)) {
        console.error('❌ Instagram data deletion signature verification failed');
        return res.status(401).send('Unauthorized');
      }

      console.log('📊 Instagram data deletion request data:', req.body);
      
      // Process data deletion request
      const userId = req.body.user_id;
      const confirmationCode = crypto.randomBytes(16).toString('hex');
      
      console.log(`🗑️ Data deletion requested for user ${userId}, confirmation: ${confirmationCode}`);
      
      // Add your data deletion logic here:
      // - Mark user data for deletion
      // - Schedule actual deletion (you have 30 days)
      // - Remove user tokens
      // - Delete user posts and media
      
      console.log('✅ Instagram data deletion request processed successfully');
      
      // Return required response format for Instagram
      res.json({ 
        url: `https://${req.get('host')}/instagramDataDeletion?code=${confirmationCode}`,
        confirmation_code: confirmationCode
      });
    } catch (error) {
      console.error('💥 Instagram data deletion processing error:', error);
      res.status(500).send('Internal Server Error');
    }
  } else if (req.method === 'GET') {
    const confirmationCode = req.query.code;
    
    if (confirmationCode) {
      // Check deletion status
      console.log(`🔍 Checking deletion status for code: ${confirmationCode}`);
      
      res.json({
        success: true,
        confirmationCode,
        status: 'processing',
        message: 'Data deletion is in progress and will be completed within 30 days',
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: true,
        message: 'Instagram data deletion request endpoint is active',
        timestamp: new Date().toISOString(),
        usage: 'POST to submit deletion requests, GET with ?code=CONFIRMATION_CODE to check status'
      });
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}); 