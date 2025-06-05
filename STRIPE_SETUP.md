# Stripe Setup Guide

This guide walks you through setting up Stripe payment processing for the Crow's Eye website using **client-side payment links** (compatible with static hosting on Firebase).

## Overview

The implementation uses Stripe payment links instead of server-side checkout sessions, making it compatible with static site hosting like Firebase Hosting or Netlify.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Products and prices created in your Stripe Dashboard
3. Payment links created for your products

## Step 1: Create Products in Stripe Dashboard

1. Log into your Stripe Dashboard
2. Go to **Products** → **Add Product**
3. Create a product called "Pro Plan"
4. Add two prices:
   - Monthly: $49.00 USD (recurring monthly)
   - Yearly: $490.00 USD (recurring yearly)

## Step 2: Create Payment Links

1. In Stripe Dashboard, go to **Payment Links**
2. Click **Create payment link**
3. For the Pro Monthly plan:
   - Select your Pro Plan (Monthly price)
   - Configure success/cancel URLs:
     - Success URL: `https://yoursite.com/account?success=true`
     - Cancel URL: `https://yoursite.com/pricing`
   - Copy the payment link URL
4. Repeat for Pro Yearly plan

## Step 3: Environment Variables

Create a `.env.local` file in your project root with:

```env
# Stripe Publishable Key (starts with pk_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key_here

# Payment Links (from Step 2)
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_LINK=https://buy.stripe.com/your-monthly-link
NEXT_PUBLIC_STRIPE_PRO_YEARLY_LINK=https://buy.stripe.com/your-yearly-link
```

**Important Notes:**
- Use `pk_test_` keys for testing, `pk_live_` for production
- All variables start with `NEXT_PUBLIC_` since they're used client-side
- Never expose secret keys (starting with `sk_`) in client-side code

## Step 4: Testing

1. Set up test products and payment links in Stripe test mode
2. Use test card numbers:
   - Success: `4242 4242 4242 4242`
   - Declined: `4000 0000 0000 0002`
   - Requires 3D Secure: `4000 0025 0000 3155`

## Step 5: Going Live

1. Activate your Stripe account
2. Create live products and payment links
3. Update environment variables with live keys and links
4. Test with real payment methods

## How It Works

1. User clicks "Upgrade to Pro" button
2. `useStripeCheckout` hook validates payment link configuration
3. User is redirected to Stripe-hosted checkout page
4. After payment, user is redirected back to your success URL
5. Stripe handles all payment processing, PCI compliance, and security

## Advantages of Payment Links

- ✅ Works with static hosting (Firebase, Netlify, etc.)
- ✅ No server-side code required
- ✅ Stripe handles all security and PCI compliance
- ✅ Built-in mobile optimization
- ✅ Supports all Stripe payment methods
- ✅ Easy to set up and maintain

## Webhook Setup (Optional)

For subscription management, you can set up webhooks:

1. In Stripe Dashboard, go to **Webhooks**
2. Add endpoint: `https://yoursite.com/api/webhook` (if you add server-side handling later)
3. Select events: `customer.subscription.created`, `customer.subscription.updated`, etc.

## Troubleshooting

### "Payment link not configured" Error
- Verify your payment links are correctly set in `.env.local`
- Ensure environment variables start with `NEXT_PUBLIC_`
- Check that payment links are active in Stripe Dashboard

### Environment Variables Not Loading
- Restart your development server after adding `.env.local`
- Verify file is in project root, not in `src/` folder
- Check for typos in variable names

### Payment Link Not Working
- Verify the payment link is active in Stripe Dashboard
- Test with Stripe test mode first
- Check browser console for JavaScript errors

## Support

- Stripe Documentation: https://stripe.com/docs
- Payment Links Guide: https://stripe.com/docs/payment-links
- Stripe Support: https://support.stripe.com 