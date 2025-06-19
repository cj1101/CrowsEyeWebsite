import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function GET(request: NextRequest) {
  // Validate required environment variables
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.error('❌ Missing Google Photos app credentials:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret
    });
    return NextResponse.json(
      { error: 'Google Photos app not configured' },
      { status: 500 }
    );
  }

  // Use production URL for redirect even in development
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? (process.env.NEXT_PUBLIC_OAUTH_REDIRECT_BASE_URL || 'https://crows-eye-website.web.app')
    : request.nextUrl.origin;
  
  const redirectUri = `${baseUrl}/api/google-photos/auth/callback`;
  
  // Generate state for security
  const state = randomBytes(16).toString('hex');
  
  // Google Photos OAuth scopes
  const scopes = [
    'https://www.googleapis.com/auth/photoslibrary.readonly',
    'https://www.googleapis.com/auth/userinfo.email'
  ];
  
  // Build OAuth URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', scopes.join(' '));
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  console.log('🚀 Starting Google Photos OAuth flow:', {
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    state
  });

  // Store state in cookie for verification
  const response = NextResponse.json({ 
    authUrl: authUrl.toString(),
    state 
  });
  
  response.cookies.set('google_photos_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600 // 10 minutes
  });

  return response;
} 