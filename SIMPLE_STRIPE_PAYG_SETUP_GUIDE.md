# 🚀 SIMPLE STRIPE PAY-AS-YOU-GO SETUP GUIDE

## Overview: Clean & Simple Pricing

You now have a **simple, transparent pay-as-you-go pricing system**:

✅ **$0.15 per AI credit** - Simple flat rate  
✅ **$0.25 per scheduled post** - No complexity  
✅ **$2.99 per GB storage** - Clear storage pricing  
✅ **No minimum fees** - Start completely free!  
✅ **No credit card required** - True free start  

---

## 🎯 STEP 1: Update Your Meter IDs (You Already Have Meters!)

Since you already created the meters, just update the meter IDs in your code:

**📝 Update `src/lib/stripe.ts`:**

```typescript
export const USAGE_PRICING_CONFIG = {
  meters: {
    ai_credits: {
      stripe_meter_id: 'mtr_YOUR_AI_CREDITS_METER_ID', // ← Replace with your actual meter ID
      price_per_unit: 0.15,
      display_name: 'AI Credits',
      unit: 'credit'
    },
    scheduled_posts: {
      stripe_meter_id: 'mtr_YOUR_POSTS_METER_ID', // ← Replace with your actual meter ID
      price_per_unit: 0.25,
      display_name: 'Scheduled Posts',
      unit: 'post'
    },
    storage_gb: {
      stripe_meter_id: 'mtr_YOUR_STORAGE_METER_ID', // ← Replace with your actual meter ID
      price_per_unit: 2.99,
      display_name: 'Storage',
      unit: 'GB'
    }
  }
}
```

---

## 🎯 STEP 2: Create Simple Usage-Based Prices

For each meter, create a simple flat-rate price in Stripe:

### AI Credits Price
```bash
stripe prices create \
  --unit-amount=15 \
  --currency=usd \
  --billing-scheme=per_unit \
  --usage-type=metered \
  --recurring[usage_type]=metered \
  --recurring[interval]=month \
  --meter=mtr_YOUR_AI_CREDITS_METER_ID
```
**Copy this Price ID: `price_xxxxxxxxxx`**

### Scheduled Posts Price
```bash
stripe prices create \
  --unit-amount=25 \
  --currency=usd \
  --billing-scheme=per_unit \
  --usage-type=metered \
  --recurring[usage_type]=metered \
  --recurring[interval]=month \
  --meter=mtr_YOUR_POSTS_METER_ID
```
**Copy this Price ID: `price_yyyyyyyyyy`**

### Storage Price
```bash
stripe prices create \
  --unit-amount=299 \
  --currency=usd \
  --billing-scheme=per_unit \
  --usage-type=metered \
  --recurring[usage_type]=metered \
  --recurring[interval]=month \
  --meter=mtr_YOUR_STORAGE_METER_ID
```
**Copy this Price ID: `price_zzzzzzzzzz`**

---

## 🎯 STEP 3: Create the PAYG Product & Subscription

Create a product for your Pay-as-you-Go plan:

```bash
stripe products create \
  --name="Crow's Eye Pay-as-you-Go" \
  --description="Simple usage-based pricing - pay only for what you use"
```
**Copy this Product ID: `prod_xxxxxxxxxx`**

---

## 🎯 STEP 4: Update Environment Variables

Add these to your `.env.local`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY

# PAYG Price IDs (from Step 2)
STRIPE_AI_CREDITS_PRICE_ID=price_xxxxxxxxxx
STRIPE_POSTS_PRICE_ID=price_yyyyyyyyyy  
STRIPE_STORAGE_PRICE_ID=price_zzzzzzzzzz

