import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    let files: string[] = [];
    try {
      files = await readdir(uploadsDir);
    } catch (error) {
      // Directory doesn't exist or is empty
      return NextResponse.json([]);
    }

    // Filter out non-media files and get file stats
    const mediaItems = await Promise.all(
      files
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.avi', '.mkv'].includes(ext);
        })
        .map(async (file, index) => {
          const filePath = path.join(uploadsDir, file);
          const stats = await stat(filePath);
          const ext = path.extname(file).toLowerCase();
          
          const getMediaType = (extension: string) => {
            if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension)) return 'image';
            if (['.mp4', '.mov', '.avi', '.mkv'].includes(extension)) return 'video';
            return 'file';
          };

          const mediaType = getMediaType(ext);
          
          // Generate basic AI tags
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

          const description = mediaType === 'image' ? 
            'A beautiful image ready for sharing across social platforms' :
            mediaType === 'video' ? 
            'An engaging video ready for your audience' :
            'Media file uploaded and ready';

          return {
            id: index + 1,
            filename: file,
            original_filename: file,
            caption: description,
            description: description,
            ai_tags: aiTags,
            tags: aiTags.map(tag => tag.tag),
            media_type: mediaType,
            file_size: stats.size,
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
            upload_date: stats.birthtime.toISOString(),
            platforms: [],
            url: `/uploads/${file}`,
            thumbnail_url: mediaType === 'image' ? `/uploads/${file}` : null,
            download_url: `/uploads/${file}`
          };
        })
    );

    // Sort by upload date (newest first)
    mediaItems.sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime());

    return NextResponse.json(mediaItems);

  } catch (error) {
    console.error('Error listing media files:', error);
    return NextResponse.json(
      { error: 'Failed to list media files', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 