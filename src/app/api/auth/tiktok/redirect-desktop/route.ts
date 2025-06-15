import { NextRequest, NextResponse } from 'next/server';
import { GET as handleRedirect } from '../redirect/route';

export const dynamic = 'force-dynamic';

// Reuse existing logic then return minimal HTML letting user close.
export async function GET(request: NextRequest) {
  const response = await handleRedirect(request);

  // If redirect to dashboard succeeded, just return same.
  if (response instanceof NextResponse && response.redirected) {
    return response;
  }

  // Otherwise, show a simple page for desktop app flows.
  if (response instanceof NextResponse) {
    // If redirect route returns JSON error etc., pass through.
    return response;
  }

  // Fallback
  return new NextResponse('<html><body><h1>Authentication complete</h1><p>You can close this window.</p></body></html>', {
    headers: { 'Content-Type': 'text/html' },
  });
} 