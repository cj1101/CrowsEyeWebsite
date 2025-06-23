import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    // Await params to fix Next.js 15 requirement
    const { videoId } = await params;
    console.log('🎥 Serving video:', videoId);

    // Define the video storage directory
    const videoDir = path.join(process.cwd(), 'temp', 'generated-videos');
    const videoPath = path.join(videoDir, `${videoId}.mp4`);

    // Check if video file exists
    try {
      await fs.access(videoPath);
    } catch (error) {
      console.error('❌ Video file not found:', videoPath);
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Read the video file
    const videoBuffer = await fs.readFile(videoPath);
    
    // Get file stats for content length
    const stats = await fs.stat(videoPath);
    
    console.log(`✅ Serving video: ${videoId}, size: ${stats.size} bytes`);

    // Return video with proper headers
    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': stats.size.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000',
        'Content-Disposition': `inline; filename="${videoId}.mp4"`,
      },
    });

  } catch (error) {
    console.error('❌ Error serving video:', error);
    return NextResponse.json(
      { error: 'Failed to serve video' },
      { status: 500 }
    );
  }
} 