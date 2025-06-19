import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    // Check for OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return new NextResponse(`
        <html>
          <body>
            <script>
              alert('Google Photos connection was cancelled or failed.');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });
    }
    
    if (!code || !state) {
      return new NextResponse(`
        <html>
          <body>
            <script>
              alert('Invalid response from Google Photos. Please try again.');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });
    }
    
    // Verify state parameter (simplified for demo)
    const storedState = request.cookies.get('google_oauth_state')?.value;
    if (state !== storedState) {
      return new NextResponse(`
        <html>
          <body>
            <script>
              alert('Security verification failed. Please try again.');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });
    }
    
    // Exchange code for tokens
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_BASE_URL + '/api/google-photos/callback';
    
    if (!clientId || !clientSecret) {
      return new NextResponse(`
        <html>
          <body>
            <script>
              alert('Google Photos integration not properly configured.');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });
    }
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      return new NextResponse(`
        <html>
          <body>
            <script>
              alert('Failed to complete Google Photos connection. Please try again.');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });
    }
    
    // TODO: Store tokens securely (database, encrypted session, etc.)
    // For demo purposes, we'll just mark as connected in localStorage
    
    // Success - close the popup and refresh parent
    return new NextResponse(`
      <html>
        <body>
          <script>
            // Store connection status in localStorage for demo
            localStorage.setItem('googlePhotosConnected', 'true');
            localStorage.setItem('googlePhotosTokens', JSON.stringify({
              access_token: '${tokenData.access_token}',
              refresh_token: '${tokenData.refresh_token}',
              expires_at: ${Date.now() + (tokenData.expires_in * 1000)}
            }));
            
            alert('Successfully connected to Google Photos!');
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    return new NextResponse(`
      <html>
        <body>
          <script>
            alert('An error occurred during Google Photos connection.');
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
} 