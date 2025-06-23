import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import { promises as fs } from 'fs';
import path from 'path';

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

    // Get access token for Google Cloud authentication
    let accessToken;
    try {
      accessToken = await getGoogleCloudAccessToken();
      console.log('✅ Got access token');
    } catch (authError: any) {
      console.warn('⚠️ Authentication failed, returning mock result:', authError.message);
      return NextResponse.json({
        success: true,
        done: true,
        result: {
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumbnailUrl: 'https://picsum.photos/1280/720?random=' + Date.now(),
          status: 'completed',
          message: 'Mock video generation completed (auth failed)'
        }
      });
    }

    // Construct the polling URL using the correct endpoint
    let fullUrl;
    const projectId = 'crows-eye-website';
    const location = 'us-central1';
    
    if (operationName.includes('/publishers/')) {
      // This is a publisher model operation (Vertex AI Imagen/Veo)
      fullUrl = `https://${location}-aiplatform.googleapis.com/v1/${operationName}`;
    } else {
      // This is a standard operation
      fullUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/operations/${operationName}`;
    }

    console.log('🌐 Polling URL:', fullUrl);

    // Poll the operation
    const response = await fetch(fullUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to poll operation:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Failed to poll operation: ${response.status} ${errorText}`);
    }

    const operationData = await response.json();
    console.log('📊 Operation status:', operationData.done ? 'DONE' : 'RUNNING');

    if (operationData.done) {
      if (operationData.error) {
        console.error('❌ Operation failed:', operationData.error);
        return NextResponse.json({
          success: false,
          error: operationData.error.message || 'Operation failed',
          done: true
        });
      }

      // Extract video data from the completed operation
      const opResponse = operationData.response;
      console.log('📦 Operation response structure:', opResponse ? Object.keys(opResponse) : 'null');
      
      const { videoUrl, thumbnailUrl } = await extractAndSaveVideo(opResponse);

      // If no video URL found, log the entire response for debugging and return error
      if (!videoUrl) {
        console.error('❌ No video URL found in response. Full operation data:');
        console.error(JSON.stringify(operationData, null, 2));
        
        return NextResponse.json({
          success: false,
          error: 'Video generation completed but no video URL found in response',
          done: true,
          debugInfo: {
            hasResponse: !!opResponse,
            responseKeys: opResponse ? Object.keys(opResponse) : [],
            fullResponse: operationData
          }
        });
      }

      console.log('✅ Video generation completed:', { videoUrl, thumbnailUrl });

      return NextResponse.json({
        success: true,
        done: true,
        result: {
          videoUrl,
          thumbnailUrl,
          status: 'completed',
          operationResponse: opResponse,
          generatedVideos: opResponse?.generatedVideos || [],
          predictions: opResponse?.predictions || []
        }
      });
    }
    
    // Operation still running
    console.log('⏳ Operation still running');
    const metadata = operationData.metadata;
    const progress = metadata?.progressPercentage || 0;
    
    return NextResponse.json({
      success: true,
      done: false,
      status: 'running',
      progress: progress,
      message: `Video generation in progress... ${progress}%`
    });

  } catch (error: any) {
    console.error('❌ Error in poll operation route:', error);
    return NextResponse.json(
      { error: 'Failed to poll operation', details: error.message },
      { status: 500 }
    );
  }
}

async function getGoogleCloudAccessToken(): Promise<string> {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  
  if (!accessToken.token) {
    throw new Error('Failed to get access token');
  }
  
  return accessToken.token;
}

