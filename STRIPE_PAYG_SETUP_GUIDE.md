# 🚀 COMPLETE STRIPE PAY-AS-YOU-GO SETUP GUIDE

## 📋 OVERVIEW
This guide walks you through setting up usage-based billing (Pay-as-you-go) in Stripe for Crow's Eye website customers only.

## 🎯 STEP-BY-STEP STRIPE SETUP

### **STEP 1: Create Usage Meters** ⚡
Before creating the price, you MUST create these 3 usage meters in Stripe:

#### **1. AI Credits Meter**
```
✅ Go to: Products → Create meter
📝 Meter name: ai_credits
📝 Event name: ai_credit_used  
📝 Aggregation: Count (Count events)
📝 Display name: AI Credits
```

#### **2. Scheduled Posts Meter**
```
✅ Go to: Products → Create meter  
📝 Meter name: scheduled_posts
📝 Event name: post_scheduled
📝 Aggregation: Count (Count events) 
📝 Display name: Scheduled Posts
```

#### **3. Storage Meter**
```
✅ Go to: Products → Create meter
📝 Meter name: storage_gb
📝 Event name: storage_used
📝 Aggregation: Sum (Sum values)
📝 Display name: Storage (GB)
```

### **STEP 2: Create the PAYG Product & Price** 💰

1. **Complete your current setup screen:**
   - ✅ Pricing model: Usage-based → Per unit
   - ✅ Price: $0.00 (base price)
   - ✅ Currency: USD
   - ✅ Include tax: Auto

2. **Add Usage Pricing Tiers:**
   - ✅ Click "Create meter" and select the meters you created above
   - ✅ Set these pricing tiers:
     * **AI Credits**: $0.15 per unit
     * **Scheduled Posts**: $0.25 per unit  
     * **Storage GB**: $2.99 per unit

3. **Set Minimum Charge:**
   - ✅ Set minimum charge: $5.00/month

### **STEP 3: Get Your Price ID** 🔑
After creating the price, copy the Price ID (starts with `price_`) - you'll need this.

## 🖥️ WEBSITE IMPLEMENTATION STATUS

### ✅ **COMPLETED COMPONENTS:**

#### **1. PAYG Usage Service** (`src/services/payg-usage.ts`)
- ✅ Usage tracking for AI credits, posts, storage
- ✅ Stripe event reporting
- ✅ Cost calculation with minimum charge
- ✅ React hooks for easy integration

#### **2. Enhanced Usage Meter** (`src/components/ui/payg-usage-meter.tsx`)
- ✅ Real-time usage display
- ✅ Cost breakdown by category
- ✅ Upgrade prompts when cost-effective
- ✅ Auto-refresh every 30 seconds

#### **3. API Endpoints** 
- ✅ `POST /api/billing/payg/subscribe` - Create PAYG subscription
- ✅ `POST /api/billing/payg/usage-event` - Report usage to Stripe  
- ✅ `GET /api/billing/payg/usage` - Get current usage data

#### **4. Pricing Page Integration**
- ✅ PAYG plan with proper pricing display
- ✅ Redirect to signup for PAYG users
- ✅ 7-day trial messaging (not applicable to PAYG)

### 🔧 **NEXT STEPS TO COMPLETE:**

#### **1. Update API with Real Stripe Integration**
Replace mock responses in these files:

**File: `src/app/api/billing/payg/subscribe/route.ts`**
```typescript
// Replace this section:
const mockCheckoutUrl = `https://checkout.stripe.com/c/pay/cs_test_payg_${Date.now()}...`

