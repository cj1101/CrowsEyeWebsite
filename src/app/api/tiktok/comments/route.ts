import { NextRequest, NextResponse } from 'next/server';
import { TikTokAPI, TikTokConfig, TikTokTokens } from '@/lib/tiktok-api';

export const dynamic = 'force-dynamic';

function getTokens(request: NextRequest): TikTokTokens | null {
  const cookie = request.cookies.get('tiktok_tokens');
  if (!cookie) return null;
  try { return JSON.parse(cookie.value) as TikTokTokens; } catch { return null; }
}

export async function GET(request: NextRequest) {
  const tokens = getTokens(request);
  if (!tokens) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const videoId = request.nextUrl.searchParams.get('video_id');
  if (!videoId) return NextResponse.json({ error: 'video_id required' }, { status: 400 });

  const api = new TikTokAPI({ clientKey: process.env.TIKTOK_CLIENT_KEY ?? '', clientSecret: process.env.TIKTOK_CLIENT_SECRET ?? '' }, tokens);
  try {
    const comments = await api.getComments(videoId);
    return NextResponse.json({ comments });
  } catch (e: any) {
    console.error('TikTok comments error:', e?.response?.data || e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
} 