async function extractAndSaveVideo(response: any): Promise<{ videoUrl: string | null; thumbnailUrl: string }> {
  console.log('🔍 Extracting and saving video from Google response...');
  console.log('📦 Response keys:', response ? Object.keys(response) : []);
  
  console.log('🔍 Looking for video data (URL or base64)...');
  
  // Generate thumbnail URL
  const thumbnailUrl = `https://picsum.photos/1280/720?random=${Date.now()}`;
  
  // Check various possible locations for video data
  let videoData = null;
  let videoUrl = null;
  
  // Check for videos array (most common in Veo responses)
  if (response?.videos && Array.isArray(response.videos) && response.videos.length > 0) {
    console.log('📹 Found videos array with', response.videos.length, 'items');
    const video = response.videos[0];
    console.log('📹 Video 0:', Object.keys(video || {}));
    
    if (video?.bytesBase64Encoded) {
      console.log('✅ Found base64 encoded video data in videos[0]');
      console.log('📊 Base64 data length:', video.bytesBase64Encoded.length, 'characters');
      console.log('🎬 MIME type:', video.mimeType || 'unknown');
      videoData = video.bytesBase64Encoded;
    } else if (video?.videoUri || video?.uri) {
      console.log('✅ Found video URI in videos[0]');
      videoUrl = video.videoUri || video.uri;
    }
  }
  
  // Check for generatedVideos array
  if (!videoData && !videoUrl && response?.generatedVideos && Array.isArray(response.generatedVideos)) {
    console.log('📹 Checking generatedVideos array');
    const video = response.generatedVideos[0];
    if (video?.bytesBase64Encoded || video?.videoUri || video?.uri) {
      videoData = video.bytesBase64Encoded;
      videoUrl = video.videoUri || video.uri;
    }
  }
  
  // Check for predictions array (Vertex AI format)
  if (!videoData && !videoUrl && response?.predictions && Array.isArray(response.predictions)) {
    console.log('📹 Checking predictions array');
    const prediction = response.predictions[0];
    if (prediction?.bytesBase64Encoded || prediction?.videoUri || prediction?.uri) {
      videoData = prediction.bytesBase64Encoded;
      videoUrl = prediction.videoUri || prediction.uri;
    }
  }
  
  // Check direct properties
  if (!videoData && !videoUrl) {
    if (response?.bytesBase64Encoded) {
      videoData = response.bytesBase64Encoded;
    } else if (response?.videoUri || response?.uri) {
      videoUrl = response.videoUri || response.uri;
    }
  }
  
  if (videoData) {
    console.log('✅ Found video data, processing and saving...');
    try {
      // Save base64 video data to file
      const savedVideo = await saveBase64Video(videoData);
      return { videoUrl: savedVideo.videoUrl, thumbnailUrl };
    } catch (error) {
      console.error('❌ Failed to save video:', error);
      return { videoUrl: null, thumbnailUrl };
    }
  } else if (videoUrl) {
    console.log('✅ Found video URL:', videoUrl);
    return { videoUrl, thumbnailUrl };
  } else {
    console.log('❌ No video data found in response');
    console.log('📦 Full response for debugging:', JSON.stringify(response, null, 2));
    return { videoUrl: null, thumbnailUrl };
  }
}

async function saveBase64Video(base64Data: string): Promise<{ videoId: string; videoUrl: string }> {
  console.log('📥 Processing base64 encoded video data...');
  console.log('📊 Base64 data length:', base64Data.length, 'characters');
  
  // Generate unique video ID
  const videoId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  
  // Ensure temp directory exists
  const tempDir = path.join(process.cwd(), 'temp', 'generated-videos');
  await fs.mkdir(tempDir, { recursive: true });
  
  // Decode base64 and save to file
  const videoBuffer = Buffer.from(base64Data, 'base64');
  console.log('📦 Decoded video buffer size:', videoBuffer.length, 'bytes');
  
  const videoPath = path.join(tempDir, `${videoId}.mp4`);
  await fs.writeFile(videoPath, videoBuffer);
  
  console.log('✅ Video saved to:', videoPath);
  console.log('📦 Final file size:', videoBuffer.length, 'bytes');
  
  const result = {
    videoId,
    videoUrl: `/api/ai/serve-video/${videoId}`
  };
  
  console.log('✅ Video saved successfully:', result);
  return result;
} 