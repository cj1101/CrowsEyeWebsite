import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const db = getFirestore();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // image, video, audio
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let query = db.collection('media')
      .where('userId', '==', userId)
      .orderBy('uploadedAt', 'desc')
      .limit(limit);

    if (type) {
      query = query.where('type', '==', type);
    }

    const snapshot = await query.get();
    const mediaFiles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt?.toDate?.()?.toISOString() || doc.data().uploadedAt,
    }));

    return NextResponse.json({ mediaFiles });

  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const tags = formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [];

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const db = getFirestore();
    const storage = getStorage();
    const bucket = storage.bucket();

    // Check user's storage quota
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const plan = userData?.plan || 'free';
    
    const storageQuotas = {
      free: 1024, // 1GB in MB
      creator: 10240, // 10GB in MB
      growth: 51200, // 50GB in MB
      pro: 204800 // 200GB in MB
    };

    const quota = storageQuotas[plan as keyof typeof storageQuotas] || storageQuotas.free;
    const currentUsage = userData?.storageUsed || 0;
    const fileSizeMB = file.size / (1024 * 1024);

    if (currentUsage + fileSizeMB > quota) {
      return NextResponse.json({ error: 'Storage quota exceeded' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${userId}/${timestamp}.${extension}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Firebase Storage
    const fileRef = bucket.file(filename);
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          uploadedBy: userId,
          originalName: file.name,
        }
      }
    });

    // Make file publicly readable
    await fileRef.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    // Determine file type category
    const typeCategory = file.type.startsWith('image/') ? 'image' : 
                        file.type.startsWith('video/') ? 'video' : 'other';

    // Save metadata to Firestore
    const mediaData = {
      userId,
      filename: file.name,
      title: title || file.name,
      url: publicUrl,
      type: typeCategory,
      mimeType: file.type,
      size: file.size,
      tags,
      uploadedAt: new Date(),
    };

    const docRef = await db.collection('media').add(mediaData);

    // Update user's storage usage
    await db.collection('users').doc(userId).update({
      storageUsed: currentUsage + fileSizeMB,
      lastActivity: new Date()
    });

    return NextResponse.json({
      id: docRef.id,
      ...mediaData,
      uploadedAt: mediaData.uploadedAt.toISOString(),
    });

  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('id');

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    const db = getFirestore();
    const storage = getStorage();
    const bucket = storage.bucket();

    // Get media document
    const mediaDoc = await db.collection('media').doc(mediaId).get();
    if (!mediaDoc.exists || mediaDoc.data()?.userId !== userId) {
      return NextResponse.json({ error: 'Media not found or unauthorized' }, { status: 404 });
    }

    const mediaData = mediaDoc.data();
    
    // Extract filename from URL
    const filename = mediaData?.url?.split('/').pop();
    
    if (filename) {
      // Delete from storage
      const fileRef = bucket.file(`${userId}/${filename}`);
      try {
        await fileRef.delete();
      } catch (error) {
        console.warn('Failed to delete file from storage:', error);
      }
    }

    // Delete from Firestore
    await db.collection('media').doc(mediaId).delete();

    // Update user's storage usage
    if (mediaData?.size) {
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      const currentUsage = userData?.storageUsed || 0;
      const fileSizeMB = mediaData.size / (1024 * 1024);
      
      await db.collection('users').doc(userId).update({
        storageUsed: Math.max(0, currentUsage - fileSizeMB),
        lastActivity: new Date()
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 