import { NextRequest, NextResponse } from 'next/server';
import { TikTokAPI, TikTokConfig, TikTokTokens } from '@/lib/tiktok-api';

export const dynamic = 'force-dynamic';

// Pull secrets from env
const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY ?? '';
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET ?? '';
const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI ?? '';

const config: TikTokConfig = {
  clientKey: CLIENT_KEY,
  clientSecret: CLIENT_SECRET,
};

// GET /api/auth/tiktok/redirect?code=XXX&state=YYY
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    console.error('TikTok OAuth error:', error);
    return NextResponse.redirect(`${request.nextUrl.origin}/auth/error?provider=tiktok&error=${error}`);
  }

  if (!code) {
    return NextResponse.json({ success: false, error: 'Missing code' }, { status: 400 });
  }

  try {
    const verifierCookie = request.cookies.get('tiktok_pkce');
    // Exchange code for tokens
    const tokens: TikTokTokens = await TikTokAPI.exchangeCode(config, code, REDIRECT_URI, verifierCookie?.value);

    // TODO: associate tokens with the logged-in user in your DB
    // For demo purposes we store them in a HTTP-only cookie that expires with the access_token
    const cookieValue = JSON.stringify(tokens);
    const maxAge = tokens.expiresIn;

    const resp = NextResponse.redirect(`${request.nextUrl.origin}/marketing-tool?connected=tiktok`);
    resp.cookies.set('tiktok_tokens', cookieValue, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    // Clear pkce cookie
    if (verifierCookie) {
      resp.cookies.set('tiktok_pkce', '', { maxAge: 0, path: '/api/auth/tiktok' });
    }

    return resp;
  } catch (e: any) {
    console.error('TikTok token exchange failed:', e?.response?.data || e?.message || e);
    console.error('Full error details:', {
      status: e?.response?.status,
      statusText: e?.response?.statusText,
      data: e?.response?.data,
      message: e?.message,
    });
    return NextResponse.redirect(`${request.nextUrl.origin}/auth/error?provider=tiktok&error=token_exchange_failed`);
  }
} 