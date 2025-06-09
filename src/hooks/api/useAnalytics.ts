import { useState, useEffect } from 'react';
import { crowsEyeAPI, AnalyticsData as ApiAnalyticsData } from '@/lib/api';

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

function mapApiAnalyticsToAnalyticsData(apiData: ApiAnalyticsData): AnalyticsData {
  return {
    totalPosts: apiData.total_posts,
    totalViews: apiData.total_engagement, // Using engagement as views for now
    totalLikes: Math.floor(apiData.total_engagement * 0.7), // Estimate likes as 70% of engagement
    totalComments: Math.floor(apiData.total_engagement * 0.2), // Estimate comments as 20% of engagement
    engagementRate: apiData.avg_engagement_rate,
    topPosts: apiData.top_performing_content.map((item, index) => ({
      id: item.id,
      title: `Post ${index + 1}`, // API doesn't provide titles, so we generate them
      views: item.engagement,
      likes: Math.floor(item.engagement * 0.7),
      platform: item.platform.charAt(0).toUpperCase() + item.platform.slice(1)
    })),
    platformStats: Object.entries(apiData.platform_breakdown).map(([platform, stats]) => ({
      platform: platform.charAt(0).toUpperCase() + platform.slice(1),
      posts: stats.posts,
      engagement: stats.engagement / stats.posts // Calculate average engagement per post
    }))
  };
}

export function useAnalytics(period: string = '30d', platform?: string) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await crowsEyeAPI.getAnalytics(period);
      
      if (response.error) {
        setError(response.error);
        // Fallback to mock data if API fails
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
            { platform: 'BlueSky', posts: 22, engagement: 6.5 }
          ]
        };
        setData(mockData);
      } else if (response.data) {
        const mappedData = mapApiAnalyticsToAnalyticsData(response.data);
        setData(mappedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period, platform]);

  const exportAnalytics = async (format: string = 'csv') => {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await crowsEyeAPI.exportAnalytics({
        start_date: startDate,
        end_date: endDate,
        format
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const getInsights = async () => {
    try {
      const response = await crowsEyeAPI.getInsights();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const getCompetitorAnalysis = async () => {
    try {
      const response = await crowsEyeAPI.getCompetitorAnalysis();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchAnalytics,
    exportAnalytics,
    getInsights,
    getCompetitorAnalysis
  };
} 