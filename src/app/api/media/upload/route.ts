import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const caption = formData.get('caption') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const uniqueId = uuidv4().substring(0, 8);
    const filename = `${uniqueId}${fileExtension}`;
    const filepath = path.join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Generate AI-like metadata for the uploaded file
    const getMediaType = (mimeType: string) => {
      if (mimeType.startsWith('image/')) return 'image';
      if (mimeType.startsWith('video/')) return 'video';
      return 'file';
    };

    const mediaType = getMediaType(file.type);
    
    // Generate basic AI tags and description
    const aiTags = [
      { tag: 'uploaded', confidence: 1.0, category: 'status' },
      { tag: mediaType, confidence: 0.95, category: 'type' },
      { tag: 'content', confidence: 0.9, category: 'general' }
    ];

    if (mediaType === 'image') {
      aiTags.push(
        { tag: 'visual', confidence: 0.9, category: 'type' },
        { tag: 'engaging', confidence: 0.8, category: 'quality' }
      );
    } else if (mediaType === 'video') {
      aiTags.push(
        { tag: 'dynamic', confidence: 0.9, category: 'type' },
        { tag: 'entertaining', confidence: 0.8, category: 'quality' }
      );
    }

    const description = caption || 
      (mediaType === 'image' ? 'A beautiful image ready for sharing across social platforms' :
       mediaType === 'video' ? 'An engaging video ready for your audience' :
       'Media file uploaded and ready');

    // Mock media item response matching the expected format
    const mediaItem = {
      id: Date.now(), // Use timestamp as ID for simplicity
      filename: filename,
      original_filename: file.name,
      caption: caption || description,
      description: description,
      ai_tags: aiTags,
      tags: aiTags.map(tag => tag.tag),
      media_type: mediaType,
      file_size: file.size,
      width: null,
      height: null,
      duration: null,
      is_post_ready: true,
      isProcessed: true,
      hasContent: true,
      shouldShow: true,
      categorizedAs: 'completed',
      status: 'completed',
      post_metadata: {
        processing_time: 0.1,
        ai_confidence: 0.85,
        media_type: mediaType,
        analysis_version: '1.0-local'
      },
      upload_date: new Date().toISOString(),
      platforms: [],
      url: `/uploads/${filename}`,
      thumbnail_url: mediaType === 'image' ? `/uploads/${filename}` : null,
      download_url: `/uploads/${filename}`
    };

    return NextResponse.json({
      success: true,
      data: mediaItem,
      message: 'File uploaded successfully using local storage'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 