# PAYG Product
STRIPE_PAYG_PRODUCT_ID=prod_xxxxxxxxxx
```

---

## 🎯 STEP 5: Create PAYG Subscription Flow

### Backend API Endpoint (`/api/billing/payg/subscribe`)

Create this endpoint to handle PAYG signups:

```typescript
// pages/api/billing/payg/subscribe.ts
import { stripe } from '@/lib/stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, userId } = req.body

  try {
    // Create customer
    const customer = await stripe.customers.create({
      email: email,
      metadata: {
        userId: userId,
        plan: 'payg'
      }
    })

    // Create subscription with the three usage-based prices
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        { price: process.env.STRIPE_AI_CREDITS_PRICE_ID },
        { price: process.env.STRIPE_POSTS_PRICE_ID },
        { price: process.env.STRIPE_STORAGE_PRICE_ID }
      ],
      metadata: {
        userId: userId,
        plan: 'payg'
      }
    })

    res.status(200).json({ 
      success: true,
      customerId: customer.id,
      subscriptionId: subscription.id,
      message: 'PAYG account created successfully! Start using the platform.'
    })
  } catch (error) {
    console.error('PAYG subscription error:', error)
    res.status(500).json({ error: 'Failed to create PAYG subscription' })
  }
}
```

---

## 🎯 STEP 6: Usage Reporting System

### Track Usage and Report to Stripe

When users perform actions, report usage to Stripe:

```typescript
// Track AI Credit Usage
const trackAICredit = async (customerId: string, amount: number = 1) => {
  await stripe.billing.meterEvents.create({
    event_name: 'ai_credit_used',
    payload: {
      stripe_customer_id: customerId,
      value: amount.toString()
    }
  })
}

// Track Scheduled Post
const trackScheduledPost = async (customerId: string) => {
  await stripe.billing.meterEvents.create({
    event_name: 'post_scheduled',
    payload: {
      stripe_customer_id: customerId,
      value: '1'
    }
  })
}

// Track Storage Usage
const trackStorageUsage = async (customerId: string, totalGB: number) => {
  await stripe.billing.meterEvents.create({
    event_name: 'storage_used',
    payload: {
      stripe_customer_id: customerId,
      value: totalGB.toString()
    }
  })
}
```

---

## 🎯 STEP 7: Frontend Integration

### Update Pricing Page Button

Update the PAYG button to handle the simple signup:

```typescript
const handlePAYGSignup = async () => {
  try {
    // For new users - just create account, no payment needed
    const response = await fetch('/api/billing/payg/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail, // Get from form or auth
        userId: userId    // Get from auth
      })
    })

    const data = await response.json()
    
    if (data.success) {
      // Redirect to success page or dashboard
      router.push('/success?plan=payg')
    }
  } catch (error) {
    console.error('PAYG signup error:', error)
  }
}
```

---

## 🎯 STEP 8: Testing Your Setup

### Test Meter Events

```bash
# Test AI Credits
curl -X POST https://api.stripe.com/v1/billing/meter_events \
  -u sk_test_YOUR_SECRET_KEY: \
  -d "event_name=ai_credit_used" \
  -d "payload[stripe_customer_id]=cus_test_customer" \
  -d "payload[value]=5"

# Test Posts
curl -X POST https://api.stripe.com/v1/billing/meter_events \
  -u sk_test_YOUR_SECRET_KEY: \
  -d "event_name=post_scheduled" \
  -d "payload[stripe_customer_id]=cus_test_customer" \
  -d "payload[value]=1"

# Test Storage
curl -X POST https://api.stripe.com/v1/billing/meter_events \
  -u sk_test_YOUR_SECRET_KEY: \
  -d "event_name=storage_used" \
  -d "payload[stripe_customer_id]=cus_test_customer" \
  -d "payload[value]=2.5"
