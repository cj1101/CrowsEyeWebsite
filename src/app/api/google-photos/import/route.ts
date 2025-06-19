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
    const { mediaIds, albumId } = body;

    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      return NextResponse.json({ error: 'Media IDs are required' }, { status: 400 });
    }

    // Get media items details
    const mediaPromises = mediaIds.map(async (mediaId: string) => {
      try {
        const response = await axios.get(
          `https://photoslibrary.googleapis.com/v1/mediaItems/${mediaId}`,
          {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
          }
        );

        const item = response.data;
        
        // Download the media file
        const downloadUrl = `${item.baseUrl}=d`; // =d parameter for download
        const mediaResponse = await axios.get(downloadUrl, {
          responseType: 'arraybuffer',
          headers: { Authorization: `Bearer ${tokens.access_token}` }
        });

        // Convert to base64 for storage/transfer
        const base64Data = Buffer.from(mediaResponse.data).toString('base64');
        
        return {
          id: item.id,
          filename: item.filename,
          mimeType: item.mimeType,
          data: base64Data,
          size: mediaResponse.data.byteLength,
          metadata: {
            creationTime: item.mediaMetadata.creationTime,
            width: item.mediaMetadata.width,
            height: item.mediaMetadata.height,
            photo: item.mediaMetadata.photo,
            video: item.mediaMetadata.video
          },
          source: 'google_photos',
          googlePhotosId: item.id,
          originalUrl: item.baseUrl
        };
      } catch (error: any) {
        console.error(`Failed to download media ${mediaId}:`, error.message);
        return {
          id: mediaId,
          error: error.message,
          status: 'failed'
        };
      }
    });

    const results = await Promise.all(mediaPromises);
    
    // Separate successful and failed imports
    const successful = results.filter(result => !result.error);
    const failed = results.filter(result => result.error);

    // Here you would typically save the successful imports to your database
    // For now, we'll just return the results
    
    console.log(`✅ Google Photos import completed: ${successful.length} successful, ${failed.length} failed`);

    return NextResponse.json({
      success: true,
      imported: successful.length,
      failed: failed.length,
      results: {
        successful: successful.map(item => ({
          id: item.id,
          filename: item.filename,
          size: item.size,
          mimeType: item.mimeType
        })),
        failed: failed.map(item => ({
          id: item.id,
          error: item.error
        }))
      }
    });

  } catch (error: any) {
    console.error('❌ Google Photos import error:', error.response?.data || error.message);
    return NextResponse.json({ 
      error: 'Import failed',
      details: error.response?.data || error.message 
    }, { status: 500 });
  }
} 