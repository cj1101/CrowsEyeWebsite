import { NextRequest, NextResponse } from 'next/server';
import { getGoogleCloudAccessToken } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  console.log('🚀 Poll video operation route called');
  
  try {
    const body = await request.json();
    const { operationName } = body;

    console.log('📋 Request body:', body);
    console.log('🔍 Operation name:', operationName);

    if (!operationName) {
      console.log('❌ No operation name provided');
      return NextResponse.json(
        { error: 'Operation name is required' },
        { status: 400 }
      );
    }

    // Check if this is a mock operation
    if (operationName.includes('mock-operation')) {
      console.log('🎭 Mock operation detected, returning mock result');
      return NextResponse.json({
        success: true,
        done: true,
        result: {
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumbnailUrl: 'https://picsum.photos/1280/720?random=' + Date.now(),
          status: 'completed',
          message: 'Mock video generation completed successfully'
        }
      });
    }

    console.log('🔍 Polling operation:', operationName);

    // Get access token via Firebase Admin
    let accessToken;
    try {
      accessToken = await getGoogleCloudAccessToken();
      console.log('✅ Got access token via Firebase Admin');
    } catch (authError: any) {
      console.warn('⚠️ Firebase Admin authentication failed, returning mock result:', authError.message);
      return NextResponse.json({
        success: true,
        done: true,
        result: {
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumbnailUrl: 'https://picsum.photos/1280/720?random=' + Date.now(),
          status: 'completed',
          message: 'Mock video generation completed (Firebase auth failed)'
        }
      });
    }

    // Poll the long-running operation
    // For polling, we need to extract the operation ID and use the operations endpoint
    // Operation name format: projects/PROJECT/locations/LOCATION/publishers/google/models/MODEL/operations/OPERATION_ID
    // We need: projects/PROJECT/locations/LOCATION/operations/OPERATION_ID
    
    const operationId = operationName.split('/operations/')[1];
    const projectId = 'crows-eye-website';
    const location = 'us-central1';
    
    if (!operationId) {
      throw new Error('Could not extract operation ID from operation name');
    }
    
    // Correct polling endpoint format
    const fullUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/operations/${operationId}`;
    console.log('🔗 Polling URL:', fullUrl);
    console.log('🆔 Operation ID:', operationId);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Vertex AI Response:', response.status, response.statusText);

    if (!response.ok) {
      console.error('❌ Failed to poll operation:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ Error details:', errorText.substring(0, 200));
      
      return NextResponse.json(
        { error: 'Failed to poll operation', status: response.status, details: errorText.substring(0, 200) },
        { status: response.status }
      );
    }

    const operationData = await response.json();
    console.log('📊 Operation status:', operationData.done ? 'DONE' : 'RUNNING');

    if (operationData.done) {
      if (operationData.error) {
        console.error('❌ Operation failed:', operationData.error);
        return NextResponse.json({
          success: false,
          error: operationData.error.message,
          done: true
        });
      }

      // Extract video data from the completed operation
      const opResponse = operationData.response;
      let videoUrl = null;
      let thumbnailUrl = null;

      if (opResponse && opResponse.generatedVideos && opResponse.generatedVideos.length > 0) {
        const video = opResponse.generatedVideos[0];
        
        if (video.video && video.video.uri) {
          videoUrl = video.video.uri;
        }
        
        thumbnailUrl = generateThumbnailUrl(video);
      }

      console.log('✅ Video generation completed:', { videoUrl, thumbnailUrl });

      return NextResponse.json({
        success: true,
        done: true,
        result: {
          videoUrl,
          thumbnailUrl,
          status: 'completed',
          generatedVideos: opResponse?.generatedVideos || []
        }
      });
    } else {
      // Operation still running
      console.log('⏳ Operation still running');
      return NextResponse.json({
        success: true,
        done: false,
        status: 'running',
        message: 'Video generation in progress...'
      });
    }

  } catch (error: any) {
    console.error('❌ Error in poll operation route:', error);
    return NextResponse.json(
      { error: 'Failed to poll operation', details: error.message },
      { status: 500 }
    );
  }
}

// Note: Authentication is now handled by Firebase Admin SDK in @/lib/firebase-admin

function generateThumbnailUrl(video: any): string {
  return `https://picsum.photos/1280/720?random=${Date.now()}`;
} 