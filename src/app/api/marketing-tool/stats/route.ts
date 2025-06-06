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
    
    // Get user profile
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user posts from Firestore
    const postsSnapshot = await db.collection('posts')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    
    // Get analytics data
    const analyticsSnapshot = await db.collection('analytics')
      .where('userId', '==', userId)
      .get();

    const analytics = analyticsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

    // Calculate stats
    const totalPosts = posts.length;
    const scheduledPosts = posts.filter((post: any) => 
      post.status === 'scheduled' && new Date(post.scheduledTime) > new Date()
    ).length;
    
    const aiGenerated = posts.filter((post: any) => post.isAiGenerated).length;
    
    // Calculate engagement rate
    const totalEngagements = analytics.reduce((sum: number, entry: any) => sum + (entry.engagements || 0), 0);
    const totalImpressions = analytics.reduce((sum: number, entry: any) => sum + (entry.impressions || 0), 0);
    const engagementRate = totalImpressions > 0 ? Math.round((totalEngagements / totalImpressions) * 100) : 0;

    // Get social accounts count
    const socialAccounts = userData.connectedAccounts ? Object.keys(userData.connectedAccounts).length : 0;
    
    // Get media files count
    const mediaSnapshot = await db.collection('media')
      .where('userId', '==', userId)
      .get();
    const mediaFiles = mediaSnapshot.size;

    // Calculate usage based on plan
    const plan = userData.plan || 'free';
    const planLimits = {
      free: { aiCredits: 50, storage: 1024 }, // 1GB in MB
      creator: { aiCredits: 300, storage: 10240 }, // 10GB in MB
      growth: { aiCredits: 600, storage: 51200 }, // 50GB in MB
      pro: { aiCredits: 1000, storage: 204800 } // 200GB in MB
    };

    const currentLimit = planLimits[plan as keyof typeof planLimits] || planLimits.free;
    const aiCreditsUsed = userData.aiCreditsUsed || 0;
    const aiCreditsRemaining = Math.max(0, currentLimit.aiCredits - aiCreditsUsed);
    
    // Calculate AI edits remaining (assuming 1 edit per 10 credits)
    const aiEditsRemaining = Math.floor(aiCreditsRemaining / 10);

    // Generate recent activity
    const recentActivity = posts.slice(0, 5).map((post: any) => ({
      id: post.id,
      action: `Created ${post.platform} post: "${post.content?.substring(0, 50) || 'Untitled'}..."`,
      timestamp: new Date(post.createdAt).toLocaleDateString(),
      type: post.status === 'published' ? 'success' : 'info'
    }));

    // Add some system activities
    if (userData.lastLogin) {
      recentActivity.push({
        id: 'login-' + Date.now(),
        action: 'Logged into Marketing Tool',
        timestamp: new Date(userData.lastLogin).toLocaleDateString(),
        type: 'info'
      });
    }

    const stats = {
      totalPosts,
      scheduledPosts,
      aiGenerated,
      engagementRate,
      socialAccounts,
      mediaFiles,
      recentActivity,
      subscriptionTier: plan,
      aiCreditsRemaining,
      aiEditsRemaining,
      storageUsed: userData.storageUsed || 0,
      storageLimit: currentLimit.storage
    };

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Error fetching marketing tool stats:', error);
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

    const { action, data } = await request.json();

    const db = getFirestore();

    switch (action) {
      case 'updateUsage':
        await db.collection('users').doc(userId).update({
          aiCreditsUsed: data.aiCreditsUsed,
          storageUsed: data.storageUsed,
          lastActivity: new Date().toISOString()
        });
        break;

      case 'trackEngagement':
        await db.collection('analytics').add({
          userId,
          postId: data.postId,
          platform: data.platform,
          impressions: data.impressions || 0,
          engagements: data.engagements || 0,
          clicks: data.clicks || 0,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating marketing tool stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 