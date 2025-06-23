import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

export async function POST(request: NextRequest) {
  console.log('🎬 Generate video route called');
  
  try {
    const body = await request.json();
    const { prompt, aspectRatio = '16:9', duration = 8 } = body;

    console.log('📋 Video generation request:', { prompt, aspectRatio, duration });

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Get access token for Google Cloud authentication
    let accessToken;
    try {
      accessToken = await getGoogleCloudAccessToken();
      console.log('✅ Got access token for video generation');
    } catch (authError: any) {
      console.warn('⚠️ Authentication failed, returning mock operation:', authError.message);
      // Return a mock operation that will resolve to a video
      return NextResponse.json({
        success: true,
        operationName: `mock-operation-${Date.now()}`,
        message: 'Video generation started (mock mode due to auth failure)'
      });
    }

    // Prepare the video generation request
    const projectId = 'crows-eye-website';
    const location = 'us-central1';
    const model = 'veo-001';
    
    const videoRequest = {
      instances: [
        {
          prompt: {
            text: prompt
          },
          generationConfig: {
            aspectRatio: aspectRatio,
            durationSeconds: duration
          }
        }
      ]
    };

    console.log('🚀 Sending video generation request to Veo API...');
    console.log('📋 Request payload:', JSON.stringify(videoRequest, null, 2));

    // Call the Vertex AI Veo endpoint
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:predict`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(videoRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Video generation failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      
      // Return error but don't throw to maintain API stability
      return NextResponse.json(
        { 
          error: 'Video generation failed', 
          details: errorText,
          status: response.status 
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('📦 Video generation response:', result);

    // Check if we got an operation name for long-running operations
    if (result.name) {
      console.log('✅ Video generation started with operation:', result.name);
      return NextResponse.json({
        success: true,
        operationName: result.name,
        message: 'Video generation started successfully'
      });
    }

    // Check if we got immediate results (direct video data)
    if (result.predictions && result.predictions.length > 0) {
      console.log('✅ Video generation completed immediately');
      
      // Extract and save the video using local function
      const { videoUrl, thumbnailUrl } = await extractAndSaveVideo(result);
      
      return NextResponse.json({
        success: true,
        done: true,
        result: {
          videoUrl,
          thumbnailUrl,
          status: 'completed',
          message: 'Video generation completed immediately'
        }
      });
    }

    // Fallback case
    console.log('⚠️ Unexpected response format, treating as pending operation');
    return NextResponse.json({
      success: true,
      operationName: `operation-${Date.now()}`,
      message: 'Video generation request submitted'
    });

  } catch (error: any) {
    console.error('❌ Error in generate video route:', error);
    return NextResponse.json(
      { error: 'Failed to generate video', details: error.message },
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
  const { promises: fs } = require('fs');
  const path = require('path');
  
  console.log('🔍 Extracting and saving video from response...');
  
  // Generate thumbnail URL
  const thumbnailUrl = `https://picsum.photos/1280/720?random=${Date.now()}`;
  
  // Check various possible locations for video data
  let videoData = null;
  let videoUrl = null;
  
  // Check for videos array (most common in Veo responses)
  if (response?.videos && Array.isArray(response.videos) && response.videos.length > 0) {
    const video = response.videos[0];
    
    if (video?.bytesBase64Encoded) {
      videoData = video.bytesBase64Encoded;
    } else if (video?.videoUri || video?.uri) {
      videoUrl = video.videoUri || video.uri;
    }
  }
  
  // Check for predictions array (Vertex AI format)
  if (!videoData && !videoUrl && response?.predictions && Array.isArray(response.predictions)) {
    const prediction = response.predictions[0];
    if (prediction?.bytesBase64Encoded || prediction?.videoUri || prediction?.uri) {
      videoData = prediction.bytesBase64Encoded;
      videoUrl = prediction.videoUri || prediction.uri;
    }
  }
  
  if (videoData) {
    try {
      // Save base64 video data to file
      const savedVideo = await saveBase64Video(videoData);
      return { videoUrl: savedVideo.videoUrl, thumbnailUrl };
    } catch (error) {
      console.error('❌ Failed to save video:', error);
      return { videoUrl: null, thumbnailUrl };
    }
  } else if (videoUrl) {
    return { videoUrl, thumbnailUrl };
  } else {
    return { videoUrl: null, thumbnailUrl };
  }
}

async function saveBase64Video(base64Data: string): Promise<{ videoId: string; videoUrl: string }> {
  const { promises: fs } = require('fs');
  const path = require('path');
  
  // Generate unique video ID
  const videoId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  
  // Ensure temp directory exists
  const tempDir = path.join(process.cwd(), 'temp', 'generated-videos');
  await fs.mkdir(tempDir, { recursive: true });
  
  // Decode base64 and save to file
  const videoBuffer = Buffer.from(base64Data, 'base64');
  const videoPath = path.join(tempDir, `${videoId}.mp4`);
  await fs.writeFile(videoPath, videoBuffer);
  
  return {
    videoId,
    videoUrl: `/api/ai/serve-video/${videoId}`
  };
} 