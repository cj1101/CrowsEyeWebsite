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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Clock, 
  Plus,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  XCircle,
  Image as ImageIcon,
  Video,
  Music,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Target,
  Sparkles,
  Crown,
  Star,
  RefreshCw
} from 'lucide-react';

interface DashboardStats {
  totalPosts: number;
  totalEngagement: number;
  totalReach: number;
  totalFollowers: number;
  aiCreditsUsed: number;
  aiCreditsTotal: number;
  scheduledPosts: number;
  connectedPlatforms: number;
}

interface RecentActivity {
  id: string;
  type: 'post' | 'schedule' | 'connect' | 'ai_generate' | 'upload';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'error';
  platform?: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: any;
  action: () => void;
  color: string;
  badge?: string;
}

export default function DashboardOverview() {
  const router = useRouter();
  const { files } = useMediaStore();
  const { posts } = usePostStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalEngagement: 0,
    totalReach: 0,
    totalFollowers: 0,
    aiCreditsUsed: 0,
    aiCreditsTotal: 150,
    scheduledPosts: 0,
    connectedPlatforms: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState({
    tiktok: false,
    instagram: false
  });

  useEffect(() => {
    loadDashboardData();
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

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.warn('No auth token found');
        return;
      }

      // Fetch analytics data from API
      const response = await fetch('/api/analytics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      
      if (data.success) {
        const analytics = data.analytics;
        
        // Update stats with real data
        setStats({
          totalPosts: analytics.totalPosts || 0,
          totalEngagement: analytics.totalEngagement || 0,
          totalReach: analytics.totalReach || 0,
          totalFollowers: analytics.totalFollowers || 0,
          aiCreditsUsed: analytics.aiCreditsUsed || 0,
          aiCreditsTotal: analytics.aiCreditsTotal || 150,
          scheduledPosts: analytics.scheduledPosts || 0,
          connectedPlatforms: analytics.connectedPlatforms || 0
        });

        // Set recent activity from API or default
        setRecentActivity(analytics.recentActivity || [
          {
            id: '1',
            type: 'post',
            title: 'Welcome to Crow\'s Eye',
            description: 'Get started by connecting your social media accounts',
            timestamp: new Date().toISOString(),
            status: 'success' as const
          }
        ]);

        // Set monthly changes from API or defaults
        setMonthlyChanges(analytics.monthlyGrowth || {
          engagement: 0,
          reach: 0,
          followers: 0,
          posts: 0
        });
        
        console.log('✅ Analytics data loaded successfully');
        if (data.source) {
          console.log(`📊 Data source: ${data.source}`);
        }
      } else {
        throw new Error(data.error || 'Failed to load analytics');
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      
      // Set minimal default data on error
      setStats({
        totalPosts: 0,
        totalEngagement: 0,
        totalReach: 0,
        totalFollowers: 0,
        aiCreditsUsed: 0,
        aiCreditsTotal: 150,
        scheduledPosts: 0,
        connectedPlatforms: 0
      });
      
      setRecentActivity([
        {
          id: '1',
          type: 'connect',
          title: 'Connect Your Accounts',
          description: 'Start by linking your social media platforms to begin tracking analytics',
          timestamp: new Date().toISOString(),
          status: 'pending' as const
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      title: 'Create Post',
      description: 'Start creating your next social media post',
      icon: Plus,
      action: () => {}, // Will be handled by parent component
      color: 'from-blue-500 to-blue-600',
      badge: 'New'
    },
    {
      title: 'Upload Media',
      description: 'Add new photos and videos to your library',
      icon: Plus,
      action: () => {},
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'AI Assistant',
      description: 'Generate captions and hashtags with AI',
             icon: Sparkles,
      action: () => {},
      color: 'from-purple-500 to-purple-600',
      badge: 'AI'
    },
    {
      title: 'Connect Platform',
      description: 'Link more social media accounts',
      icon: LinkIcon,
      action: () => {},
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post': return CheckCircle;
      case 'schedule': return Calendar;
      case 'connect': return LinkIcon;
             case 'ai_generate': return Sparkles;
      case 'upload': return Plus;
      default: return Activity;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  // Calculate percentage changes (will be updated to use real data from API)
  const [monthlyChanges, setMonthlyChanges] = useState({
    engagement: 0,
    reach: 0,
    followers: 0,
    posts: 0
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-800 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-800 rounded-lg"></div>
            <div className="h-64 bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-gray-400">Track your social media performance and manage your content</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={loadDashboardData}
            className="border-gray-600"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Posts</p>
                <p className="text-2xl font-bold text-white">{stats.totalPosts}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-400 mr-1" />
                  <span className="text-xs text-green-400">+12% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Engagement</p>
                <p className="text-2xl font-bold text-white">{stats.totalEngagement.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-400 mr-1" />
                  <span className="text-xs text-green-400">+{monthlyChanges.engagement}% this week</span>
                </div>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Heart className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Reach</p>
                <p className="text-2xl font-bold text-white">{stats.totalReach.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-400 mr-1" />
                  <span className="text-xs text-green-400">+{monthlyChanges.reach}% this week</span>
                </div>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Eye className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Followers</p>
                <p className="text-2xl font-bold text-white">{stats.totalFollowers.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-400 mr-1" />
                  <span className="text-xs text-green-400">+{monthlyChanges.followers}% this month</span>
                </div>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Users className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Credits & Scheduled Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-400" />
              AI Credits
            </CardTitle>
            <CardDescription>Your monthly AI usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Used</span>
              <span className="text-white font-medium">
                {stats.aiCreditsUsed} / {stats.aiCreditsTotal}
              </span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(stats.aiCreditsUsed / stats.aiCreditsTotal) * 100}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                {stats.aiCreditsTotal - stats.aiCreditsUsed} credits remaining
              </span>
              <Button variant="outline" size="sm" className="border-gray-600">
                <Crown className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-400" />
              Scheduled Posts
            </CardTitle>
            <CardDescription>Posts waiting to be published</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-white">
                {stats.scheduledPosts}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Next post</div>
                <div className="text-sm text-white font-medium">Tomorrow 2:00 PM</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              <span>3 posts this week • 5 posts next week</span>
            </div>
            
            <Button variant="outline" className="w-full border-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              View Schedule
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription>Get things done faster</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`
                  relative p-4 rounded-lg border border-gray-600 hover:border-gray-500 
                  bg-gradient-to-br ${action.color} bg-opacity-10 hover:bg-opacity-20 
                  transition-all duration-200 text-left group
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} bg-opacity-20`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  {action.badge && (
                    <Badge className="bg-white/10 text-white border-white/20 text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                
                <h3 className="font-medium text-white mb-1 group-hover:text-blue-300 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-400">{action.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Platform Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const IconComponent = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-700/30 transition-colors">
                    <div className={`p-2 rounded-lg bg-gray-700/50`}>
                      <IconComponent className={`h-4 w-4 ${getActivityColor(activity.status)}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">
                          {activity.title}
                        </p>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {activity.description}
                      </p>
                      {activity.platform && (
                        <Badge className="mt-2 bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                          {activity.platform}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Platform Status */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Platform Status
            </CardTitle>
            <CardDescription>Connected social media accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center space-x-3">
                  <div className="text-lg">📷</div>
                  <div>
                    <p className="text-sm font-medium text-white">Instagram</p>
                    <p className="text-xs text-gray-400">@crowseyeofficial</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-green-400">Active</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center space-x-3">
                  <div className="text-lg">📘</div>
                  <div>
                    <p className="text-sm font-medium text-white">Facebook</p>
                    <p className="text-xs text-gray-400">Crow's Eye Official</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-blue-400">Active</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center space-x-3">
                  <div className="text-lg">🐦</div>
                  <div>
                    <p className="text-sm font-medium text-white">X (Twitter)</p>
                    <p className="text-xs text-gray-400">@crowseye_ai</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <span className="text-xs text-yellow-400">Warning</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 border border-gray-600/50">
                <div className="flex items-center space-x-3">
                  <div className="text-lg">💼</div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">LinkedIn</p>
                    <p className="text-xs text-gray-500">Not connected</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-gray-600 text-xs">
                  Connect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 