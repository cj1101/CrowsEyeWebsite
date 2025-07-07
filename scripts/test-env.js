const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Attempt to load .env.local first for local development
const localEnvPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
} else {
  console.warn('[Env Test] No .env.local found, falling back to process.env only.');
}

// Fallback: also load generic .env if present (will not override variables already set)
const genericEnvPath = path.join(process.cwd(), '.env');
if (fs.existsSync(genericEnvPath)) {
  dotenv.config({ path: genericEnvPath });
}

// List of environment variables that should always be present.
// Keep this in sync with env.template so that new variables are automatically checked.
const REQUIRED_VARS = [
  // Firebase
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',

  // Instagram Webhook
  'INSTAGRAM_WEBHOOK_SECRET',
  'INSTAGRAM_VERIFY_TOKEN',

  // Instagram / Meta Graph API
  'INSTAGRAM_ACCESS_TOKEN',
  'FACEBOOK_PAGE_ID',
  'INSTAGRAM_BUSINESS_ACCOUNT_ID',

  // TikTok
  'TIKTOK_CLIENT_KEY',
  'TIKTOK_CLIENT_SECRET',
  'TIKTOK_REDIRECT_URI',
  'TIKTOK_SCOPES',

  // Meta App
  'FACEBOOK_APP_ID',
  'FACEBOOK_APP_SECRET',

  // Legacy Instagram Basic Display API (still used in some flows)
  'INSTAGRAM_APP_ID',
  'INSTAGRAM_APP_SECRET',
  'INSTAGRAM_SCOPES',
  'FB_OAUTH_VERSION',

  // OAuth redirect base
  'NEXT_PUBLIC_OAUTH_REDIRECT_BASE_URL',

  // Google
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_PHOTOS_SCOPES',

  // Crow\'s Eye backend
  'NEXT_PUBLIC_CROWS_EYE_API_URL',

  // Optional keys – these can be blank but it\'s useful to warn if missing
  'OPENAI_API_KEY',
  'STRIPE_SECRET_KEY'
];

const missingVars = REQUIRED_VARS.filter(key => {
  const value = process.env[key];
  return value === undefined || value === '';
});

if (missingVars.length) {
  console.error(`\n❌ Environment validation failed. Missing ${missingVars.length} variables:`);
  missingVars.forEach(key => console.error(`  - ${key}`));
  console.error('\nPlease add the missing variables to your .env.local or environment settings and try again.');
  process.exit(1);
}

console.log(`✅ All ${REQUIRED_VARS.length} environment variables are defined!`); 