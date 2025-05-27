#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Stripe environment variables...\n');

const envPath = path.join(process.cwd(), '.env.local');

// Read current .env.local content
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Found existing .env.local file');
} else {
  console.log('❌ No .env.local file found');
  process.exit(1);
}

// Check if Stripe variables already exist
const hasStripeSecret = envContent.includes('STRIPE_SECRET_KEY=');
const hasStripePrices = envContent.includes('STRIPE_CREATOR_PRICE_ID=');

if (hasStripeSecret && hasStripePrices) {
  console.log('✅ Stripe environment variables already configured');
  process.exit(0);
}

console.log('🔧 Adding missing Stripe environment variables...\n');

// Add Stripe configuration section if not present
const stripeConfig = `
# Stripe Configuration
# Get these from your Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs - Create these in your Stripe Dashboard
# Creator Plan ($19/month, $13.30 with BYOK)
STRIPE_CREATOR_PRICE_ID=price_creator_monthly
STRIPE_CREATOR_BYOK_PRICE_ID=price_creator_byok_monthly

# Growth Plan ($49/month, $34.30 with BYOK)
STRIPE_GROWTH_PRICE_ID=price_growth_monthly
STRIPE_GROWTH_BYOK_PRICE_ID=price_growth_byok_monthly

# Pro Agency Plan ($89/month, $62.30 with BYOK)
STRIPE_PRO_PRICE_ID=price_pro_monthly
STRIPE_PRO_BYOK_PRICE_ID=price_pro_byok_monthly

# BYOK Discount Coupon (30% off)
STRIPE_BYOK_COUPON_ID=BYOK30
`;

// Fix the existing publishable key line if it's incorrectly formatted
envContent = envContent.replace(
  /NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_[a-zA-Z0-9]+\s*[a-zA-Z0-9]*/,
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here'
);

// Remove any incorrectly placed secrets
envContent = envContent.replace(
  /STRIPE_WEBHOOK_SECRET=sk_test_[a-zA-Z0-9]+\s*[a-zA-Z0-9]*/,
  ''
);

// Add Stripe configuration
envContent += stripeConfig;

try {
  // Backup existing file
  if (fs.existsSync(envPath)) {
    fs.copyFileSync(envPath, `${envPath}.backup`);
    console.log('📋 Backed up existing .env.local to .env.local.backup');
  }

  // Write updated content
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated .env.local with Stripe configuration\n');

  console.log('🚨 IMPORTANT: You need to set up actual Stripe products and prices!');
  console.log('\n📋 Next steps:');
  console.log('1. Go to your Stripe Dashboard (https://dashboard.stripe.com)');
  console.log('2. Create products for each tier (Creator, Growth, Pro Agency)');
  console.log('3. Create recurring prices for each product');
  console.log('4. Create BYOK versions with 30% discount');
  console.log('5. Update the price IDs in .env.local');
  console.log('6. Set up a webhook endpoint for subscription events');
  console.log('7. Update STRIPE_WEBHOOK_SECRET with the actual webhook secret');
  console.log('\n🔧 For now, the app will use placeholder price IDs that will need to be replaced.');

} catch (error) {
  console.error('❌ Error updating .env.local:', error.message);
  process.exit(1);
} 