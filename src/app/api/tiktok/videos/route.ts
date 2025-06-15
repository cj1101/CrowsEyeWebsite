import { NextRequest, NextResponse } from 'next/server';
import { TikTokAPI, TikTokConfig, TikTokTokens } from '@/lib/tiktok-api';

export const dynamic = 'force-dynamic';

function getTokensFromCookie(request: NextRequest): TikTokTokens | null {
  const cookie = request.cookies.get('tiktok_tokens');
  if (!cookie) return null;
  try {
    return JSON.parse(cookie.value) as TikTokTokens;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const tokens = getTokensFromCookie(request);
  if (!tokens) {
    return NextResponse.json({ error: 'Not authenticated with TikTok' }, { status: 401 });
  }

  const config: TikTokConfig = {
    clientKey: process.env.TIKTOK_CLIENT_KEY ?? '',
    clientSecret: process.env.TIKTOK_CLIENT_SECRET ?? '',
  };

  const api = new TikTokAPI(config, tokens);
  try {
    const videos = await api.getUserVideos();
    return NextResponse.json({ videos });
  } catch (e: any) {
    console.error('TikTok getUserVideos error:', e?.response?.data || e);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
} 