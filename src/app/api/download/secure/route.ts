import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import fs from 'fs';
import path from 'path';

// Download configuration
const DOWNLOAD_CONFIG = {
  'web-installer': {
    filename: 'CrowsEye-WebInstaller.exe',
    contentType: 'application/octet-stream',
    description: 'Crow\'s Eye Marketing Suite Web Installer'
  },
  'full-app': {
    filename: 'CrowsEye.exe',
    contentType: 'application/octet-stream',
    description: 'Crow\'s Eye Marketing Suite Full Application'
  },
  'metadata': {
    filename: 'installer_metadata.json',
    contentType: 'application/json',
    description: 'Installer Metadata'
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userAgent = request.headers.get('user-agent') || '';
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Validate download type
    if (!type || !DOWNLOAD_CONFIG[type as keyof typeof DOWNLOAD_CONFIG]) {
      return NextResponse.json(
        { error: 'Invalid download type' },
        { status: 400 }
      );
    }

    const config = DOWNLOAD_CONFIG[type as keyof typeof DOWNLOAD_CONFIG];
    const filePath = path.join(process.cwd(), 'public', 'downloads', config.filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Download file not found: ${filePath}`);
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Log download attempt
    console.log(`Download request: ${type} from ${clientIP} (${userAgent})`);

    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    const fileStats = fs.statSync(filePath);

    // Create response with proper headers
    const response = new NextResponse(fileBuffer);
    
    // Set security headers
    response.headers.set('Content-Type', config.contentType);
    response.headers.set('Content-Disposition', `attachment; filename="${config.filename}"`);
    response.headers.set('Content-Length', fileStats.size.toString());
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // Add security headers to prevent malware detection issues
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Add custom headers for identification
    response.headers.set('X-Download-Source', 'crows-eye-official');
    response.headers.set('X-File-Description', config.description);
    response.headers.set('X-Publisher', 'Crow\'s Eye Technologies');

    return response;

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, userInfo } = body;

    // Log download with user info for analytics
    console.log('Download analytics:', {
      type,
      userInfo,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Download analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to log download' },
      { status: 500 }
    );
  }
} 