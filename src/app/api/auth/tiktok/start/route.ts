import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const TIKTOK_REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/tiktok/callback`;

export async function GET(request: NextRequest) {
  try {
    if (!TIKTOK_CLIENT_KEY) {
      return NextResponse.json(
        { error: 'TikTok OAuth not configured. App verification pending.' },
        { status: 503 }
      );
    }

    // TikTok OAuth scopes
    const scopes = [
      'user.info.basic',
      'video.publish',
      'video.upload'
    ].join(',');

    const state = crypto.randomUUID();
    
    // TikTok OAuth URL
    const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
    authUrl.searchParams.set('client_key', TIKTOK_CLIENT_KEY);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', TIKTOK_REDIRECT_URI);
    authUrl.searchParams.set('state', state);

    const response = NextResponse.redirect(authUrl.toString());

    // Set state cookie for verification
    response.cookies.set('tiktok_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('TikTok OAuth start error:', error);
    
    return new NextResponse(`
      <html>
        <body>
          <script>
            alert('TikTok connection failed. App verification is still pending.');
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
      status: 503
    });
  }
}

function cryptoRandomString(): string {
  return crypto.randomBytes(16).toString('hex');
} 