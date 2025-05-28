# Usage Tracking & Access Control Implementation

## Overview

This implementation provides comprehensive usage tracking and access control for the Crow's Eye Website, ensuring users are properly limited based on their subscription tiers and usage quotas.

## Features

### 🔒 Access Control
- **Tier-based feature gating**: Features are restricted based on subscription tiers
- **Usage-based limiting**: Features are blocked when usage limits are exceeded
- **Real-time enforcement**: Limits are checked before feature usage
- **Graceful degradation**: Clear UI feedback when features are unavailable

### 📊 Usage Tracking
- **Real-time monitoring**: Track feature usage as it happens
- **Billing period resets**: Usage resets automatically each billing cycle
- **Detailed logging**: Comprehensive activity logs for analytics
- **API integration**: External systems can track usage via API

### 🎯 Trackable Features
- `ai_credits` - AI content generation
- `ai_edits` - AI image editing
- `social_sets` - Connected social accounts
- `storage_gb` - Media storage usage
- `context_files` - Uploaded context files
- `api_calls` - General API usage
- `post_creation` - Social media posts
- `media_upload` - Media file uploads
- `analytics_view` - Analytics dashboard access
- `scheduling` - Post scheduling
- `video_processing` - Video processing features

## Implementation Components

### 1. Core Libraries

#### `src/lib/usage-tracking.ts`
Main usage tracking library with functions:
- `getUserUsage()` - Get current usage stats
- `trackFeatureUsage()` - Track and enforce usage
- `canUseFeature()` - Check if user can use a feature
- `getAllFeatureUsage()` - Get all feature usage data
- `checkAndResetUsage()` - Handle billing period resets
- `logUsageActivity()` - Log detailed activity

#### `src/lib/quotas.ts`
Quota definitions for each subscription tier:
```typescript
export const QUOTA_LIMITS = {
  spark: {
    socialSets: 1,
    aiCredits: 50,
    aiEdits: 5,
    storageGB: 1,
    contextFiles: 1,
    apiCalls: 1000
  },
  creator: {
    socialSets: 3,
    aiCredits: 300,
    aiEdits: 30,
    storageGB: 10,
    contextFiles: 3,
    apiCalls: 5000
  },
  // ... other tiers
}
```

### 2. React Components

#### `src/components/FeatureGate.tsx`
Access control component that wraps features:
```tsx
<FeatureGate feature="ai_edits" requiredTier="creator">
  <AIEditingComponent />
</FeatureGate>
```

Features:
- Automatic tier checking
- Usage limit enforcement
- Upgrade prompts
- Graceful fallbacks

#### `src/components/UsageIndicator.tsx`
Visual usage indicators:
- Progress bars showing usage percentage
- Color-coded warnings (green/yellow/red)
- Limit approaching notifications

### 3. React Hooks

#### `src/hooks/useUsageTracking.ts`
React hook for usage tracking:
```tsx
const { usage, trackUsage, checkFeature } = useUsageTracking();

// Track usage
await trackUsage('ai_credits', 1);

// Check before using
const canUse = await checkFeature('ai_edits');
```

### 4. API Routes

#### `POST /api/usage/track`
Track feature usage from external systems:
```json
{
  "userId": "user123",
  "feature": "api_calls",
  "amount": 1,
  "apiKey": "your-api-key"
}
```

#### `GET/POST /api/usage/check`
Check if user can use a feature:
```json
{
  "userId": "user123",
  "feature": "ai_credits",
  "amount": 1,
  "apiKey": "your-api-key"
}
```

## Usage Examples

### Frontend Component Usage

```tsx
import FeatureGate from '@/components/FeatureGate';
import { useUsageTracking } from '@/hooks/useUsageTracking';

function AIFeature() {
  const { trackUsage } = useUsageTracking();

  const handleAIGeneration = async () => {
    // Track usage before processing
    const result = await trackUsage('ai_credits', 1);
    if (!result.success) {
      alert(result.message);
      return;
    }
    
    // Proceed with AI generation
    generateContent();
  };

  return (
    <FeatureGate feature="ai_credits" requiredTier="spark">
      <button onClick={handleAIGeneration}>
        Generate AI Content
      </button>
    </FeatureGate>
  );
}
```