```

### Verify in Stripe Dashboard

1. Go to **Billing → Meters** - Check events are being recorded
2. Go to **Customers** - Verify customers are created
3. Go to **Subscriptions** - Check subscriptions are active
4. Go to **Invoices** - Verify usage is being calculated

---

## 🎯 STEP 9: Customer Onboarding Flow

### Simple No-Card-Required Signup

```typescript
// Signup Flow
1. User clicks "Start Free - No Credit Card"
2. User creates account (email/password)
3. Backend creates Stripe customer + PAYG subscription
4. User immediately gets access to platform
5. Usage tracking starts automatically
6. First invoice generated at end of month (only if they used something)
```

---

## 📊 PRICING EXAMPLES

### Light User (10 credits, 3 posts, 1GB):
- **AI Credits**: 10 × $0.15 = $1.50
- **Posts**: 3 × $0.25 = $0.75  
- **Storage**: 1 × $2.99 = $2.99
- **Total**: $5.24/month

### Medium User (50 credits, 20 posts, 5GB):
- **AI Credits**: 50 × $0.15 = $7.50
- **Posts**: 20 × $0.25 = $5.00
- **Storage**: 5 × $2.99 = $14.95
- **Total**: $27.45/month

### Power User (200 credits, 100 posts, 20GB):
- **AI Credits**: 200 × $0.15 = $30.00
- **Posts**: 100 × $0.25 = $25.00
- **Storage**: 20 × $2.99 = $59.80
- **Total**: $114.80/month

---

## 🎉 BENEFITS FOR YOUR CUSTOMERS

✅ **True Free Start**: No credit card, no minimums  
✅ **Transparent Pricing**: Know exactly what you'll pay  
✅ **Scale Naturally**: Costs grow with your business  
✅ **Fair Usage**: Pay only for what you actually use  
✅ **No Surprises**: Simple math, predictable bills  

---

## 🔧 QUICK CHECKLIST

- [ ] Copy your meter IDs from Stripe dashboard
- [ ] Create the three usage-based prices
- [ ] Create PAYG product
- [ ] Update environment variables
- [ ] Create `/api/billing/payg/subscribe` endpoint
- [ ] Update frontend pricing page
- [ ] Test meter events
- [ ] Verify billing in Stripe dashboard
- [ ] Deploy to production! 🚀

This simple approach will make your customers love the transparency and fairness of your pricing! 

# Simple Stripe Pay-as-you-Go Setup Guide - $5 Minimum Billing Threshold

This guide walks you through setting up **simple usage-based pricing with a $5 minimum billing threshold** for your Crow's Eye platform.

## 📋 Overview

**Pricing Model:**
- **AI Credits:** $0.15 each
- **Scheduled Posts:** $0.25 each  
- **Storage:** $2.99 per GB per month
- **$5 Minimum Threshold:** Customers add their card but aren't charged until usage reaches $5
- **Card Required:** Prevents abuse while being customer-friendly

## 🎯 Customer Experience

1. Customer signs up for Pay-as-you-Go
2. **Card required** during signup (Stripe Setup Intent)
3. Uses the platform freely - no charges
4. Usage accumulates: $1, $2, $3, $4...
5. **First charge happens** when they hit exactly $5.00 in usage
6. From then on, they're billed for their actual usage each month

This model is perfect because:
- ✅ Prevents abuse (card required)
- ✅ Low barrier to entry (generous $5 threshold)
- ✅ Customer-friendly (substantial trial usage)
- ✅ Clear conversion point at $5

## 🛠️ Step-by-Step Setup

### Step 1: Create Billing Meters in Stripe

Go to your Stripe Dashboard → Billing → Meters and create these three meters:

#### 1. AI Credits Meter
```
Display Name: AI Credits
Event Name: ai_credits
Value Settings: Sum
Aggregation Window: Month
```

#### 2. Scheduled Posts Meter  
```
Display Name: Scheduled Posts
Event Name: scheduled_posts
Value Settings: Sum
Aggregation Window: Month
```

#### 3. Storage Meter
```
Display Name: Storage GB
Event Name: storage_gb
Value Settings: Most Recent
Aggregation Window: Month
```

**📝 Copy the meter IDs** - you'll need them for the next step.

### Step 2: Update Environment Variables

Update your `.env.local` file with the meter IDs:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here

# PAYG Billing Meters (replace with your actual meter IDs)
STRIPE_AI_CREDITS_METER_ID=mtr_1234567890
STRIPE_SCHEDULED_POSTS_METER_ID=mtr_0987654321  
STRIPE_STORAGE_METER_ID=mtr_1122334455
```

### Step 3: Update Stripe Configuration

Edit `src/lib/stripe.ts` and replace the placeholder meter IDs:

```typescript
export const USAGE_PRICING_CONFIG = {
  meters: {
    ai_credits: {
      stripe_meter_id: 'mtr_1234567890', // Your actual AI credits meter ID
      price_per_unit: 0.15,
      display_name: 'AI Credits',
      unit: 'credit'
    },
    scheduled_posts: {
      stripe_meter_id: 'mtr_0987654321', // Your actual posts meter ID  
      price_per_unit: 0.25,
      display_name: 'Scheduled Posts',
      unit: 'post'
    },
    storage_gb: {
      stripe_meter_id: 'mtr_1122334455', // Your actual storage meter ID
      price_per_unit: 2.99,
      display_name: 'Storage',
      unit: 'GB'
    }
  },
  minimum_billing_threshold: 5.00, // $5 minimum threshold
  // ... rest of config
}
```

