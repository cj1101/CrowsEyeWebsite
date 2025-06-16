import { NextRequest, NextResponse } from 'next/server';
import { InstagramAPI } from '@/lib/instagram-api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  console.log('📱 Instagram OAuth callback received:', {
    code: code ? 'present' : 'missing',
    state,
    error,
    errorDescription
  });

  if (error) {
    console.error('❌ Instagram OAuth error:', { error, errorDescription });
    return NextResponse.redirect(`${request.nextUrl.origin}/auth/error?provider=instagram&error=${error}`);
  }

  if (!code) {
    console.error('❌ No authorization code received');
    return NextResponse.redirect(`${request.nextUrl.origin}/auth/error?provider=instagram&error=no_code`);
  }

  // Verify state parameter
  const storedState = request.cookies.get('instagram_oauth_state')?.value;
  if (!storedState || storedState !== state) {
    console.error('❌ Invalid state parameter');
    return NextResponse.redirect(`${request.nextUrl.origin}/auth/error?provider=instagram&error=invalid_state`);
  }

  try {
    // Use the same redirect URI logic as the start route
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? (process.env.NEXT_PUBLIC_OAUTH_REDIRECT_BASE_URL || 'https://crows-eye-website.web.app')
      : request.nextUrl.origin;
    const redirectUri = `${baseUrl}/api/auth/instagram/redirect`;
    
    // Determine where to redirect the user after successful auth
    const finalRedirectUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/marketing-tool?connected=instagram'
      : `${request.nextUrl.origin}/marketing-tool?connected=instagram`;
    
    const config = {
      clientId: process.env.FACEBOOK_APP_ID || process.env.INSTAGRAM_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET || process.env.INSTAGRAM_APP_SECRET!,
    };

    console.log('🔄 Exchanging Instagram authorization code for tokens...');
    const tokens = await InstagramAPI.exchangeCode(config, code, redirectUri);
    
    console.log('✅ Instagram token exchange successful');

    console.log('✅ Instagram token exchange successful, redirecting to:', finalRedirectUrl);
    
    // Set tokens in cookies
    const resp = NextResponse.redirect(finalRedirectUrl);
    
    resp.cookies.set('instagram_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in || 3600
    });

    if (tokens.refresh_token) {
      resp.cookies.set('instagram_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }

    // Clear state cookie
    resp.cookies.delete('instagram_oauth_state');

    return resp;
  } catch (e: any) {
    console.error('Instagram token exchange failed:', e?.response?.data || e?.message || e);
    console.error('Full error details:', {
      status: e?.response?.status,
      statusText: e?.response?.statusText,
      data: e?.response?.data,
      message: e?.message,
    });
    return NextResponse.redirect(`${request.nextUrl.origin}/auth/error?provider=instagram&error=token_exchange_failed`);
  }
} 