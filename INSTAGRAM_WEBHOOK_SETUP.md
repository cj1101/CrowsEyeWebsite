# Instagram Webhook Setup Guide

This guide will help you set up the Instagram webhook for your Crow's Eye Website to handle Instagram API events like comments, mentions, and direct messages.

## 🚀 Quick Start

### 1. Prerequisites

- Instagram Business Account
- Facebook Page connected to your Instagram account
- Meta Developer App with Instagram Basic Display and Instagram Graph API permissions
- Your website deployed with a public HTTPS URL

### 2. Environment Configuration

1. Copy `env.template` to `.env.local`:
   ```bash
   cp env.template .env.local
   ```

2. Fill in your Instagram/Facebook credentials in `.env.local`:
   ```bash
   # Instagram Webhook Configuration
   INSTAGRAM_WEBHOOK_SECRET=your-secure-webhook-secret-here
   INSTAGRAM_VERIFY_TOKEN=your-unique-verify-token-here
   
   # Instagram API Configuration
   INSTAGRAM_ACCESS_TOKEN=your-long-lived-access-token
   FACEBOOK_PAGE_ID=your-facebook-page-id
   INSTAGRAM_BUSINESS_ACCOUNT_ID=your-instagram-business-account-id
   ```

### 3. Webhook URL Setup

Your webhook URL will be: `https://yourdomain.com/api/webhooks/instagram`

## 📋 Detailed Setup Steps

### Step 1: Create a Meta Developer App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add the following products:
   - **Instagram Basic Display** (for basic Instagram access)
   - **Instagram Graph API** (for business features)
   - **Webhooks** (for real-time updates)

### Step 2: Get Required Credentials

#### A. Facebook Page Access Token
1. In your Meta app, go to **Tools & Support** → **Graph API Explorer**
2. Select your app and Facebook page
3. Generate a Page Access Token with these permissions:
   - `instagram_basic`
   - `instagram_manage_comments`
   - `instagram_manage_messages`
   - `pages_show_list`
   - `pages_read_engagement`

#### B. Instagram Business Account ID
1. Use the Graph API Explorer with your Page Access Token
2. Make a GET request to: `/{page-id}?fields=instagram_business_account`
3. Copy the Instagram Business Account ID from the response

#### C. Generate Long-Lived Access Token
```bash
curl -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-lived-token}"
```

### Step 3: Configure Webhook

1. In your Meta app, go to **Products** → **Webhooks**
2. Create a new webhook subscription with:
   - **Callback URL**: `https://yourdomain.com/api/webhooks/instagram`
   - **Verify Token**: (same as `INSTAGRAM_VERIFY_TOKEN` in your .env.local)
   - **Subscription Fields**: Select the events you want to receive:
     - `comments` (new comments on your posts)
     - `mentions` (when users mention you)
     - `messaging` (direct messages)
     - `live_comments` (comments on live videos)

### Step 4: Test Your Webhook

1. **Test webhook endpoint**:
   ```bash
   curl https://yourdomain.com/api/webhooks/test
   ```

2. **Verify Instagram webhook**:
   Meta will automatically verify your webhook when you save the configuration.

3. **Test with sample data**:
   ```bash
   curl -X POST https://yourdomain.com/api/webhooks/test \
     -H "Content-Type: application/json" \
     -d '{"test": "webhook data"}'
   ```

## 🔧 Configuration Options

### Webhook Events

The webhook handles these Instagram events:

| Event Type | Description | Use Cases |
|------------|-------------|-----------|
| `comments` | New comments on your posts | Auto-moderation, auto-replies, engagement tracking |
| `mentions` | Users mention your account | Brand monitoring, engagement, customer service |
| `messaging` | Direct messages | Customer support, automated responses |
| `live_comments` | Live video comments | Real-time engagement, moderation |

### Security Features

- **Signature Verification**: All webhook payloads are verified using HMAC-SHA256
- **Token Validation**: Webhook verification uses secure tokens
- **Error Handling**: Comprehensive error logging and graceful failures

## 💡 Usage Examples

### Auto-Reply to Comments

Edit the `processComment` function in `/src/app/api/webhooks/instagram/route.ts`:

