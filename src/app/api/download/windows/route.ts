import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    // Path to the ZIP package containing the script and the double-click shortcut
    const filePath = join(process.cwd(), 'public', 'downloads', 'CrowsEye-Installer.zip');
    
    // Read the file
    const fileBuffer = await readFile(filePath);
    
    // Log download for analytics
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    console.log(`Windows ZIP Installer package requested from IP: ${clientIP}`);
    console.log(`Serving file: ${filePath}`);
    console.log(`File size: ${fileBuffer.length} bytes`);
    
    // Return the ZIP file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="CrowsEye-Installer.zip"',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-File-Type': 'zip-package',
        'X-Install-Method': 'zip-shortcut-powershell',
        'X-SmartScreen-Safe': 'true',
      },
    });
  } catch (error) {
    console.error('Error serving Windows ZIP installer:', error);
    
    // Return a fallback download link or error
    return NextResponse.json(
      { 
        error: 'Download temporarily unavailable',
        message: 'Please try again later or contact support',
        platform: 'Windows',
        method: 'ZIP Package Installer',
        fallback: 'https://github.com/your-repo/releases/latest'
      },
      { status: 500 }
    );
  }
} 