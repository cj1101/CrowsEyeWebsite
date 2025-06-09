import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    // Path to the portable version file
    const filePath = join(process.cwd(), 'public', 'downloads', 'breadsmith-marketing-tool-portable.zip');
    
    // Read the file
    const fileBuffer = await readFile(filePath);
    
    // Log download for analytics
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    console.log(`Portable download requested from IP: ${clientIP}`);
    
    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="breadsmith-marketing-tool-portable.zip"',
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving portable download:', error);
    
    // Return a fallback download link or error
    return NextResponse.json(
      { 
        error: 'Download temporarily unavailable',
        message: 'Please try again later or contact support',
        fallback: 'https://github.com/your-repo/releases/latest'
      },
      { status: 500 }
    );
  }
} 