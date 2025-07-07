'use client';

import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  UserGroupIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  totalPosts: number;
  totalReach: number;
  totalEngagement: number;
  totalFollowers: number;
  engagementRate: number;
  growthRate: number;
}

interface PlatformData {
  platform: string;
  icon: string;
  posts: number;
  reach: number;
  engagement: number;
  engagementRate: number;
  followers: number;
  growth: number;
  color: string;
}

interface PostData {
  id: string;
  title: string;
  platform: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
}

const mockAnalytics: AnalyticsData = {
  totalPosts: 247,
  totalReach: 125300,
  totalEngagement: 5240,
  totalFollowers: 8900,
  engagementRate: 4.2,
  growthRate: 12.5
};

const mockPlatformData: PlatformData[] = [
  {
    platform: 'Instagram',
    icon: '📷',
    posts: 89,
    reach: 45200,
    engagement: 2620,
    engagementRate: 5.8,
    followers: 3400,
    growth: 18.2,
    color: 'from-pink-500 to-rose-500'
  },
  {
    platform: 'Facebook',
    icon: '👥',
    posts: 67,
    reach: 38900,
    engagement: 1245,
    engagementRate: 3.2,
    followers: 2800,
    growth: 8.7,
    color: 'from-blue-600 to-blue-700'
  },
  {
    platform: 'Twitter',
    icon: '🐦',
    posts: 91,
    reach: 41200,
    engagement: 865,
    engagementRate: 2.1,
    followers: 2700,
    growth: 15.3,
    color: 'from-sky-500 to-blue-500'
  }
];

const mockTopPosts: PostData[] = [
  {
    id: '1',
    title: 'Summer Collection Launch',
    platform: 'Instagram',
    publishedAt: '2024-01-15',
    views: 15400,
    likes: 892,
    comments: 67,
    shares: 34,
    engagementRate: 6.4
  },
  {
    id: '2',
    title: 'Behind the Scenes Video',
    platform: 'Facebook',
    publishedAt: '2024-01-14',
    views: 12800,
    likes: 756,
    comments: 89,
    shares: 45,
    engagementRate: 7.0
  },
  {
    id: '3',
    title: 'Customer Testimonial',
    platform: 'Twitter',
    publishedAt: '2024-01-13',
    views: 9600,
    likes: 634,
    comments: 23,
    shares: 78,
    engagementRate: 7.7
  }
];

export default function AnalyticsTab() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
    ) : (
      <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-gray-400 mt-1">Track your social media performance and insights</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="twitter">Twitter</option>
          </select>
          
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 flex items-center gap-2 transition-all">
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Total Posts</h3>
            <ChartBarIcon className="h-5 w-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white">{mockAnalytics.totalPosts}</p>
          <div className="flex items-center gap-1 mt-2">
            {getGrowthIcon(mockAnalytics.growthRate)}
            <span className={`text-sm ${getGrowthColor(mockAnalytics.growthRate)}`}>
              +{mockAnalytics.growthRate}% from last month
            </span>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Total Reach</h3>
            <EyeIcon className="h-5 w-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white">{formatNumber(mockAnalytics.totalReach)}</p>
          <div className="flex items-center gap-1 mt-2">
            {getGrowthIcon(18)}
            <span className="text-sm text-green-400">+18% from last month</span>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Engagement Rate</h3>
            <HeartIcon className="h-5 w-5 text-red-400" />
          </div>
          <p className="text-3xl font-bold text-white">{mockAnalytics.engagementRate}%</p>
          <div className="flex items-center gap-1 mt-2">
            {getGrowthIcon(0.8)}
            <span className="text-sm text-green-400">+0.8% from last month</span>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Total Followers</h3>
            <UserGroupIcon className="h-5 w-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white">{formatNumber(mockAnalytics.totalFollowers)}</p>
          <div className="flex items-center gap-1 mt-2">
            {getGrowthIcon(156)}
            <span className="text-sm text-green-400">+156 from last month</span>
          </div>
        </div>
      </div>

      {/* Platform Performance */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Platform Performance</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {mockPlatformData.map((platform) => (
            <div key={platform.platform} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${platform.color}`}>
                  <span className="text-xl">{platform.icon}</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">{platform.platform}</h4>
                  <p className="text-sm text-gray-400">{platform.posts} posts</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Reach</span>
                  <span className="text-white font-medium">{formatNumber(platform.reach)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Engagement</span>
                  <span className="text-white font-medium">{formatNumber(platform.engagement)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Engagement Rate</span>
                  <span className="text-white font-medium">{platform.engagementRate}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Followers</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{formatNumber(platform.followers)}</span>
                    <div className="flex items-center gap-1">
                      {getGrowthIcon(platform.growth)}
                      <span className={`text-xs ${getGrowthColor(platform.growth)}`}>
                        +{platform.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${platform.color} h-2 rounded-full`}
                  style={{ width: `${Math.min(platform.engagementRate * 10, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Posts */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Top Performing Posts</h3>
        
        <div className="space-y-4">
          {mockTopPosts.map((post, index) => (
            <div key={post.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-bold text-sm">
                  {index + 1}
                </div>
                
                <div>
                  <h4 className="text-white font-medium">{post.title}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                    <span>{post.platform}</span>
                    <span>•</span>
                    <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{formatNumber(post.views)} views</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-white">{formatNumber(post.views)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <HeartIcon className="h-4 w-4 text-red-400" />
                    <span className="text-white">{formatNumber(post.likes)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <ChatBubbleLeftIcon className="h-4 w-4 text-blue-400" />
                    <span className="text-white">{post.comments}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <ShareIcon className="h-4 w-4 text-green-400" />
                    <span className="text-white">{post.shares}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-white font-medium">{post.engagementRate}%</p>
                  <p className="text-xs text-gray-400">engagement</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Trends Chart Placeholder */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Engagement Trends</h3>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-400">Last 30 days</span>
          </div>
        </div>
        
        <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <ChartBarIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Chart visualization would be implemented here</p>
            <p className="text-sm text-gray-500 mt-2">Integration with charting library like Chart.js or Recharts</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all">
          <ChartBarIcon className="h-6 w-6 mx-auto mb-2" />
          <p className="font-medium">Detailed Report</p>
        </button>
        
        <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all">
          <ArrowTrendingUpIcon className="h-6 w-6 mx-auto mb-2" />
          <p className="font-medium">Growth Analysis</p>
        </button>
        
        <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all">
          <FunnelIcon className="h-6 w-6 mx-auto mb-2" />
          <p className="font-medium">Audience Insights</p>
        </button>
      </div>
    </div>
  );
} 