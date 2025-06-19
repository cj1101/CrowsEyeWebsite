import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { query, pageSize = 50, pageToken } = body;

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // Build search filters
    const searchData: any = {
      pageSize,
      filters: {
        contentFilter: {
          includedContentCategories: [] // Can be enhanced with specific categories
        }
      }
    };

    if (pageToken) searchData.pageToken = pageToken;

    // For text-based search, we'll use mediaTypeFilter for basic filtering
    // Note: Google Photos API doesn't have full-text search, so this is limited
    if (query.toLowerCase().includes('video')) {
      searchData.filters.mediaTypeFilter = {
        mediaTypes: ['VIDEO']
      };
    } else if (query.toLowerCase().includes('photo') || query.toLowerCase().includes('image')) {
      searchData.filters.mediaTypeFilter = {
        mediaTypes: ['PHOTO']
      };
    }

    const response = await axios.post(
      'https://photoslibrary.googleapis.com/v1/mediaItems:search',
      searchData,
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      }
    );

    const mediaItems = response.data.mediaItems || [];
    
    // Client-side filtering by filename for better search experience
    const filteredItems = mediaItems.filter((item: any) => 
      item.filename.toLowerCase().includes(query.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
    );

    const formattedItems = filteredItems.map((item: any) => ({
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
      nextPageToken: response.data.nextPageToken,
      totalResults: formattedItems.length
    });

  } catch (error: any) {
    console.error('❌ Google Photos search error:', error.response?.data || error.message);
    return NextResponse.json({ 
      error: 'Search failed',
      details: error.response?.data || error.message 
    }, { status: 500 });
  }
} 