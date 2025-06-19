import { NextRequest, NextResponse } from 'next/server';

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/instagram/callback`;

export async function GET(request: NextRequest) {
  try {
    if (!INSTAGRAM_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Instagram OAuth not configured. App verification pending.' },
        { status: 503 }
      );
    }

    // Instagram OAuth scopes for business accounts
    const scopes = [
      'instagram_basic',
      'instagram_content_publish',
      'instagram_manage_insights',
      'pages_show_list',
      'business_management'
    ].join(',');

    const state = crypto.randomUUID();
    
    // Store state in session/cookie for security
    const response = NextResponse.redirect(
      `https://api.instagram.com/oauth/authorize?` +
      `client_id=${INSTAGRAM_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(INSTAGRAM_REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `response_type=code&` +
      `state=${state}`
    );

    // Set state cookie for verification
    response.cookies.set('instagram_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('Instagram OAuth start error:', error);
    
    // Return HTML that closes the popup and shows error
    return new NextResponse(`
      <html>
        <body>
          <script>
            alert('Instagram connection failed. App verification is still pending.');
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