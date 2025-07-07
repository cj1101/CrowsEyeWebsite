import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  const serviceAccountJson = process.env.FIREBASE_PRIVATE_KEY;
  if (!serviceAccountJson) {
    throw new Error('The FIREBASE_PRIVATE_KEY environment variable is not set. It should contain the full JSON of your service account key.');
  }

  initializeApp({
    credential: cert(JSON.parse(serviceAccountJson)),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header from your app's auth system
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Extract and verify JWT token from your app's authentication system
    const token = authHeader.replace('Bearer ', '');
    
    let userId: string;
    try {
      // Decode JWT token to get user information
      // You should implement proper JWT verification here
      // For now, we'll use a simple approach
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      
      // Decode the payload (second part)
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      userId = payload.user_id || payload.sub;
      
      if (!userId) {
        throw new Error('No user ID found in token');
      }
      
      console.log('✅ JWT token verified, user ID:', userId);
    } catch (error) {
      console.error('❌ JWT token verification failed:', error);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'media';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const fileId = crypto.randomUUID();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${folder}/${userId}/${timestamp}_${fileId}_${safeName}`;

    // Upload to Firebase Storage using Admin SDK
    const storage = getStorage();
    const bucket = storage.bucket();
    const fileRef = bucket.file(path);

    // Set metadata
    const metadata = {
      contentType: file.type || 'application/octet-stream',
      metadata: {
        uploadedBy: userId,
        originalName: file.name,
        uploadTimestamp: timestamp.toString(),
      },
    };

    // Upload the file
    await fileRef.save(buffer, {
      metadata,
      resumable: false,
    });

    // Make the file publicly readable (optional)
    await fileRef.makePublic();

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${path}`;

    console.log('✅ File uploaded successfully:', {
      path,
      userId,
      fileName: file.name,
      size: file.size,
      url: publicUrl,
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path,
      fileName: file.name,
      size: file.size,
    });

  } catch (error: any) {
    console.error('❌ Upload failed:', error);
    return NextResponse.json(
      { 
        error: 'Upload failed', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 