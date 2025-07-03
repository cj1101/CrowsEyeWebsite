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
import { AnalyticsService, MediaService, PostService } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMediaLibrary } from '@/hooks/api/useMediaLibrary';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Clock, 
  Plus,
  Upload,
  Palette,
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
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalPosts: number;
  totalEngagement: number;
  totalReach: number;
  totalFollowers: number;
  aiCreditsUsed: number;
  aiCreditsTotal: number;
  scheduledPosts: number;
  connectedPlatforms: number;
  totalMedia: number;
  publishedPosts: number;
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

interface MonthlyChanges {
  engagement: number;
  reach: number;
  followers: number;
  posts: number;
}

export default function DashboardOverview() {
  const router = useRouter();
  const { userProfile, refreshUserProfile } = useAuth();
  const { files } = useMediaStore();
  const { posts } = usePostStore();
  const { media } = useMediaLibrary();
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalEngagement: 0,
    totalReach: 0,
    totalFollowers: 0,
    aiCreditsUsed: 0,
    aiCreditsTotal: 150,
    scheduledPosts: 0,
    connectedPlatforms: 0,
    totalMedia: 0,
    publishedPosts: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyChanges, setMonthlyChanges] = useState<MonthlyChanges>({
    engagement: 0,
    reach: 0,
    followers: 0,
    posts: 0
  });
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

  // Update stats when media changes
  useEffect(() => {
    if (media.length > 0) {
      setStats(prev => ({
        ...prev,
        totalMedia: media.length,
        publishedPosts: media.filter(item => item.status === 'published').length,
      }));
    }
  }, [media]);

  // Update AI credits when user profile changes
  useEffect(() => {
    if (!userProfile) return;

    const limits = userProfile.usage_limits || {} as any;

    // Determine plan-based total if not present in limits
    const planDefaults: Record<string, number> = {
      free: 50,
      creator: 150,
      growth: 400,
      pro: 750,
      payg: 0 // Unlimited / usage-based
    };

    const used = limits.ai_credits ?? 0;
    let total = limits.max_ai_credits ?? -1;

    if ((total === undefined || total === 0) && userProfile.plan) {
      total = planDefaults[userProfile.plan] ?? 0;
    }

    setStats(prev => ({
      ...prev,
      aiCreditsUsed: used,
      aiCreditsTotal: total === -1 ? used + 1 : total // ensure non-zero for progress calc
    }));
  }, [userProfile]);

  // Optionally refresh profile periodically (every 60s)
  useEffect(() => {
    const id = setInterval(() => {
      refreshUserProfile();
    }, 60000);
    return () => clearInterval(id);
  }, [refreshUserProfile]);

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
      
      const user = auth.currentUser;
      if (!user) {
        console.log('⚠️ No authenticated user found');
        setLoading(false);
        return;
      }

      console.log('📊 Loading dashboard data for user:', user.uid);
      
      // Load analytics data from Firestore
      try {
        const analyticsSummary = await AnalyticsService.getUserAnalyticsSummary(user.uid);
        
        console.log('✅ Analytics data loaded:', analyticsSummary);
        
        setStats(prev => ({
          ...prev,
          totalEngagement: analyticsSummary.totalEngagement,
          totalReach: analyticsSummary.totalViews, // Using views as reach proxy
          totalPosts: Object.keys(analyticsSummary.byPlatform).length,
        }));

        // Generate recent activity based on platform stats
        const platformEntries = Object.entries(analyticsSummary.byPlatform);
        const recentAnalytics = platformEntries
          .slice(0, 5)
          .map(([platform, metrics], index) => ({
            id: `activity-${index}`,
            type: 'post' as const,
            title: `Recent activity on ${platform}`,
            description: `${metrics.engagement || 0} total engagement`,
            timestamp: new Date().toISOString(),
            status: 'success' as const,
            platform: platform
          }));

        setRecentActivity(recentAnalytics.length > 0 ? recentAnalytics : [
          {
            id: '1',
            type: 'post',
            title: 'Welcome to Crow\'s Eye',
            description: 'Get started by connecting your social media accounts',
            timestamp: new Date().toISOString(),
            status: 'success' as const
          }
        ]);
        
      } catch (analyticsError) {
        console.warn('⚠️ Error loading analytics, using defaults:', analyticsError);
        setRecentActivity([
          {
            id: '1',
            type: 'post',
            title: 'Welcome to Crow\'s Eye',
            description: 'Get started by creating your first post',
            timestamp: new Date().toISOString(),
            status: 'success' as const
          }
        ]);
      }

      console.log('✅ Dashboard data loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      
      // Clear stats and activity on failure
      setStats(prev => ({
        ...prev,
        totalPosts: 0,
        totalEngagement: 0,
        totalReach: 0,
        totalFollowers: 0,
      }));
      
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      title: 'Create Post',
      description: 'Start creating your next social media post',
      icon: Plus,
      action: () => {},
      color: 'from-blue-500 to-blue-600',
      badge: 'New'
    },
    {
      title: 'Upload Media',
      description: 'Add new photos and videos to your library',
      icon: Upload,
      action: () => {},
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Brand Kit',
      description: 'Manage your brand assets',
      icon: Palette,
      action: () => {},
      color: 'from-pink-500 to-pink-600'
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

      {/* AI Credits */}
      <div className="grid grid-cols-1 gap-6">
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
                style={{ width: `${stats.aiCreditsTotal > 0 ? (stats.aiCreditsUsed / stats.aiCreditsTotal) * 100 : 0}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                {stats.aiCreditsTotal > 0 ? stats.aiCreditsTotal - stats.aiCreditsUsed : '∞'} credits remaining
              </span>
              <Button variant="outline" size="sm" className="border-gray-600">
                <Crown className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
            </div>
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
    </div>
  );
} 