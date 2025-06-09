import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    // Path to the Windows GUI installer executable
    const filePath = join(process.cwd(), 'public', 'downloads', 'CrowsEye-Setup.exe');
    
    // Read the file
    const fileBuffer = await readFile(filePath);
    
    // Log download for analytics
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    console.log(`Windows full installer download requested from IP: ${clientIP}`);
    console.log(`Serving file: ${filePath}`);
    console.log(`File size: ${fileBuffer.length} bytes`);
    
    // Return the file with appropriate headers and cache busting
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="CrowsEye-Setup.exe"',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-File-Type': 'exe',
        'X-Timestamp': new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error serving Windows full installer download:', error);
    
    // Return a fallback download link or error
    return NextResponse.json(
      { 
        error: 'Download temporarily unavailable',
        message: 'Please try again later or contact support',
        platform: 'Windows Full',
        fallback: 'https://github.com/your-repo/releases/latest'
      },
      { status: 500 }
    );
  }
} 