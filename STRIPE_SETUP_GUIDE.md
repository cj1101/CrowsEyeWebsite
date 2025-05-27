# Stripe Setup Guide for Crow's Eye Website

## Current Issue
Your Stripe checkout is failing because the price IDs in your `.env.local` file are placeholder values, not actual Stripe price IDs from your dashboard.

## Step-by-Step Setup

### 1. Access Your Stripe Dashboard
1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Make sure you're in **LIVE mode** (not test mode) since you mentioned using live keys
3. Look for the toggle in the top-left that says "Viewing test data" - click it to switch to live mode

### 2. Create Products and Prices

You need to create 6 products total (3 plans × 2 variants each):

#### Creator Plan
1. Go to **Products** in the left sidebar
2. Click **+ Add product**
3. Fill in:
   - **Name**: `Creator Plan`
   - **Description**: `Solo-preneurs & freelancers - Up to 3 Social Accounts, 300 AI Credits/month`
   - **Pricing model**: `Standard pricing`
   - **Price**: `$19.00 USD`
   - **Billing period**: `Monthly`
4. Click **Save product**
5. Copy the **Price ID** (starts with `price_`) - this goes in `STRIPE_CREATOR_PRICE_ID`

6. Create BYOK variant:
   - Click **+ Add another price** on the same product
   - **Price**: `$13.30 USD` (30% discount)
   - **Billing period**: `Monthly`
   - **Description**: `Creator Plan with BYOK discount`
   - Copy this **Price ID** - this goes in `STRIPE_CREATOR_BYOK_PRICE_ID`

#### Growth Plan
1. Create new product: **Growth Plan**
2. **Description**: `Side-hustles & small teams - Up to 6 Social Accounts, 600 AI Credits/month`
3. **Price**: `$49.00 USD` monthly
4. Copy **Price ID** → `STRIPE_GROWTH_PRICE_ID`
5. Add BYOK price: `$34.30 USD` monthly
6. Copy **Price ID** → `STRIPE_GROWTH_BYOK_PRICE_ID`

#### Pro Agency Plan
1. Create new product: **Pro Agency Plan**
2. **Description**: `Agencies & SMB marketing teams - Up to 15 Social Accounts, 1000 AI Credits/month`
3. **Price**: `$89.00 USD` monthly
4. Copy **Price ID** → `STRIPE_PRO_PRICE_ID`
5. Add BYOK price: `$62.30 USD` monthly
6. Copy **Price ID** → `STRIPE_PRO_BYOK_PRICE_ID`

### 3. Set Up Webhooks
1. Go to **Developers** → **Webhooks** in your Stripe dashboard
2. Click **+ Add endpoint**
3. **Endpoint URL**: `https://your-domain.com/api/stripe/webhook`
4. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`) → `STRIPE_WEBHOOK_SECRET`

### 4. Update Your .env.local File

Replace the placeholder values in your `.env.local` file:

```env
# Keep your existing keys (these are correct)
STRIPE_SECRET_KEY=sk_live_your_actual_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_key

# Replace these with the actual price IDs from step 2
STRIPE_CREATOR_PRICE_ID=price_1234567890abcdef
STRIPE_CREATOR_BYOK_PRICE_ID=price_0987654321fedcba
STRIPE_GROWTH_PRICE_ID=price_abcdef1234567890
STRIPE_GROWTH_BYOK_PRICE_ID=price_fedcba0987654321
STRIPE_PRO_PRICE_ID=price_567890abcdef1234
STRIPE_PRO_BYOK_PRICE_ID=price_321fedcba0987654

# Replace with the webhook secret from step 3
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
```

### 5. Test the Configuration

1. Save your `.env.local` file
2. Restart your development server: `npm run dev`
3. Run the environment check: `node scripts/check-stripe-env.js`
4. Visit `/debug-stripe` to test the checkout flow
5. Try the Creator plan checkout on `/pricing`

### 6. Deploy to Production

Once everything works locally:

```bash
# Commit your changes (but NOT the .env.local file)
git add .
git commit -m "Fix Stripe checkout with proper price IDs"
git push origin main

# Deploy to Firebase
npm run build
firebase deploy
```

**Important**: Make sure your production environment has the same environment variables set. If you're using Firebase hosting, you may need to set these in your Firebase project settings or use Firebase Functions environment configuration.

## Troubleshooting

### If checkout still doesn't work:
1. Check browser console for errors
2. Check server logs for Stripe API errors
3. Verify you're in live mode in Stripe dashboard
4. Ensure webhook endpoint is accessible from the internet

### Common Issues:
- **"Invalid price ID"**: Double-check you copied the correct price IDs
- **"No such customer"**: Make sure webhook is properly configured
- **"Webhook signature verification failed"**: Check webhook secret is correct

### Testing:
- Use Stripe's test card numbers for testing: `4242 4242 4242 4242`
- Any future date for expiry, any 3-digit CVC
- Use any billing address

## Need Help?
- Check the `/debug-stripe` page for detailed error information
- Review Stripe dashboard logs under **Developers** → **Logs**
- Check browser console and server logs for detailed error messages 