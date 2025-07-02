import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Media proxy upload endpoint called');
    
    // Check if this is a multipart form data request
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Invalid content type' },
        { status: 400 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const caption = formData.get('caption') as string || '';
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('📁 Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Generate unique ID and filename
    const fileId = uuidv4();
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${timestamp}_${fileId}_${safeFileName}`;
    
    // For development, store files in the public directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure upload directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    
    // Save the file
    const filePath = path.join(uploadDir, uniqueFileName);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, fileBuffer);
    
    console.log('✅ File saved to:', filePath);
    
    // Create a response that matches the backend format
    const response = {
      success: true,
      data: {
        id: `media_${fileId}`,
        name: file.name,
        content_type: file.type,
        url: `/uploads/${uniqueFileName}`,
        thumbnail_url: file.type.startsWith('image/') ? `/uploads/${uniqueFileName}` : null,
        file_size: file.size,
        created_at: new Date().toISOString(),
        tags: ["uploaded", "local"],
        platforms: [],
        caption: caption,
        media_type: file.type.startsWith('video/') ? 'video' : 
                   file.type.startsWith('image/') ? 'image' : 
                   file.type.startsWith('audio/') ? 'audio' : 'unknown'
      }
    };
    
    console.log('📦 Returning response:', response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Media proxy upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      },
      { status: 500 }
    );
  }
} 