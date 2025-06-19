# 🚀 STRIPE USAGE-BASED PRICING SETUP GUIDE

## Overview: Revolutionary Tiered Pricing with Volume Discounts

You now have a **complete usage-based pricing system** that includes:

✅ **One simple meter** - No multiple price complexity  
✅ **Tiered discounts** - Customers save money with higher usage  
✅ **$5 minimum built-in** - Via the flat fee on tier 1  
✅ **Automatic volume discounts** - Encourages more usage  
✅ **Cleaner billing** - One line item per customer  

---

## 🎯 STEP 1: Create Stripe Meters

In your Stripe Dashboard, create these three usage meters:

### AI Credits Meter
```bash
stripe billing meters create \
  --display-name="AI Credits" \
  --event-name="ai_credit_used" \
  --value-settings[event_payload_key]="value"
```

### Scheduled Posts Meter  
```bash
stripe billing meters create \
  --display-name="Scheduled Posts" \
  --event-name="post_scheduled" \
  --value-settings[event_payload_key]="value"
```

### Storage Meter
```bash
stripe billing meters create \
  --display-name="Storage Usage" \
  --event-name="storage_used" \
  --value-settings[event_payload_key]="value"
```

**📝 Copy the meter IDs and update `src/lib/stripe.ts`:**

```typescript
export const USAGE_PRICING_CONFIG = {
  meters: {
    ai_credits: {
      stripe_meter_id: 'mtr_XXXXXXXXXX', // ← Your AI Credits meter ID
      // ... existing tiers
    },
    scheduled_posts: {
      stripe_meter_id: 'mtr_YYYYYYYYYY', // ← Your Posts meter ID  
      // ... existing tiers
    },
    storage_gb: {
      stripe_meter_id: 'mtr_ZZZZZZZZZZ', // ← Your Storage meter ID
      // ... existing tiers
    }
  }
}
```

---

## 🎯 STEP 2: Create Base Subscription Product

Create a $5/month base subscription that all PAYG customers get:

```bash
stripe products create \
  --name="Crow's Eye Pay-as-you-Go Base" \
  --description="$5 minimum monthly charge with usage-based pricing"

stripe prices create \
  --unit-amount=500 \
  --currency=usd \
  --recurring[interval]=month \
  --product=prod_XXXXXXXXXX
```

**📝 Update the base subscription price ID:**

```typescript
base_subscription: {
  stripe_price_id: 'price_XXXXXXXXXX', // ← Your base price ID
  monthly_fee: 5.00,
  description: 'Pay-as-you-Go Base Plan - $5/month minimum'
}
```

---

## 🎯 STEP 3: Create Tiered Usage Pricing

Create pricing tables for each usage type with graduated tiers:

### AI Credits Pricing Table
```bash
# Create the pricing table
stripe pricing_tables create \
  --display_name="AI Credits Usage Pricing" \
  --billing_cycle_anchor="month_start"

# Add the tiered pricing
stripe pricing_table_prices create \
  --pricing_table=pt_XXXXXXXXXX \
  --unit_amount_tiers='[
    {"up_to": 50, "unit_amount": 20},
    {"up_to": 200, "unit_amount": 15}, 
    {"up_to": 500, "unit_amount": 12},
    {"up_to": "inf", "unit_amount": 10}
  ]' \
  --billing_scheme=tiered \
  --usage_type=metered \
  --meter=mtr_XXXXXXXXXX
```

### Scheduled Posts Pricing Table
```bash
stripe pricing_table_prices create \
  --pricing_table=pt_YYYYYYYYYY \
  --unit_amount_tiers='[
    {"up_to": 20, "unit_amount": 35},
    {"up_to": 100, "unit_amount": 25},
    {"up_to": 300, "unit_amount": 20}, 
    {"up_to": "inf", "unit_amount": 15}
  ]' \
  --billing_scheme=tiered \
  --usage_type=metered \
  --meter=mtr_YYYYYYYYYY
```

### Storage Pricing Table  
```bash
stripe pricing_table_prices create \
  --pricing_table=pt_ZZZZZZZZZZ \
  --unit_amount_tiers='[
    {"up_to": 5, "unit_amount": 399},
    {"up_to": 20, "unit_amount": 299},
    {"up_to": 50, "unit_amount": 249},
    {"up_to": "inf", "unit_amount": 199}
  ]' \
  --billing_scheme=tiered \
  --usage_type=metered \
  --meter=mtr_ZZZZZZZZZZ
```

