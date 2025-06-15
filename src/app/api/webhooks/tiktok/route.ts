import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// TikTok currently sends only POST events; the console "Test URL" issues a POST with mock payload.
// For now we simply log the payload and respond 200 so the test passes. Add signature verification later.

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    console.log('📥 TikTok webhook payload:', body);
    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    console.error('TikTok webhook error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Some webhook validators issue a GET request; handle it gracefully.
export async function GET() {
  return NextResponse.json({ success: true });
} 