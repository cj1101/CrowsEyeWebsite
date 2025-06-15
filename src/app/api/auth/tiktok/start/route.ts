import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY ?? '';
// Allow env override; otherwise build from current origin (works in dev)
let REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || '';

// Comma separated scopes - only using valid TikTok API scopes
// Removed comment.list and comment.reply as they don't exist in TikTok's official API
const SCOPES = process.env.TIKTOK_SCOPES ?? 'user.info.basic,video.list';

export async function GET(request: NextRequest) {
  if (!REDIRECT_URI) {
    REDIRECT_URI = `${request.nextUrl.origin}/api/auth/tiktok/redirect`;
  }

  //----- PKCE -----
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const hashed = crypto.createHash('sha256').update(codeVerifier).digest();
  const codeChallenge = Buffer.from(hashed).toString('base64url');

  const state = cryptoRandomString();
  const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
  authUrl.searchParams.set('client_key', CLIENT_KEY);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('scope', SCOPES);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  const resp = NextResponse.redirect(authUrl.toString());
  resp.cookies.set('tiktok_pkce', codeVerifier, {
    httpOnly: true,
    path: '/api/auth/tiktok',
    maxAge: 10 * 60, // 10 min
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return resp;
}

function cryptoRandomString(): string {
  return crypto.randomBytes(16).toString('hex');
} 