# Stripe Setup Guide

## Environment Variables Required

Add these to your `.env.local` file:

```
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_CREATOR_MONTHLY_PRICE_ID=price_...
STRIPE_CREATOR_YEARLY_PRICE_ID=price_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
```

## Stripe Dashboard Setup

### 1. Create Products and Prices

1. Go to your Stripe Dashboard → Products
2. Create the following products:

#### Creator Plan Product
- Name: "Crow's Eye Creator Plan"
- Description: "Perfect for individuals and content creators"
- Create 2 prices:
  - Monthly: $19/month (recurring)
  - Yearly: $190/year (recurring)

#### Pro Plan Product  
- Name: "Crow's Eye Pro Plan"
- Description: "For professionals, marketers, and small businesses"
- Create 2 prices:
  - Monthly: $49/month (recurring)
  - Yearly: $490/year (recurring)

### 2. Copy Price IDs

After creating each price, copy the price ID (starts with `price_`) and add to your environment variables.

### 3. Configure Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret (starts with `whsec_`)

## Testing

1. Use Stripe test keys during development
2. Test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
3. Use any future expiry date and any 3-digit CVC

## Production Deployment

1. Replace test keys with live keys
2. Update webhook endpoint to production URL
3. Test with real payment methods

## Features Implemented

- ✅ Subscription checkout
- ✅ Webhook handling for subscription events
- ✅ Error handling and loading states
- ✅ Support for monthly/yearly billing
- ✅ Customer portal (for subscription management)
- ✅ Plan upgrades/downgrades 