### Python Integration

```python
import requests

# Check if user can use feature
def can_use_feature(user_id, feature, amount=1):
    response = requests.post('https://your-domain.com/api/usage/check', json={
        'userId': user_id,
        'feature': feature,
        'amount': amount,
        'apiKey': 'your-api-key'
    })
    
    data = response.json()
    return data.get('canUse', False)

# Track feature usage
def track_usage(user_id, feature, amount=1):
    response = requests.post('https://your-domain.com/api/usage/track', json={
        'userId': user_id,
        'feature': feature,
        'amount': amount,
        'apiKey': 'your-api-key'
    })
    
    return response.json()

# Example usage
if can_use_feature('user123', 'api_calls'):
    # Process request
    result = process_user_request()
    
    # Track the usage
    track_usage('user123', 'api_calls', 1)
else:
    print("User has exceeded API call limit")
```

## Subscription Tier Limits

| Feature | Spark | Creator | Growth | Pro | Enterprise |
|---------|-------|---------|--------|-----|------------|
| Social Accounts | 1 | 3 | 6 | 15 | Unlimited |
| AI Credits/month | 50 | 300 | 600 | 1,000 | Unlimited |
| AI Edits/month | 5 | 30 | 60 | 120 | Unlimited |
| Storage | 1GB | 10GB | 50GB | 200GB | Custom |
| Context Files | 1 | 3 | 5 | 10 | Custom |
| API Calls/month | 1,000 | 5,000 | 15,000 | 50,000 | Unlimited |

## Database Schema

### Usage Collection (`usage`)
```typescript
{
  userId: string;
  aiCredits: number;
  aiEdits: number;
  socialSets: number;
  storageUsedGB: number;
  contextFiles: number;
  apiCalls: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  lastUpdated: Date;
}
```

### Usage Logs Collection (`usage_logs`)
```typescript
{
  userId: string;
  feature: string;
  action: string;
  metadata: Record<string, any>;
  timestamp: Date;
}
```

## Environment Variables

Add to your `.env.local`:
```bash
# Usage tracking API key for external systems
USAGE_TRACKING_API_KEY=your-secure-api-key-here
```

## Security Considerations

1. **API Key Protection**: Use secure API keys for external access
2. **Rate Limiting**: Implement rate limiting on usage tracking endpoints
3. **Input Validation**: All inputs are validated before processing
4. **Error Handling**: Graceful error handling prevents system abuse
5. **Audit Logging**: All usage is logged for security auditing

## Monitoring & Analytics

### Usage Dashboard
- Real-time usage statistics
- Visual progress indicators
- Billing period tracking
- Upgrade prompts

### Admin Analytics
- User usage patterns
- Feature adoption rates
- Limit breach notifications
- Revenue optimization insights

## Deployment Checklist

- [ ] Set up Firebase Firestore collections (`usage`, `usage_logs`)
- [ ] Configure environment variables
- [ ] Deploy API routes
- [ ] Test feature gating
- [ ] Verify usage tracking
- [ ] Set up monitoring alerts
- [ ] Document API for external systems

## Troubleshooting

### Common Issues

1. **Usage not tracking**: Check Firebase configuration and permissions
2. **Limits not enforcing**: Verify quota configuration in `quotas.ts`
3. **API calls failing**: Check API key configuration
4. **Reset not working**: Verify billing period calculation logic

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will provide detailed console logs for troubleshooting.

## Future Enhancements

- [ ] Usage analytics dashboard
- [ ] Automated usage alerts
- [ ] Custom quota overrides
- [ ] Usage-based billing
- [ ] Advanced reporting
- [ ] Multi-tenant support 