import { NextRequest, NextResponse } from 'next/server';

interface Post {
  createdAt: string;
  platform: string;
}

interface AnalyticsData {
  totalPosts: number;
  thisMonth: number;
  platformBreakdown: Record<string, number>;
  engagementMetrics: {
    averageImpressions: number;
    averageEngagementRate: number;
    topPerformingPlatform: string;
  };
  recentActivity: Array<{
    date: string;
    posts: number;
    engagement: number;
  }>;
}

// Mock data - in production, this would come from a real database
const generateMockAnalytics = (posts: Post[]): AnalyticsData => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthPosts = posts.filter(post => {
    const postDate = new Date(post.createdAt);
    return postDate.getMonth() === currentMonth && postDate.getFullYear() === currentYear;
  });

  const platformBreakdown = posts.reduce((acc, post) => {
    acc[post.platform] = (acc[post.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPerformingPlatform = Object.entries(platformBreakdown)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'instagram';

  // Generate recent activity data (last 7 days)
  const recentActivity = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      date: date.toISOString().split('T')[0],
      posts: Math.floor(Math.random() * 5) + 1,
      engagement: Math.floor(Math.random() * 100) + 50
    };
  }).reverse();

  return {
    totalPosts: posts.length,
    thisMonth: thisMonthPosts.length,
    platformBreakdown,
    engagementMetrics: {
      averageImpressions: 1250,
      averageEngagementRate: 3.2,
      topPerformingPlatform
    },
    recentActivity
  };
};

export async function GET(_request: NextRequest) {
  try {
    // const url = new URL(request.url);
    // const userId = url.searchParams.get('userId') || 'demo-user'; // Reserved for future use

    // In a real app, you'd fetch posts from the database
    // For now, we'll use mock data based on the posts API
    let posts: Post[] = [];
    try {
      // Simulate fetching posts
      posts = [
        { createdAt: '2024-01-15T10:00:00Z', platform: 'instagram' },
        { createdAt: '2024-01-16T14:30:00Z', platform: 'facebook' },
        { createdAt: '2024-01-17T09:15:00Z', platform: 'twitter' },
        { createdAt: '2024-01-18T16:45:00Z', platform: 'linkedin' },
        { createdAt: '2024-01-19T11:20:00Z', platform: 'instagram' },
      ];
    } catch (error) {
      console.error('Error fetching posts for analytics:', error);
    }

    const analytics = generateMockAnalytics(posts);
    
    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Error generating analytics:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
} 