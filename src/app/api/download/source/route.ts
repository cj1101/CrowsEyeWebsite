import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    // Path to the source code file
    const filePath = join(process.cwd(), 'public', 'downloads', 'crows-eye-source.zip');
    
    // Read the file
    const fileBuffer = await readFile(filePath);
    
    // Log download for analytics
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    console.log(`Source code download requested from IP: ${clientIP}`);
    
    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="CrowsEye-Marketing-Tool-Source.zip"',
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving source download:', error);
    
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