```typescript
async function processComment(commentId: string, text: string, commentData: any) {
  // Auto-reply to comments containing specific keywords
  if (text.toLowerCase().includes('price') || text.toLowerCase().includes('cost')) {
    const instagramAPI = createInstagramAPI({
      accessToken: process.env.INSTAGRAM_ACCESS_TOKEN!,
      pageId: process.env.FACEBOOK_PAGE_ID,
      instagramBusinessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
    });
    
    await instagramAPI.replyToComment(
      commentId, 
      "Thanks for your interest! Please check our website or DM us for pricing details. 😊"
    );
  }
}
```

### Auto-Moderate Comments

```typescript
async function processComment(commentId: string, text: string, commentData: any) {
  const bannedWords = ['spam', 'fake', 'scam'];
  
  if (bannedWords.some(word => text.toLowerCase().includes(word))) {
    const instagramAPI = createInstagramAPI({
      accessToken: process.env.INSTAGRAM_ACCESS_TOKEN!,
      pageId: process.env.FACEBOOK_PAGE_ID,
      instagramBusinessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
    });
    
    // Hide the comment
    await instagramAPI.moderateComment(commentId, true);
    console.log(`Hidden comment ${commentId} for inappropriate content`);
  }
}
```

### Send Auto-Reply to DMs

```typescript
async function processTextMessage(senderId: string, text: string, event: any) {
  if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi')) {
    const instagramAPI = createInstagramAPI({
      accessToken: process.env.INSTAGRAM_ACCESS_TOKEN!,
      pageId: process.env.FACEBOOK_PAGE_ID,
      instagramBusinessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
    });
    
    await instagramAPI.sendDirectMessage(
      senderId,
      "Hello! Thanks for reaching out. How can we help you today? 🌟"
    );
  }
}
```

## 🔍 Debugging & Monitoring

### Check Webhook Status

Visit: `https://yourdomain.com/api/webhooks/test`

### View Webhook Logs

Check your application logs for webhook events:
- Look for emojis: 📥 📨 💬 💭 🏷️
- All webhook events are logged with detailed information

### Common Issues

1. **Webhook Verification Failed**:
   - Check that `INSTAGRAM_VERIFY_TOKEN` matches what you set in Meta Developer Console
   - Ensure your webhook URL is publicly accessible via HTTPS

2. **Signature Verification Failed**:
   - Verify `INSTAGRAM_WEBHOOK_SECRET` is correct
   - Check that the secret matches in both Meta Console and your environment

3. **Access Token Issues**:
   - Ensure your access token has the required permissions
   - Use a long-lived token (60+ days expiry)
   - Check token is not expired

## 🔒 Security Best Practices

1. **Keep Secrets Secure**: Never commit `.env.local` to version control
2. **Use Strong Secrets**: Generate cryptographically strong webhook secrets
3. **Verify All Requests**: Always verify webhook signatures before processing
4. **Rate Limiting**: Implement rate limiting for webhook endpoints
5. **Logging**: Log all webhook events for debugging and monitoring
6. **HTTPS Only**: Only use HTTPS URLs for webhooks

## 📚 API Reference

### Instagram API Class

```typescript
import { createInstagramAPI } from '@/lib/instagram-api';

const api = createInstagramAPI({
  accessToken: 'your-access-token',
  pageId: 'your-facebook-page-id',
  instagramBusinessAccountId: 'your-ig-business-account-id'
});

// Send DM
await api.sendDirectMessage(userId, 'Hello!');

// Reply to comment
await api.replyToComment(commentId, 'Thanks for your comment!');

// Get user media
const { media } = await api.getUserMedia();

// Moderate comment
await api.moderateComment(commentId, true); // hide comment
```

### Webhook Event Structure

```typescript
interface InstagramWebhookEvent {
  object: 'instagram' | 'page';
  entry: Array<{
    id: string;
    time: number;
    messaging?: Array<MessageEvent>;
    changes?: Array<ChangeEvent>;
  }>;
}
```

## 🆘 Support

If you need help with the Instagram webhook setup:

1. Check the [Meta for Developers Documentation](https://developers.facebook.com/docs/instagram-api/)
2. Review the webhook logs in your application
3. Test with the `/api/webhooks/test` endpoint
4. Verify your Meta app configuration and permissions

## 🔄 Next Steps

After setting up the webhook, you can:

1. **Customize Event Handlers**: Modify the processing functions to match your business needs
2. **Add Database Storage**: Store webhook events in your database for analytics
3. **Integrate with CRM**: Connect webhook events to your customer management system
4. **Add Notifications**: Set up alerts for important events (mentions, negative comments)
5. **Build Analytics**: Track engagement metrics from webhook data 