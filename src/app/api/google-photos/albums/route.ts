import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get('google_photos_tokens');
  
  if (!cookie) {
    return NextResponse.json({ error: 'Not authenticated with Google Photos' }, { status: 401 });
  }

  try {
    const tokens = JSON.parse(cookie.value);
    
    // Check if token is expired
    if (Date.now() >= tokens.expires_at) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageToken = searchParams.get('pageToken');
    const pageSize = searchParams.get('pageSize') || '50';

    // Get user's albums
    const params: any = { pageSize };
    if (pageToken) params.pageToken = pageToken;

    const response = await axios.get('https://photoslibrary.googleapis.com/v1/albums', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      params
    });

    const albums = response.data.albums || [];
    const formattedAlbums = albums.map((album: any) => ({
      id: album.id,
      title: album.title,
      productUrl: album.productUrl,
      coverPhotoUrl: album.coverPhotoBaseUrl ? `${album.coverPhotoBaseUrl}=w300-h300-c` : null,
      mediaItemsCount: parseInt(album.mediaItemsCount || '0'),
      isWriteable: album.isWriteable || false
    }));

    return NextResponse.json({
      albums: formattedAlbums,
      nextPageToken: response.data.nextPageToken
    });

  } catch (error: any) {
    console.error('❌ Google Photos albums error:', error.response?.data || error.message);
    return NextResponse.json({ 
      error: 'Failed to fetch albums',
      details: error.response?.data || error.message 
    }, { status: 500 });
  }
} 