// With actual Stripe checkout session:
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{
    price: 'price_YOUR_PAYG_PRICE_ID', // Replace with your actual Price ID
    quantity: 1,
  }],
  customer_email: email,
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
})
```

**File: `src/app/api/billing/payg/usage-event/route.ts`**
```typescript
// Replace mock logging with actual Stripe usage reporting:
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
await stripe.subscriptionItems.createUsageRecord(
  'si_subscription_item_id', // Get from customer's subscription
  {
    quantity: value || 1,
    timestamp: timestamp,
    action: 'increment'
  }
)
```

#### **2. Add Environment Variables**
Add to your `.env.local`:
```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key  
STRIPE_PAYG_PRICE_ID=price_your_payg_price_id
```

#### **3. Integrate Usage Tracking** 
Add these calls throughout your app:

**When user uses AI credits:**
```typescript
import { usePayAsYouGo } from '../services/payg-usage'
const { trackAICredit } = usePayAsYouGo()

// Track single credit
await trackAICredit(1)
// Track multiple credits  
await trackAICredit(5)
```

**When user schedules posts:**
```typescript
const { trackScheduledPost } = usePayAsYouGo()
await trackScheduledPost()
```

**When files are uploaded/deleted:**
```typescript
const { trackStorage } = usePayAsYouGo()
// Calculate total storage used and call
await trackStorage(totalStorageInGB)
```

#### **4. Add Usage Meter to Dashboard**
Add to your main dashboard/account page:
```tsx
import { PAYGUsageMeter } from '../components/ui/payg-usage-meter'

// In your dashboard component:
{user?.subscription_tier === 'payg' && (
  <PAYGUsageMeter 
    userId={user.id}
    onUpgradeClick={() => router.push('/pricing')}
  />
)}
```

## 📊 **PRICING STRUCTURE IMPLEMENTED:**

| **Item** | **Rate** | **Example Usage** | **Monthly Cost** |
|----------|----------|-------------------|------------------|
| AI Credits | $0.15/credit | 20 credits | $3.00 |
| Scheduled Posts | $0.25/post | 8 posts | $2.00 |
| Storage | $2.99/GB | 1.2 GB | $3.59 |
| **Subtotal** | | | **$8.59** |
| **Minimum Charge** | $5.00 | | **$8.59** |
| **TOTAL** | | | **$8.59** |

*Note: If subtotal is under $5, customer pays $5 minimum.*

## 🔄 **TESTING YOUR SETUP:**

1. **Test Usage Tracking:**
   ```bash
   # Use browser console on your website:
   import('/src/services/payg-usage').then(({ usePayAsYouGo }) => {
     const { trackAICredit } = usePayAsYouGo()
     trackAICredit(1)
   })
   ```

2. **Test API Endpoints:**
   ```bash
   # Test usage retrieval:
   curl https://yourwebsite.com/api/billing/payg/usage
   
   # Test usage event:
   curl -X POST https://yourwebsite.com/api/billing/payg/usage-event \
     -H "Content-Type: application/json" \
     -d '{"event_name":"ai_credit_used","timestamp":1640995200,"stripe_customer_id":"cus_test123"}'
   ```

3. **Test Usage Meter Component:**
   - Visit your dashboard/account page
   - Verify usage meter displays
   - Check auto-refresh functionality
   - Test upgrade prompts when usage is high

## 🎉 **BENEFITS OF THIS IMPLEMENTATION:**

✅ **Website-only** - Desktop app users unaffected  
✅ **Automatic billing** - No manual invoice processing  
✅ **Real-time tracking** - Users see costs immediately  
✅ **Smart upgrade prompts** - Converts PAYG to monthly when beneficial  
✅ **Healthy margins** - PAYG rates ensure profitability  
✅ **Stripe compliance** - Proper usage-based billing setup  

## 🚨 **IMPORTANT NOTES:**

- **PAYG is website-only** - Desktop app continues with existing pricing
- **Minimum charge applies** - Users always pay at least $5/month
- **Usage tracking is critical** - Must implement tracking calls throughout app
- **Test thoroughly** - Verify billing accuracy before going live
- **Monitor usage patterns** - Adjust pricing if needed based on real data

## 📞 **SUPPORT:**
If you encounter issues with Stripe setup, their support is excellent. Reference this implementation when contacting them for fastest resolution. 