'use client';

import React from 'react';
import { useAnalytics } from '@/hooks/api/useAnalytics';

export default function AnalyticsTab() {
  const { data: analytics, loading, error } = useAnalytics();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Error loading analytics: {error}</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Analytics Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">
            View detailed analytics and export data for reporting.
          </p>
          <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Pro+ Feature
          </div>
        </div>
      </div>

      {/* Analytics Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Total Posts</h3>
          <p className="text-2xl font-bold text-white">{analytics.totalPosts}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Total Views</h3>
          <p className="text-2xl font-bold text-white">{analytics.totalViews.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Total Likes</h3>
          <p className="text-2xl font-bold text-white">{analytics.totalLikes.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Engagement Rate</h3>
          <p className="text-2xl font-bold text-white">{analytics.engagementRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Top Posts</h3>
          <div className="space-y-3">
            {analytics.topPosts.map((post) => (
              <div key={post.id} className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">{post.title}</p>
                  <p className="text-sm text-gray-400">{post.platform}</p>
                </div>
                <div className="text-right">
                  <p className="text-white">{post.views} views</p>
                  <p className="text-sm text-gray-400">{post.likes} likes</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Platform Stats</h3>
          <div className="space-y-3">
            {analytics.platformStats.map((platform) => (
              <div key={platform.platform} className="flex justify-between items-center">
                <p className="text-white font-medium">{platform.platform}</p>
                <div className="text-right">
                  <p className="text-white">{platform.posts} posts</p>
                  <p className="text-sm text-gray-400">{platform.engagement}% engagement</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 