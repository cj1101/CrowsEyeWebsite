import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Mock data structure for stats - will be replaced with real Firebase data
interface UserStats {
  totalPosts: number;
  scheduledPosts: number;
  aiGenerated: number;
  engagementRate: number;
  socialAccounts: number;
  mediaFiles: number;
  recentActivity: Array<{
    id: string;
    action: string;
    timestamp: string;
    type: 'success' | 'info' | 'warning';
  }>;
  subscriptionTier: string;
  aiCreditsRemaining: number;
  aiEditsRemaining: number;
}

export async function GET(request: NextRequest) {
  try {
    // Get the session token from cookies
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value || '';

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return demo stats - TODO: Replace with real Firebase integration
    const stats: UserStats = {
      totalPosts: 0,
      scheduledPosts: 0,
      aiGenerated: 0,
      engagementRate: 0,
      socialAccounts: 0,
      mediaFiles: 0,
      recentActivity: [
        {
          id: '1',
          action: 'Welcome to Crow\'s Eye Marketing Tool!',
          timestamp: new Date().toISOString(),
          type: 'info'
        }
      ],
      subscriptionTier: 'spark',
      aiCreditsRemaining: 50,
      aiEditsRemaining: 5,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching marketing tool stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 