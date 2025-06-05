'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  EyeIcon, 
  HeartIcon,
  CalendarIcon,
  UserGroupIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

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

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/marketing-tool/analytics?userId=demo-user');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Analytics Dashboard</h2>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Analytics Dashboard</h2>
        <div className="text-center py-8 text-gray-400">
          <p>Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  const platformColors = {
    instagram: 'from-pink-600 to-purple-600',
    facebook: 'from-blue-600 to-blue-700',
    twitter: 'from-sky-500 to-blue-600',
    linkedin: 'from-blue-700 to-indigo-700',
    tiktok: 'from-black to-gray-800',
    youtube: 'from-red-600 to-red-700'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Analytics Dashboard</h2>
        
        {/* Time Range Selector */}
        <div className="flex space-x-2">
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '90d', label: '90 Days' }
          ].map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id as '7d' | '30d' | '90d')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                timeRange === range.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Posts</p>
              <p className="text-3xl font-bold">{analytics.totalPosts}</p>
              <p className="text-blue-200 text-sm">All time</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">This Month</p>
              <p className="text-3xl font-bold">{analytics.thisMonth}</p>
              <p className="text-green-200 text-sm">Posts created</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Avg. Impressions</p>
              <p className="text-3xl font-bold">{analytics.engagementMetrics.averageImpressions.toLocaleString()}</p>
              <p className="text-purple-200 text-sm">Per post</p>
            </div>
            <EyeIcon className="h-8 w-8 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Engagement Rate</p>
              <p className="text-3xl font-bold">{analytics.engagementMetrics.averageEngagementRate}%</p>
              <p className="text-orange-200 text-sm">Average</p>
            </div>
            <HeartIcon className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Platform Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(analytics.platformBreakdown).map(([platform, count]) => (
              <div key={platform} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${
                    platformColors[platform as keyof typeof platformColors] || 'from-gray-500 to-gray-600'
                  }`}></div>
                  <span className="text-white capitalize">{platform}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300">{count} posts</span>
                  <div className="w-20 bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${
                        platformColors[platform as keyof typeof platformColors] || 'from-gray-500 to-gray-600'
                      }`}
                      style={{ width: `${(count / analytics.totalPosts) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-600/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FireIcon className="h-6 w-6 text-orange-400" />
                <span className="text-white">Top Platform</span>
              </div>
              <span className="text-orange-400 font-semibold capitalize">
                {analytics.engagementMetrics.topPerformingPlatform}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-600/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-400" />
                <span className="text-white">Growth Trend</span>
              </div>
              <span className="text-green-400 font-semibold">+15.2%</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-600/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <UserGroupIcon className="h-6 w-6 text-blue-400" />
                <span className="text-white">Reach</span>
              </div>
              <span className="text-blue-400 font-semibold">12.5K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity (Last 7 Days)</h3>
        <div className="grid grid-cols-7 gap-2">
          {analytics.recentActivity.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-400 mb-2">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="bg-gray-600 rounded-lg p-3">
                <div className="text-white font-semibold">{day.posts}</div>
                <div className="text-xs text-gray-400">posts</div>
                <div className="mt-2 h-2 bg-gray-700 rounded-full">
                  <div 
                    className="h-2 bg-primary-500 rounded-full"
                    style={{ width: `${Math.min(day.engagement, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Super User Analytics */}
      {user && (user as any).isSuperUser && (
        <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border border-red-500/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
            <FireIcon className="h-6 w-6 mr-2" />
            🔥 Super User Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-red-300">
            <div>
              <p className="text-sm text-red-400">Advanced Analytics</p>
              <p className="font-semibold">Enabled</p>
            </div>
            <div>
              <p className="text-sm text-red-400">All Platform Access</p>
              <p className="font-semibold">Enabled</p>
            </div>
            <div>
              <p className="text-sm text-red-400">Premium AI Models</p>
              <p className="font-semibold">Enabled</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 