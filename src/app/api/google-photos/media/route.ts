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
    const albumId = searchParams.get('albumId');
    const pageToken = searchParams.get('pageToken');
    const pageSize = searchParams.get('pageSize') || '50';

    let url = 'https://photoslibrary.googleapis.com/v1/mediaItems';
    const params: any = { pageSize };
    
    if (pageToken) params.pageToken = pageToken;

    let requestData = null;

    // If albumId is provided, search within that album
    if (albumId) {
      url += ':search';
      requestData = {
        albumId,
        pageSize: parseInt(pageSize),
        pageToken
      };
    }

    const config: any = {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    };

    let response;
    if (requestData) {
      response = await axios.post(url, requestData, config);
    } else {
      response = await axios.get(url, { ...config, params });
    }

    const mediaItems = response.data.mediaItems || [];
    const formattedItems = mediaItems.map((item: any) => ({
      id: item.id,
      filename: item.filename,
      mimeType: item.mimeType,
      baseUrl: item.baseUrl,
      productUrl: item.productUrl,
      description: item.description,
      mediaMetadata: {
        creationTime: item.mediaMetadata.creationTime,
        width: item.mediaMetadata.width,
        height: item.mediaMetadata.height,
        photo: item.mediaMetadata.photo,
        video: item.mediaMetadata.video
      }
    }));

    return NextResponse.json({
      mediaItems: formattedItems,
      nextPageToken: response.data.nextPageToken
    });

  } catch (error: any) {
    console.error('❌ Google Photos media error:', error.response?.data || error.message);
    return NextResponse.json({ 
      error: 'Failed to fetch media items',
      details: error.response?.data || error.message 
    }, { status: 500 });
  }
} 