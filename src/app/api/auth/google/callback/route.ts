import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('Google Platforms OAuth error:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?google_error=${encodeURIComponent(error)}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?google_error=missing_parameters`
      );
    }

    // Parse state to get original request info
    let stateData;
    try {
      stateData = JSON.parse(state);
    } catch (parseError) {
      console.error('Invalid state parameter:', parseError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?google_error=invalid_state`
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?google_error=token_exchange_failed`
      );
    }

    const tokens = await tokenResponse.json();

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error('Failed to get user info');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?google_error=user_info_failed`
      );
    }

    const userInfo = await userInfoResponse.json();

    // Get YouTube channel info if YouTube is included
    let youtubeChannelInfo = null;
    if (stateData.platforms.includes('youtube')) {
      try {
        const channelResponse = await fetch(
          'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
          {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          }
        );

        if (channelResponse.ok) {
          const channelData = await channelResponse.json();
          if (channelData.items && channelData.items.length > 0) {
            youtubeChannelInfo = channelData.items[0];
          }
        }
      } catch (error) {
        console.error('Failed to get YouTube channel info:', error);
        // Continue without YouTube info
      }
    }

    // Get Google My Business account info if included
    let googleMyBusinessInfo = null;
    if (stateData.platforms.includes('google-my-business')) {
      try {
        const businessResponse = await fetch(
          'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
          {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          }
        );

        if (businessResponse.ok) {
          const businessData = await businessResponse.json();
          if (businessData.accounts && businessData.accounts.length > 0) {
            googleMyBusinessInfo = businessData.accounts[0];
          }
        }
      } catch (error) {
        console.error('Failed to get Google My Business info:', error);
        // Continue without GMB info
      }
    }

    // Store connection data (in production, this would go to your database)
    const connectionData = {
      platform: 'google',
      platforms: stateData.platforms,
      connected: true,
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Date.now() + (tokens.expires_in * 1000),
      },
      userInfo,
      youtubeChannelInfo,
      googleMyBusinessInfo,
      connectedAt: new Date().toISOString(),
      lastSync: new Date().toISOString(),
    };

    // In a real app, you'd save this to your database
    // For now, we'll use a mock response

    console.log('Google Platforms connection successful:', {
      email: userInfo.email,
      platforms: stateData.platforms,
      youtubeChannel: youtubeChannelInfo?.snippet?.title,
      businessAccount: googleMyBusinessInfo?.name,
    });

    // Redirect back to dashboard with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?google_connected=true&platforms=${stateData.platforms.join(',')}`
    );

  } catch (error) {
    console.error('Google Platforms OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?google_error=callback_failed`
    );
  }
}

export async function POST(request: NextRequest) {
  // Handle POST requests by redirecting to GET
  return GET(request);
} 