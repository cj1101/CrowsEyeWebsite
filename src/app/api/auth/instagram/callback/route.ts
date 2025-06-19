import { NextRequest, NextResponse } from 'next/server';

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;
const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/instagram/callback`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      console.error('Instagram OAuth error:', error);
      return new NextResponse(`
        <html>
          <body>
            <script>
              alert('Instagram connection was cancelled or failed.');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Verify state parameter
    const storedState = request.cookies.get('instagram_oauth_state')?.value;
    if (!state || state !== storedState) {
      console.error('Invalid state parameter');
      return new NextResponse(`
        <html>
          <body>
            <script>
              alert('Security error: Invalid state parameter.');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 400
      });
    }

    if (!code) {
      return new NextResponse(`
        <html>
          <body>
            <script>
              alert('No authorization code received.');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 400
      });
    }

    // Check if app is configured
    if (!INSTAGRAM_CLIENT_ID || !INSTAGRAM_CLIENT_SECRET) {
      return new NextResponse(`
        <html>
          <body>
            <script>
              alert('Instagram app is not yet configured. App verification is pending.');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 503
      });
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: INSTAGRAM_CLIENT_ID,
        client_secret: INSTAGRAM_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: INSTAGRAM_REDIRECT_URI,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      return new NextResponse(`
        <html>
          <body>
            <script>
              alert('Failed to exchange authorization code for access token.');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 400
      });
    }

    // Get user info
    const userResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${tokenData.access_token}`
    );
    const userData = await userResponse.json();

    if (!userResponse.ok) {
      console.error('Failed to get user info:', userData);
      return new NextResponse(`
        <html>
          <body>
            <script>
              alert('Failed to get Instagram user information.');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
        status: 400
      });
    }

    // Store connection info in localStorage via client-side script
    const connectionData = {
      platform: 'instagram',
      username: userData.username,
      userId: userData.id,
      accountType: userData.account_type,
      accessToken: tokenData.access_token, // In production, this should be stored securely server-side
      connectedAt: new Date().toISOString(),
      lastSync: new Date().toISOString()
    };

    // Return success page that stores data and closes popup
    return new NextResponse(`
      <html>
        <body>
          <script>
            try {
              // Store connection data
              localStorage.setItem('platform_instagram_connected', JSON.stringify(${JSON.stringify(connectionData)}));
              
              // Notify parent window
              if (window.opener) {
                window.opener.postMessage({ type: 'instagram_connected', data: ${JSON.stringify(connectionData)} }, '*');
              }
              
              alert('Instagram connected successfully!');
              window.close();
            } catch (error) {
              console.error('Error storing connection data:', error);
              alert('Connection succeeded but failed to save data.');
              window.close();
            }
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Instagram callback error:', error);
    return new NextResponse(`
      <html>
        <body>
          <script>
            alert('An unexpected error occurred during Instagram connection.');
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
      status: 500
    });
  }
} 