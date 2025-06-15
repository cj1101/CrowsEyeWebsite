import { NextRequest, NextResponse } from 'next/server';
import { TikTokAPI, TikTokTokens } from '@/lib/tiktok-api';

export const dynamic = 'force-dynamic';

function getTokens(req: NextRequest): TikTokTokens | null {
  const cookie = req.cookies.get('tiktok_tokens');
  if (!cookie) return null;
  try { return JSON.parse(cookie.value) as TikTokTokens; } catch { return null; }
}

export async function POST(request: NextRequest) {
  const tokens = getTokens(request);
  if (!tokens) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const { commentId, text } = await request.json();
    if (!commentId || !text) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

    const api = new TikTokAPI({ clientKey: process.env.TIKTOK_CLIENT_KEY ?? '', clientSecret: process.env.TIKTOK_CLIENT_SECRET ?? '' }, tokens);
    await api.replyToComment(commentId, text);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('TikTok reply error:', e?.response?.data || e);
    return NextResponse.json({ error: 'Failed to reply' }, { status: 500 });
  }
} 