---

## 🎯 STEP 4: Update Environment Variables

Add these to your `.env.local`:

```bash
# Stripe Usage Pricing Configuration
STRIPE_AI_CREDITS_METER_ID=mtr_XXXXXXXXXX
STRIPE_POSTS_METER_ID=mtr_YYYYYYYYYY  
STRIPE_STORAGE_METER_ID=mtr_ZZZZZZZZZZ
STRIPE_PAYG_BASE_PRICE_ID=price_XXXXXXXXXX

# Volume Discount Configuration (if using Stripe promotions)
STRIPE_VOLUME_5_PERCENT_PROMO=promo_XXXXXXXXXX
STRIPE_VOLUME_10_PERCENT_PROMO=promo_YYYYYYYYYY
STRIPE_VOLUME_15_PERCENT_PROMO=promo_ZZZZZZZZZZ
```

---

## 🎯 STEP 5: Test the Implementation

### Frontend Testing:

1. **Visit Pricing Page**: Verify tiered pricing details show correctly
2. **Test Usage Estimator**: Input different usage amounts and verify calculations
3. **Volume Discount Display**: Confirm discounts show at correct thresholds

### Backend Testing:

```bash
# Test usage reporting
curl -X POST http://localhost:3000/api/v1/billing/payg/usage-event \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "ai_credit_used",
    "stripe_customer_id": "cus_XXXXXXXXXX",
    "value": "5",
    "timestamp": '$(date +%s)'
  }'
```

### Stripe Dashboard Testing:

1. **Check Meters**: Verify events are being recorded
2. **Monitor Subscriptions**: Confirm base subscriptions are created  
3. **Review Invoices**: Verify tiered pricing calculations

---

## 🎯 STEP 6: Production Deployment

### Update Production Environment:
```bash
# Set production Stripe keys
export STRIPE_SECRET_KEY=sk_live_XXXXXXXXXX
export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXX

# Update meter IDs with production values
export STRIPE_AI_CREDITS_METER_ID=mtr_live_XXXXXXXXXX
export STRIPE_POSTS_METER_ID=mtr_live_YYYYYYYYYY
export STRIPE_STORAGE_METER_ID=mtr_live_ZZZZZZZZZZ
```

### Deploy Changes:
```bash
npm run build
npm start
```

---

## 📊 PRICING BREAKDOWN EXAMPLES

### Light User (20 credits, 5 posts, 2GB):
- **AI Credits**: 20 × $0.20 = $4.00
- **Posts**: 5 × $0.35 = $1.75  
- **Storage**: 2 × $3.99 = $7.98
- **Subtotal**: $13.73
- **Base Fee**: $5.00
- **Total**: $18.73 (subtotal above minimum)

### Medium User (150 credits, 80 posts, 12GB):
- **AI Credits**: (50 × $0.20) + (100 × $0.15) = $25.00
- **Posts**: (20 × $0.35) + (60 × $0.25) = $22.00
- **Storage**: (5 × $3.99) + (7 × $2.99) = $40.88
- **Subtotal**: $87.88
- **Volume Discount**: 10% off = -$8.79
- **Total**: $79.09 + $5 base = $84.09

### Heavy User (600 credits, 250 posts, 30GB):
- **AI Credits**: (50×$0.20) + (150×$0.15) + (300×$0.12) + (100×$0.10) = $78.50
- **Posts**: (20×$0.35) + (80×$0.25) + (150×$0.20) = $57.00
- **Storage**: (5×$3.99) + (15×$2.99) + (10×$2.49) = $89.25
- **Subtotal**: $224.75
- **Volume Discount**: 15% off = -$33.71
- **Total**: $191.04 + $5 base = $196.04

---

## 🎉 BENEFITS FOR YOUR CUSTOMERS

✅ **Transparent Pricing**: No surprises, clear tier breakdown  
✅ **Volume Savings**: Heavy users get better rates automatically  
✅ **Fair for Light Users**: $5 minimum protects occasional users  
✅ **Scalable**: Grows with their business  
✅ **Simple Billing**: One line item, easy to understand  

---

## 🔧 NEXT STEPS

1. **Create Stripe meters** and copy IDs
2. **Set up base subscription** product  
3. **Configure tiered pricing** tables
4. **Update environment** variables
5. **Test thoroughly** in development
6. **Deploy to production** 🚀

Your customers will love the transparent, fair pricing that rewards usage while keeping costs predictable! 