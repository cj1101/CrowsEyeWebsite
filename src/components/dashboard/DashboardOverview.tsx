'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  CloudArrowUpIcon,
  PlusIcon,
  SparklesIcon,
  ChartBarIcon,
  PhotoIcon,
  DocumentTextIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { useMediaStore } from '@/stores/mediaStore';
import { usePostStore } from '@/stores/postStore';
import { apiService } from '@/services/api';

interface QuickStats {
  totalMedia: number;
  totalPosts: number;
  scheduledPosts: number;
  totalEngagement: number;
  recentActivity: Array<{
    id: string;
    type: 'upload' | 'post' | 'ai_generation' | 'schedule';
    title: string;
    timestamp: Date;
    details: string;
  }>;
}

export default function DashboardOverview() {
  const router = useRouter();
  const { files } = useMediaStore();
  const { posts } = usePostStore();
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState({
    tiktok: false,
    instagram: false
  });

  useEffect(() => {
    fetchDashboardStats();
    checkConnectionStatus();
  }, []);

  // Also check connection status when we return from auth
  useEffect(() => {
    const timer = setTimeout(() => {
      checkConnectionStatus();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const checkConnectionStatus = () => {
    // Check if tokens exist in cookies
    const checkCookie = (name: string) => {
      return document.cookie.split(';').some(cookie => 
        cookie.trim().startsWith(`${name}=`)
      );
    };

    setConnections({
      tiktok: checkCookie('tiktok_access_token'),
      instagram: checkCookie('instagram_access_token')
    });
  };

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from the API
      // For now, we'll simulate with local data and some mock API calls
      const mockStats: QuickStats = {
        totalMedia: files.length,
        totalPosts: posts.length,
        scheduledPosts: posts.filter(p => p.status === 'scheduled').length,
        totalEngagement: 7500, // Use fixed value to avoid hydration issues
        recentActivity: [
          {
            id: '1',
            type: 'upload',
            title: 'New video uploaded',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            details: 'vacation-highlights.mp4 (45MB)'
          },
          {
            id: '2',
            type: 'ai_generation',
            title: 'AI highlight generated',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            details: 'Created 30s highlight from beach-day.mp4'
          },
          {
            id: '3',
            type: 'post',
            title: 'Post published',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
            details: 'Instagram story about weekend adventures'
          },
          {
            id: '4',
            type: 'schedule',
            title: 'Post scheduled',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
            details: 'Facebook post for tomorrow 9 AM'
          }
        ]
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload': return CloudArrowUpIcon;
      case 'post': return DocumentTextIcon;
      case 'ai_generation': return SparklesIcon;
      case 'schedule': return CalendarIcon;
      default: return DocumentTextIcon;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'upload': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'post': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'ai_generation': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
      case 'schedule': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  // Navigation handlers
  const handleUploadMedia = () => {
    router.push('/marketing-tool?tab=library');
  };

  const handleCreatePost = () => {
    router.push('/marketing-tool?tab=create');
  };

  const handleGenerateHighlight = () => {
    router.push('/marketing-tool?tab=tools&tool=highlight-reel');
  };

  const handleViewAnalytics = () => {
    router.push('/marketing-tool?tab=analytics');
  };

  const handleActivityClick = (activity: any) => {
    switch (activity.type) {
      case 'upload':
        router.push('/marketing-tool?tab=library');
        break;
      case 'post':
        router.push('/marketing-tool?tab=create');
        break;
      case 'ai_generation':
        router.push('/marketing-tool?tab=tools');
        break;
      case 'schedule':
        router.push('/marketing-tool?tab=schedule');
        break;
      default:
        router.push('/marketing-tool');
    }
  };

  const handleViewAllActivity = () => {
    router.push('/marketing-tool?tab=analytics&view=activity');
  };

  const handleViewDetailedAnalytics = () => {
    router.push('/marketing-tool?tab=analytics');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          onClick={() => router.push('/marketing-tool?tab=library')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Media Files</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalMedia}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Photos, videos & audio
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <PhotoIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          onClick={() => router.push('/marketing-tool?tab=create')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalPosts}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created this month
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          onClick={() => router.push('/marketing-tool?tab=schedule')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.scheduledPosts}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ready to publish
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          onClick={() => router.push('/marketing-tool?tab=analytics')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Engagement</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalEngagement.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                +12.5% this week
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <button 
              onClick={handleUploadMedia}
              className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
            >
              <CloudArrowUpIcon className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Media</span>
            </button>

            <button 
              onClick={handleCreatePost}
              className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
            >
              <PlusIcon className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Create Post</span>
            </button>

            <button 
              onClick={handleGenerateHighlight}
              className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
            >
              <SparklesIcon className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Generate Highlight</span>
            </button>

            <button 
              onClick={handleViewAnalytics}
              className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
            >
              <ChartBarIcon className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View Analytics</span>
            </button>

            <button
              onClick={() => connections.tiktok ? null : window.open('/api/auth/tiktok/start', '_self')}
              className={`flex flex-col items-center p-4 border-2 rounded-lg transition-all duration-200 ${
                connections.tiktok 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 cursor-default' 
                  : 'border-dashed border-gray-300 dark:border-gray-600 hover:border-black dark:hover:border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900/30 cursor-pointer'
              }`}
            >
              {connections.tiktok ? (
                <>
                  <div className="flex items-center mb-2">
                    <span className="text-xl">🎵</span>
                    <svg className="w-4 h-4 text-green-500 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Connected to TikTok</span>
                </>
              ) : (
                <>
                  <span className="text-2xl mb-2">🎵</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Connect TikTok</span>
                </>
              )}
            </button>

            <button
              onClick={() => connections.instagram ? null : window.open('/api/auth/instagram/start', '_self')}
              className={`flex flex-col items-center p-4 border-2 rounded-lg transition-all duration-200 ${
                connections.instagram 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 cursor-default' 
                  : 'border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer'
              }`}
            >
              {connections.instagram ? (
                <>
                  <div className="flex items-center mb-2">
                    <span className="text-xl">📷</span>
                    <svg className="w-4 h-4 text-green-500 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Connected to Instagram</span>
                </>
              ) : (
                <>
                  <span className="text-2xl mb-2">📷</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Connect Instagram</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              const colorClasses = getActivityColor(activity.type);
              
              return (
                <div 
                  key={activity.id} 
                  onClick={() => handleActivityClick(activity)}
                  className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 p-2 rounded-lg transition-colors"
                >
                  <div className={`flex-shrink-0 p-2 rounded-lg ${colorClasses}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {activity.details}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={handleViewAllActivity}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              View all activity →
            </button>
          </div>
        </motion.div>
      </div>

      {/* Performance Metrics Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Performance Overview
          </h3>
          <button 
            onClick={handleViewDetailedAnalytics}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            View detailed analytics →
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 p-2 rounded-lg transition-colors" onClick={handleViewAnalytics}>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">+24%</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Engagement Rate</p>
          </div>
          <div className="text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 p-2 rounded-lg transition-colors" onClick={handleViewAnalytics}>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">2.3K</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">New Followers</p>
          </div>
          <div className="text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 p-2 rounded-lg transition-colors" onClick={handleViewAnalytics}>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">89%</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Content Score</p>
          </div>
          <div className="text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 p-2 rounded-lg transition-colors" onClick={handleViewAnalytics}>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">4.7</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Avg. Rating</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 