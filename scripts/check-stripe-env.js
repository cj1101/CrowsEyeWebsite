#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Stripe Environment Variables...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

console.log(`📁 .env.local file: ${envExists ? '✅ Found' : '❌ Missing'}`);

if (!envExists) {
  console.log('\n❌ .env.local file is missing!');
  console.log('📝 Please create a .env.local file with your Stripe configuration.');
  console.log('\n📋 Required environment variables:');
  console.log('   STRIPE_SECRET_KEY=sk_live_...');
  console.log('   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...');
  console.log('   STRIPE_CREATOR_PRICE_ID=price_...');
  console.log('   STRIPE_CREATOR_BYOK_PRICE_ID=price_...');
  console.log('   STRIPE_GROWTH_PRICE_ID=price_...');
  console.log('   STRIPE_GROWTH_BYOK_PRICE_ID=price_...');
  console.log('   STRIPE_PRO_PRICE_ID=price_...');
  console.log('   STRIPE_PRO_BYOK_PRICE_ID=price_...');
  console.log('   STRIPE_WEBHOOK_SECRET=whsec_...');
  process.exit(1);
}

// Read and parse .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key] = valueParts.join('=');
    }
  }
});

// Required Stripe environment variables
const requiredVars = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_CREATOR_PRICE_ID',
  'STRIPE_CREATOR_BYOK_PRICE_ID',
  'STRIPE_GROWTH_PRICE_ID',
  'STRIPE_GROWTH_BYOK_PRICE_ID',
  'STRIPE_PRO_PRICE_ID',
  'STRIPE_PRO_BYOK_PRICE_ID',
  'STRIPE_WEBHOOK_SECRET'
];

console.log('\n🔑 Environment Variables Check:');

let allValid = true;
const issues = [];

requiredVars.forEach(varName => {
  const value = envVars[varName];
  const isSet = value && value.trim() !== '';
  const isPlaceholder = value && (
    value.includes('your_') || 
    value.includes('_here') || 
    value === 'sk_test_your_stripe_secret_key_here' ||
    value === 'pk_test_your_stripe_publishable_key_here' ||
    value.startsWith('price_') && value.includes('_monthly')
  );
  
  if (!isSet) {
    console.log(`   ${varName}: ❌ Missing`);
    issues.push(`${varName} is not set`);
    allValid = false;
  } else if (isPlaceholder) {
    console.log(`   ${varName}: ⚠️  Placeholder value`);
    issues.push(`${varName} has placeholder value: ${value}`);
    allValid = false;
  } else {
    // Validate format
    let formatValid = true;
    if (varName === 'STRIPE_SECRET_KEY' && !value.startsWith('sk_')) {
      formatValid = false;
      issues.push(`${varName} should start with 'sk_'`);
    } else if (varName === 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY' && !value.startsWith('pk_')) {
      formatValid = false;
      issues.push(`${varName} should start with 'pk_'`);
    } else if (varName.includes('PRICE_ID') && !value.startsWith('price_')) {
      formatValid = false;
      issues.push(`${varName} should start with 'price_'`);
    } else if (varName === 'STRIPE_WEBHOOK_SECRET' && !value.startsWith('whsec_')) {
      formatValid = false;
      issues.push(`${varName} should start with 'whsec_'`);
    }
    
    if (formatValid) {
      console.log(`   ${varName}: ✅ Valid`);
    } else {
      console.log(`   ${varName}: ❌ Invalid format`);
      allValid = false;
    }
  }
});

console.log('\n📊 Summary:');
if (allValid) {
  console.log('✅ All Stripe environment variables are properly configured!');
  console.log('🚀 You should be able to process payments now.');
} else {
  console.log('❌ Issues found with Stripe configuration:');
  issues.forEach(issue => {
    console.log(`   • ${issue}`);
  });
  console.log('\n🔧 To fix these issues:');
  console.log('   1. Go to your Stripe Dashboard (https://dashboard.stripe.com)');
  console.log('   2. Create products and prices for each plan');
  console.log('   3. Copy the price IDs and update your .env.local file');
  console.log('   4. Make sure you\'re using LIVE keys for production');
  console.log('   5. Set up webhook endpoints and copy the webhook secret');
}

console.log('\n💡 Need help? Check the Stripe documentation or the debug page at /debug-stripe'); 