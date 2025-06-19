import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platforms = ['youtube', 'google-my-business'] } = body;

    // Google OAuth scopes for different services
    const scopes = [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.force-ssl',
      'https://www.googleapis.com/auth/business.manage', // For Google My Business
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    // In production, these would come from environment variables
    const clientId = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id';
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`;
    
    // Create OAuth URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scopes.join(' '));
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', JSON.stringify({ 
      platforms,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(7)
    }));

    return NextResponse.json({
      success: true,
      authUrl: authUrl.toString(),
      message: 'Google Platforms OAuth URL generated successfully'
    });

  } catch (error) {
    console.error('Google Platforms OAuth initiation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initiate Google Platforms OAuth',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Handle GET request for OAuth initiation (alternative method)
  const url = new URL(request.url);
  const platforms = url.searchParams.get('platforms')?.split(',') || ['youtube', 'google-my-business'];
  
  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ platforms }),
    headers: { 'Content-Type': 'application/json' }
  }));
} 