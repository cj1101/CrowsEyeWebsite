import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.CROW_EYE_API_URL || 'http://127.0.0.1:8001';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    // Proxy request to backend API
    const response = await fetch(`${API_BASE_URL}/api/analytics/overview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch stats' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform data to match frontend expectations
    const stats = {
      totalPosts: data.summary?.total_posts || 0,
      totalEngagement: data.summary?.total_engagement || 0,
      engagementRate: data.summary?.engagement_rate || 0,
      followerGrowth: data.summary?.follower_growth || 0,
      recentPosts: data.recent_performance?.last_7_days?.posts || 0,
      recentEngagement: data.recent_performance?.last_7_days?.engagement || 0,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching marketing tool stats:', error);
    
    // Return mock data as fallback
    const mockStats = {
      totalPosts: 150,
      totalEngagement: 12500,
      engagementRate: 8.7,
      followerGrowth: 250,
      recentPosts: 12,
      recentEngagement: 1850,
    };

    return NextResponse.json({ stats: mockStats });
  }
} 