### Step 4: Create API Endpoint for PAYG Subscription

Create `src/app/api/billing/payg/subscribe/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createPAYGSubscription } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { userEmail, userId } = await request.json()

    if (!userEmail || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    // Create setup session for card collection + customer creation
    const result = await createPAYGSubscription({
      customerEmail: userEmail,
      userId: userId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/success?plan=payg`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('PAYG subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to create PAYG subscription' }, 
      { status: 500 }
    )
  }
}
```

### Step 5: Create Usage Reporting Endpoint

Create `src/app/api/billing/payg/usage/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { reportUsageToStripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { customerId, meterType, value, userId } = await request.json()

    if (!customerId || !meterType || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    // Report usage to Stripe
    await reportUsageToStripe({
      customerId,
      meterType,
      value
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Usage reporting error:', error)
    return NextResponse.json(
      { error: 'Failed to report usage' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' }, 
        { status: 400 }
      )
    }

    // Return current month's usage for the user
    // This would query your database for usage data
    const usage = {
      ai_credits: 0,
      scheduled_posts: 0,
      storage_gb: 0,
      billing_period: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()
      }
    }

    return NextResponse.json(usage)
  } catch (error) {
    console.error('Usage retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to get usage' }, 
      { status: 500 }
    )
  }
}
```

### Step 6: Test the Implementation

1. **Test Card Setup:**
   ```bash
   # Navigate to PAYG signup
   http://localhost:3000/auth/signup?plan=payg
   ```

2. **Test Usage Calculation:**
   ```javascript
   // In browser console
   import { calculateUsageCost } from '@/lib/stripe'
   
   console.log(calculateUsageCost({
     ai_credits: 10,      // $1.50
     scheduled_posts: 5,  // $1.25  
     storage_gb: 1        // $2.99
   }))
   // Should show: total: $5.74, will_be_charged: true, billable_amount: $5.74
   ```

3. **Test with Light Usage (under $5):**
   ```javascript
   console.log(calculateUsageCost({
     ai_credits: 15,      // $2.25
     scheduled_posts: 3,  // $0.75
     storage_gb: 0.5      // $1.50
   }))
   // Should show: total: $4.50, will_be_charged: false, billable_amount: $0.00
   ```

## 💳 Usage Reporting Examples

When customers use features, report to Stripe:

```typescript
// AI Credit used
await reportUsageToStripe({
  customerId: 'cus_1234567890',
  meterType: 'ai_credits', 
  value: 1
})

// Post scheduled
await reportUsageToStripe({
  customerId: 'cus_1234567890',
  meterType: 'scheduled_posts',
  value: 1  
})

// Storage updated (replace total)
await reportUsageToStripe({
  customerId: 'cus_1234567890',
  meterType: 'storage_gb',
  value: 2.5 // Total GB used
})
```

## 🎯 Key Benefits of This Model

1. **Customer-Friendly:** $5 threshold removes friction
2. **Abuse Prevention:** Card required upfront
3. **Simple Billing:** Flat rates, easy to understand
4. **Clear Conversion:** $5 is a natural threshold
5. **Scalable:** Automatic billing via Stripe

## 🚀 Launch Checklist

- [ ] Created 3 billing meters in Stripe
- [ ] Updated meter IDs in environment variables  
- [ ] Created PAYG subscription API endpoint
- [ ] Created usage reporting API endpoint
- [ ] Tested card setup flow
- [ ] Tested usage calculation with threshold
- [ ] Verified $5 minimum threshold works correctly
- [ ] Confirmed billing only happens at/after $5

## 📊 Example Customer Journeys

**Light User:**
- Signs up, adds card
- Uses 10 AI credits ($1.50) + 5 posts ($1.25) = $2.75
- **Charged: $0** (under $5 threshold)

**Medium User:**  
- Signs up, adds card
- Uses 20 AI credits ($3.00) + 10 posts ($2.50) = $5.50  
- **Charged: $5.50** (reached and exceeded $5 threshold)

**Power User:**
- Signs up, adds card  
- Uses 50 AI credits ($7.50) + 20 posts ($5.00) + 2GB storage ($5.98) = $18.48
- **Charged: $18.48** (well above $5 threshold)

This model strikes the perfect balance between customer-friendliness and business protection! 🎉 