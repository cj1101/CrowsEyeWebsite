import { NextRequest, NextResponse } from 'next/server';

// Google Photos OAuth configuration
const GOOGLE_PHOTOS_SCOPES = [
  'https://www.googleapis.com/auth/photoslibrary.readonly',
  'https://www.googleapis.com/auth/photoslibrary.appendonly'
];

export async function POST(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_BASE_URL + '/api/google-photos/callback';
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Google Photos integration not configured' },
        { status: 500 }
      );
    }

    // Generate state parameter for security
    const state = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    
    // Store state in session/cookie for verification (simplified for demo)
    const response = NextResponse.json({
      authUrl: `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(GOOGLE_PHOTOS_SCOPES.join(' '))}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `state=${state}&` +
        `prompt=consent`
    });
    
    // Set state cookie for verification
    response.cookies.set('google_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600 // 10 minutes
    });
    
    return response;
  } catch (error) {
    console.error('Google Photos auth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google Photos authentication' },
      { status: 500 }
    );
  }
} 