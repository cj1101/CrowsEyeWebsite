import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Make sure Next treats this route as fully dynamic (no static optimization),
// otherwise `params` becomes a Promise in static export builds.
export const dynamic = 'force-dynamic';

// GET /api/media-proxy/:id – streams a protected media file from the backend while attaching the user token
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // In certain build modes (e.g. static export) `params` is a Promise and must be awaited.
  const { id } = await (params as any);
  const backendBase = process.env.NEXT_PUBLIC_API_URL || 'https://crow-eye-api-dot-crows-eye-website.uc.r.appspot.com';

  console.log(`[media-proxy] Request for media ID: ${id}`);

  // Accept token either via query param (client-side) or cookie (SSR)
  let token = req.nextUrl.searchParams.get('token') || '';
  if (!token) {
    token = req.cookies.get('auth_token')?.value || '';
  }
  if (!token) {
    // Also check Authorization header as fallback
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    console.error(`[media-proxy] No auth token found for media ${id}`);
    return NextResponse.json({ error: 'Missing auth token' }, { status: 401 });
  }

  console.log(`[media-proxy] Token found for media ${id}, length: ${token.length}`);

  try {
    // First, try to get the media info to check if it's a direct Google Cloud Storage URL
    console.log(`[media-proxy] Getting media info for ${id} from backend...`);
    const mediaInfoUrl = `${backendBase}/api/v1/media/${id}`;
    
    const mediaInfoRes = await fetch(mediaInfoUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (mediaInfoRes.ok) {
      const mediaInfo = await mediaInfoRes.json();
      console.log(`[media-proxy] Media info retrieved:`, {
        id: mediaInfo.id,
        filename: mediaInfo.filename,
        gcs_path: mediaInfo.gcs_path,
        url: mediaInfo.url,
        media_type: mediaInfo.media_type
      });

      // Check if we have a direct Google Cloud Storage URL
      const directUrl = mediaInfo.url || mediaInfo.public_url || mediaInfo.cdn_url || mediaInfo.gcs_path;
      if (directUrl && (directUrl.includes('storage.googleapis.com') || directUrl.includes('storage.cloud.google.com'))) {
        console.log(`[media-proxy] Direct Google Cloud Storage URL found: ${directUrl}`);
        
        // Fetch directly from Google Cloud Storage
        const gcsRes = await fetch(directUrl, {
          cache: 'no-store',
        });

        if (gcsRes.ok) {
          console.log(`[media-proxy] Successfully fetched from Google Cloud Storage`);
          const headers = new Headers();
          headers.set('Content-Type', gcsRes.headers.get('Content-Type') || 'application/octet-stream');
          headers.set('Cache-Control', 'public, max-age=31536000');
          
          const arrayBuffer = await gcsRes.arrayBuffer();
          return new NextResponse(Buffer.from(arrayBuffer), {
            status: 200,
            headers,
          });
        } else {
          console.error(`[media-proxy] Failed to fetch from Google Cloud Storage: ${gcsRes.status} ${gcsRes.statusText}`);
        }
      }
    } else {
      console.warn(`[media-proxy] Failed to get media info: ${mediaInfoRes.status} ${mediaInfoRes.statusText}`);
    }

    // Fallback to the download endpoint
    console.log(`[media-proxy] Falling back to download endpoint for media ${id}`);
    const upstreamUrl = `${backendBase}/api/v1/media/${id}/download`;
    
    const upstreamRes = await fetch(upstreamUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // Ensure we stream the body
      cache: 'no-store',
    });

    if (!upstreamRes.ok) {
      const text = await upstreamRes.text();
      console.error(`[media-proxy] upstream error for ${upstreamUrl}:`, {
        status: upstreamRes.status,
        statusText: upstreamRes.statusText,
        responseText: text,
        url: upstreamUrl
      });
      
      return NextResponse.json({ 
        error: 'Upstream error', 
        status: upstreamRes.status, 
        statusText: upstreamRes.statusText,
        url: upstreamUrl,
        details: text,
        mediaId: id
      }, { status: upstreamRes.status });
    }

    console.log(`[media-proxy] Successfully fetched media ${id} from download endpoint`);

    // Forward content type and length
    const headers = new Headers(upstreamRes.headers);
    headers.set('Cache-Control', 'public, max-age=31536000');
    const arrayBuffer = await upstreamRes.arrayBuffer();

    return new NextResponse(Buffer.from(arrayBuffer), {
      status: upstreamRes.status,
      headers,
    });
  } catch (err: any) {
    console.error(`[media-proxy] fetch error for media ${id}:`, {
      message: err?.message,
      stack: err?.stack,
      name: err?.name
    });
    
    return NextResponse.json({ 
      error: 'Proxy failed', 
      message: err?.message,
      mediaId: id,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 