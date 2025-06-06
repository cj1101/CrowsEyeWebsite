import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
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
    const status = searchParams.get('status'); // draft, scheduled, published
    const platform = searchParams.get('platform');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let query = db.collection('posts')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (status) {
      query = query.where('status', '==', status);
    }

    if (platform) {
      query = query.where('platform', '==', platform);
    }

    const snapshot = await query.get();
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      scheduledTime: doc.data().scheduledTime?.toDate?.()?.toISOString() || doc.data().scheduledTime,
    }));

    return NextResponse.json({ posts });

  } catch (error) {
    console.error('Error fetching posts:', error);
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

    const {
      content,
      platform,
      scheduledTime,
      status = 'draft',
      mediaUrls = [],
      isAiGenerated = false,
      aiPrompt = '',
      tags = []
    } = await request.json();

    if (!content || !platform) {
      return NextResponse.json({ error: 'Content and platform are required' }, { status: 400 });
    }

    const db = getFirestore();

    const postData = {
      userId,
      content,
      platform,
      status,
      mediaUrls,
      isAiGenerated,
      aiPrompt,
      tags,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(scheduledTime && { scheduledTime: new Date(scheduledTime) })
    };

    const docRef = await db.collection('posts').add(postData);

    // Update user's AI credits if this was AI generated
    if (isAiGenerated) {
      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      const currentCredits = userData?.aiCreditsUsed || 0;
      
      await db.collection('users').doc(userId).update({
        aiCreditsUsed: currentCredits + 1,
        lastActivity: new Date()
      });
    }

    return NextResponse.json({ 
      id: docRef.id,
      ...postData,
      createdAt: postData.createdAt.toISOString(),
      scheduledTime: postData.scheduledTime?.toISOString()
    });

  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const db = getFirestore();

    // Verify the post belongs to the user
    const postDoc = await db.collection('posts').doc(id).get();
    if (!postDoc.exists || postDoc.data()?.userId !== userId) {
      return NextResponse.json({ error: 'Post not found or unauthorized' }, { status: 404 });
    }

    const updatedData = {
      ...updateData,
      updatedAt: new Date(),
      ...(updateData.scheduledTime && { scheduledTime: new Date(updateData.scheduledTime) })
    };

    await db.collection('posts').doc(id).update(updatedData);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating post:', error);
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
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const db = getFirestore();

    // Verify the post belongs to the user
    const postDoc = await db.collection('posts').doc(postId).get();
    if (!postDoc.exists || postDoc.data()?.userId !== userId) {
      return NextResponse.json({ error: 'Post not found or unauthorized' }, { status: 404 });
    }

    await db.collection('posts').doc(postId).delete();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 