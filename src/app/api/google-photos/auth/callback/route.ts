import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = request.cookies.get('google_photos_oauth_state')?.value;

  // Validate state to prevent CSRF attacks
  if (!state || !storedState || state !== storedState) {
    console.error('❌ OAuth state mismatch:', { received: state, stored: storedState });
    return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
  }

  if (!code) {
    console.error('❌ No authorization code received');
    return NextResponse.json({ error: 'No authorization code' }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Google Photos app not configured' }, { status: 500 });
  }

  const baseUrl = process.env.NODE_ENV === 'development' 
    ? (process.env.NEXT_PUBLIC_OAUTH_REDIRECT_BASE_URL || 'https://crows-eye-website.web.app')
    : request.nextUrl.origin;
  
  const redirectUri = `${baseUrl}/api/google-photos/auth/callback`;

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Get user info
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const userEmail = userResponse.data.email;

    console.log('✅ Google Photos OAuth successful for:', userEmail);

    // Store tokens (in a real app, you'd store these securely in a database)
    const response = NextResponse.redirect(`${baseUrl}/account?google-photos=connected`);
    
    response.cookies.set('google_photos_tokens', JSON.stringify({
      access_token,
      refresh_token,
      expires_at: Date.now() + (expires_in * 1000),
      user_email: userEmail
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expires_in
    });

    // Clear the state cookie
    response.cookies.delete('google_photos_oauth_state');

    return response;

  } catch (error: any) {
    console.error('❌ Google Photos OAuth error:', error.response?.data || error.message);
    return NextResponse.json({ 
      error: 'Failed to exchange code for tokens',
      details: error.response?.data || error.message 
    }, { status: 500 });
  }
} 