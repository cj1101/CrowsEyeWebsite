import { useState, useEffect } from 'react';

export interface AnalyticsData {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  engagementRate: number;
  topPosts: Array<{
    id: string;
    title: string;
    views: number;
    likes: number;
    platform: string;
  }>;
  platformStats: Array<{
    platform: string;
    posts: number;
    engagement: number;
  }>;
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data for static site
    const mockData: AnalyticsData = {
      totalPosts: 156,
      totalViews: 45230,
      totalLikes: 3420,
      totalComments: 892,
      engagementRate: 8.7,
      topPosts: [
        { id: '1', title: 'Summer Campaign Launch', views: 2340, likes: 156, platform: 'Instagram' },
        { id: '2', title: 'Product Showcase Video', views: 1890, likes: 134, platform: 'Facebook' },
        { id: '3', title: 'Behind the Scenes', views: 1560, likes: 98, platform: 'Instagram' }
      ],
      platformStats: [
        { platform: 'Instagram', posts: 89, engagement: 9.2 },
        { platform: 'Facebook', posts: 45, engagement: 7.8 },
        { platform: 'Twitter', posts: 22, engagement: 6.5 }
      ]
    };

    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 500);
  }, []);

  return { data, loading, error };
} 