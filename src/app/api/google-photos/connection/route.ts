import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// GET - Check connection status
export async function GET(request: NextRequest) {
  const cookie = request.cookies.get('google_photos_tokens');
  
  if (!cookie) {
    return NextResponse.json({
      isConnected: false,
      userEmail: null,
      albumCount: 0,
      lastSync: null
    });
  }

  try {
    const tokens = JSON.parse(cookie.value);
    
    // Check if token is expired
    if (Date.now() >= tokens.expires_at) {
      return NextResponse.json({
        isConnected: false,
        userEmail: null,
        albumCount: 0,
        lastSync: null,
        error: 'Token expired'
      });
    }

    // Test the connection by making a simple API call
    const albumsResponse = await axios.get('https://photoslibrary.googleapis.com/v1/albums', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      params: { pageSize: 1 }
    });

    return NextResponse.json({
      isConnected: true,
      userEmail: tokens.user_email,
      albumCount: albumsResponse.data.albums?.length || 0,
      lastSync: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Google Photos connection check failed:', error.response?.data || error.message);
    
    return NextResponse.json({
      isConnected: false,
      userEmail: null,
      albumCount: 0,
      lastSync: null,
      error: 'Connection failed'
    });
  }
}

// DELETE - Disconnect Google Photos
export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true, message: 'Google Photos disconnected' });
    response.cookies.delete('google_photos_tokens');
    return response;
  } catch (error: any) {
    console.error('❌ Google Photos disconnect error:', error.message);
    return NextResponse.json({ 
      error: 'Failed to disconnect Google Photos' 
    }, { status: 500 });
  }
} 