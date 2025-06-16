import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function GET(request: NextRequest) {
  // Validate required environment variables
  // For Instagram Graph API, we use the Facebook App ID, not Instagram App ID
  const appId = process.env.FACEBOOK_APP_ID || process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET || process.env.INSTAGRAM_APP_SECRET;
  
  if (!appId || !appSecret) {
    console.error('❌ Missing Instagram app credentials:', {
      hasAppId: !!appId,
      hasAppSecret: !!appSecret
    });
    return NextResponse.json(
      { error: 'Instagram app not configured' },
      { status: 500 }
    );
  }

  // Validate App ID format (should be numeric)
  if (!/^\d+$/.test(appId)) {
    console.error('❌ Invalid App ID format:', appId);
    return NextResponse.json(
      { error: 'Invalid App ID format' },
      { status: 500 }
    );
  }

  // Use production URL for redirect even in development to avoid Meta's localhost restrictions
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? (process.env.NEXT_PUBLIC_OAUTH_REDIRECT_BASE_URL || 'https://crows-eye-website.web.app')
    : request.nextUrl.origin;
  
  const redirectUri = `${baseUrl}/api/auth/instagram/redirect`;
  
  // Log the redirect URI for debugging
  console.log('🔄 Redirect URI:', redirectUri);
  console.log('🌐 Request origin:', request.nextUrl.origin);
  console.log('🏗️ Base URL used:', baseUrl);
  
  // Generate state for security
  const state = randomBytes(16).toString('hex');
  
  // Default to Instagram Graph API scopes; allow override via env
  const SCOPES = process.env.INSTAGRAM_SCOPES ?? 'instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights,pages_read_engagement';
  
  // Use Facebook OAuth dialog which works for both Facebook & Instagram Graph permissions
  const FB_OAUTH_VERSION = process.env.FB_OAUTH_VERSION ?? 'v18.0';
  const authUrl = new URL(`https://www.facebook.com/${FB_OAUTH_VERSION}/dialog/oauth`);
  authUrl.searchParams.set('client_id', appId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', SCOPES);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('state', state);

  console.log('🚀 Starting Instagram OAuth flow:', {
    client_id: appId,
    redirect_uri: redirectUri,
    scope: SCOPES,
    state
  });

  console.log('🔗 Final OAuth URL:', authUrl.toString());
  console.log('📋 Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    INSTAGRAM_APP_ID_length: process.env.INSTAGRAM_APP_ID?.length,
    INSTAGRAM_APP_SECRET_length: process.env.INSTAGRAM_APP_SECRET?.length,
    FB_OAUTH_VERSION: FB_OAUTH_VERSION
  });

  // Store state in cookie for verification
  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set('instagram_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600 // 10 minutes
  });

  return response;
} 