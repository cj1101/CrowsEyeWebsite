import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function GET(request: NextRequest) {
  const redirectUri = `${request.nextUrl.origin}/api/auth/instagram/redirect`;
  
  // Generate state for security
  const state = randomBytes(16).toString('hex');
  
  // Instagram OAuth requires Basic Display API for personal accounts
  // For Business accounts, you'd use Instagram Basic Display API or Instagram Graph API
  const SCOPES = process.env.INSTAGRAM_SCOPES ?? 'user_profile,user_media';
  
  const authUrl = new URL('https://api.instagram.com/oauth/authorize');
  authUrl.searchParams.set('client_id', process.env.INSTAGRAM_APP_ID!);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', SCOPES);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('state', state);

  console.log('🚀 Starting Instagram OAuth flow:', {
    client_id: process.env.INSTAGRAM_APP_ID,
    redirect_uri: redirectUri,
    scope: SCOPES,
    state
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