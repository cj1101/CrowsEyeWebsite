import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    // Path to the macOS installer script
    const filePath = join(process.cwd(), 'public', 'downloads', 'crow-eye-marketing-tool-macos-v5.0.0.sh');
    
    // Read the file
    const fileBuffer = await readFile(filePath);
    
    // Log download for analytics
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    console.log(`macOS download requested from IP: ${clientIP}`);
    
    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="CrowsEye-Marketing-Tool-macOS-Installer.sh"',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving macOS download:', error);
    
    // Return a fallback download link or error
    return NextResponse.json(
      { 
        error: 'Download temporarily unavailable',
        message: 'Please try again later or contact support',
        platform: 'macOS',
        fallback: 'https://github.com/your-repo/releases/latest'
      },
      { status: 500 }
    );
  }
} 