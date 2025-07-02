'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Edit3, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  XCircle,
  BarChart3,
  Globe,
  Image,
  Video,
  Hash,
  MapPin,
  Settings,
  Users,
  Target,
  TrendingUp,
  Database,
  FolderOpen,
  Upload,
  Copy,
  Archive
} from 'lucide-react';
import { ScheduleService, PostService } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import { useMediaLibrary } from '@/hooks/api/useMediaLibrary';
import type { ScheduleDocument, PostDocument } from '@/lib/firestore/types';

// Campaign interface for managing multiple posts as a cohesive unit
interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  startDate: string;
  endDate: string;
  platforms: string[];
  totalPosts: number;
  scheduledPosts: number;
  publishedPosts: number;
  failedPosts: number;
  tags: string[];
  createdAt: string;
  lastUpdated: string;
  posts: ScheduledPost[];
  settings: {
    autoOptimize: boolean;
    skipWeekends: boolean;
    timezone: string;
    postingTimes: string[];
    minInterval: number; // minutes between posts
  };
  analytics: {
    totalReach: number;
    totalEngagement: number;
    avgEngagementRate: number;
    topPerformingPost?: string;
  };
}

interface ScheduledPost {
  id: string;
  campaignId: string;
  content: string;
  platforms: string[];
  media: { type: 'image' | 'video' | 'audio'; url: string; thumbnail?: string; mediaId: string }[];
  scheduledFor: string;
  status: 'scheduled' | 'publishing' | 'published' | 'failed' | 'paused';
  hashtags: string[];
  location?: string;
  createdAt: string;
  lastUpdated: string;
  publishedAt?: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
  errorMessage?: string;
  retryCount: number;
}

const platformIcons = {
  instagram: '📷',
  facebook: '📘',
  twitter: '🐦',
  linkedin: '💼',
  tiktok: '🎵',
  pinterest: '📌',
  youtube: '📺',
  'google-mybusiness': '🏢',
  snapchat: '👻'
};

const statusColors = {
  draft: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  active: 'bg-green-500/20 text-green-300 border-green-500/30',
  scheduled: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  publishing: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  published: 'bg-green-500/20 text-green-300 border-green-500/30',
  failed: 'bg-red-500/20 text-red-300 border-red-500/30',
  paused: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  completed: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  archived: 'bg-gray-600/20 text-gray-400 border-gray-600/30',
  pending: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  processing: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
};

export default function ScheduleTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [schedules, setSchedules] = useState<ScheduleDocument[]>([]);
  const [posts, setPosts] = useState<PostDocument[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'campaigns' | 'calendar' | 'posts'>('posts'); // Default to posts view
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  
  const { media } = useMediaLibrary();

  useEffect(() => {
    loadScheduleData();
  }, []);

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      
      const user = auth.currentUser;
      if (!user) {
        console.log('⚠️ No authenticated user found');
        setLoading(false);
        return;
      }

      console.log('📅 Loading schedule data for user:', user.uid);
      
      // Load schedules from Firestore
      const { data: schedulesData } = await ScheduleService.listUserSchedules(user.uid, {
        limit: 50
      });
      setSchedules(schedulesData);
      
      // Load posts from Firestore
      const { data: postsData } = await PostService.listUserPosts(user.uid, {
        limit: 50
      });
      setPosts(postsData);
      
      console.log('✅ Schedule data loaded:', {
        schedules: schedulesData.length,
        posts: postsData.length
      });
      
      // For now, we'll use a simplified approach without campaigns
      // You can extend this later to create campaign functionality
      
    } catch (error) {
      console.error('❌ Failed to load schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (campaignData: Partial<Campaign>) => {
    try {
      // Mock implementation - replace with actual API call
      const newCampaign: Campaign = {
        id: Date.now().toString(),
        name: campaignData.name || 'New Campaign',
        description: campaignData.description || '',
        status: 'draft',
        startDate: campaignData.startDate || new Date().toISOString(),
        endDate: campaignData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        platforms: campaignData.platforms || [],
        totalPosts: 0,
        scheduledPosts: 0,
        publishedPosts: 0,
        failedPosts: 0,
        tags: campaignData.tags || [],
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        posts: [],
        settings: {
          autoOptimize: true,
          skipWeekends: false,
          timezone: 'UTC',
          postingTimes: ['09:00', '13:00', '17:00'],
          minInterval: 120,
          ...campaignData.settings
        },
        analytics: {
          totalReach: 0,
          totalEngagement: 0,
          avgEngagementRate: 0
        }
      };
      
      setCampaigns(prev => [...prev, newCampaign]);
      setShowCreateCampaignModal(false);
      return newCampaign;
    } catch (error) {
      console.error('Failed to create campaign:', error);
      throw error;
    }
  };

  const addPostToCampaign = async (campaignId: string, postData: Partial<ScheduledPost>) => {
    try {
      const newPost: ScheduledPost = {
        id: Date.now().toString(),
        campaignId,
        content: postData.content || '',
        platforms: postData.platforms || [],
        media: postData.media || [],
        scheduledFor: postData.scheduledFor || new Date().toISOString(),
        status: 'scheduled',
        hashtags: postData.hashtags || [],
        location: postData.location,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        retryCount: 0
      };

      // Update campaign with new post
      setCampaigns(prev => prev.map(campaign => {
        if (campaign.id === campaignId) {
          return {
            ...campaign,
            posts: [...campaign.posts, newPost],
            totalPosts: campaign.totalPosts + 1,
            scheduledPosts: campaign.scheduledPosts + 1,
            lastUpdated: new Date().toISOString()
          };
        }
        return campaign;
      }));

              // Also create schedule in Firestore
        const currentUser = auth.currentUser;
        if (currentUser) {
          await ScheduleService.createSchedule({
            userId: currentUser.uid,
            contentId: newPost.id,
            scheduledTime: new Date(newPost.scheduledFor),
            platforms: newPost.platforms,
            status: 'pending'
          });
        }

      return newPost;
    } catch (error) {
      console.error('Failed to add post to campaign:', error);
      throw error;
    }
  };

  const handleCampaignAction = async (campaignId: string, action: 'activate' | 'pause' | 'archive' | 'delete') => {
    try {
      setCampaigns(prev => prev.map(campaign => {
        if (campaign.id === campaignId) {
          switch (action) {
            case 'activate':
              return { ...campaign, status: 'active' as const, lastUpdated: new Date().toISOString() };
            case 'pause':
              return { ...campaign, status: 'paused' as const, lastUpdated: new Date().toISOString() };
            case 'archive':
              return { ...campaign, status: 'archived' as const, lastUpdated: new Date().toISOString() };
            case 'delete':
              return campaign; // Will be filtered out below
            default:
              return campaign;
          }
        }
        return campaign;
      }));

      if (action === 'delete') {
        setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
      }
    } catch (error) {
      console.error(`Failed to ${action} campaign:`, error);
    }
  };

  const handlePostAction = async (postId: string, action: 'publish' | 'pause' | 'delete' | 'retry') => {
    try {
      setCampaigns(prev => prev.map(campaign => ({
        ...campaign,
        posts: campaign.posts.map(post => {
          if (post.id === postId) {
            switch (action) {
              case 'publish':
                return { ...post, status: 'publishing' as const };
              case 'pause':
                return { ...post, status: 'paused' as const };
              case 'retry':
                return { ...post, status: 'scheduled' as const, retryCount: post.retryCount + 1 };
              default:
                return post;
            }
          }
          return post;
        }).filter(post => action !== 'delete' || post.id !== postId)
      })));

      // Handle post actions
      if (action === 'publish') {
        // Mark schedule as processing for immediate publishing
        // This would typically trigger a publishing workflow
        console.log('Publishing post:', postId);
      }
    } catch (error) {
      console.error(`Failed to ${action} post:`, error);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getTimeUntilPost = (scheduledFor: string) => {
    const now = new Date();
    const scheduled = new Date(scheduledFor);
    const diff = scheduled.getTime() - now.getTime();
    
    if (diff < 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Soon';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Campaign Scheduler</h1>
          <p className="text-gray-400">Manage your content campaigns and scheduled posts</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowCreateCampaignModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex bg-white/10 rounded-lg p-1">
          <button
            onClick={() => setSelectedView('campaigns')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedView === 'campaigns' 
                ? 'bg-purple-500 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Database className="h-4 w-4 inline mr-2" />
            Campaigns
          </button>
          <button
            onClick={() => setSelectedView('calendar')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedView === 'calendar' 
                ? 'bg-purple-500 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Calendar className="h-4 w-4 inline mr-2" />
            Calendar
          </button>
          <button
            onClick={() => setSelectedView('posts')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedView === 'posts' 
                ? 'bg-purple-500 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <FolderOpen className="h-4 w-4 inline mr-2" />
            All Posts
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      {selectedView === 'campaigns' && (
        <div className="space-y-6">
          {/* Campaign Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/5 border-white/10 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Campaigns</p>
                    <p className="text-2xl font-bold">{campaigns.length}</p>
                  </div>
                  <Database className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Active Campaigns</p>
                    <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'active').length}</p>
                  </div>
                  <Play className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Posts</p>
                    <p className="text-2xl font-bold">{campaigns.reduce((sum, c) => sum + c.totalPosts, 0)}</p>
                  </div>
                  <FolderOpen className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Avg. Engagement</p>
                    <p className="text-2xl font-bold">
                      {campaigns.length > 0 
                        ? (campaigns.reduce((sum, c) => sum + c.analytics.avgEngagementRate, 0) / campaigns.length).toFixed(1)
                        : '0'}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaigns List */}
          <div className="space-y-4">
            {filteredCampaigns.length === 0 ? (
              <Card className="bg-white/5 border-white/10 text-white">
                <CardContent className="p-12 text-center">
                  <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
                  <p className="text-gray-400 mb-6">Create your first campaign to start scheduling posts</p>
                  <Button
                    onClick={() => setShowCreateCampaignModal(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{campaign.name}</h3>
                          <Badge className={`${statusColors[campaign.status]} border`}>
                            {campaign.status}
                          </Badge>
                          {campaign.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <p className="text-gray-400 mb-4">{campaign.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-400">Total Posts</p>
                            <p className="font-semibold">{campaign.totalPosts}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Published</p>
                            <p className="font-semibold text-green-400">{campaign.publishedPosts}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Scheduled</p>
                            <p className="font-semibold text-blue-400">{campaign.scheduledPosts}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Failed</p>
                            <p className="font-semibold text-red-400">{campaign.failedPosts}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDateTime(campaign.startDate).date} - {formatDateTime(campaign.endDate).date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            <div className="flex gap-1">
                              {campaign.platforms.map((platform) => (
                                <span key={platform} title={platform}>
                                  {platformIcons[platform as keyof typeof platformIcons]}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setShowCampaignDetails(true);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setShowCreatePostModal(true);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        
                        {campaign.status === 'active' ? (
                          <Button
                            onClick={() => handleCampaignAction(campaign.id, 'pause')}
                            variant="outline"
                            size="sm"
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleCampaignAction(campaign.id, 'activate')}
                            variant="outline"
                            size="sm"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => handleCampaignAction(campaign.id, 'delete')}
                          variant="outline"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modals would go here - CreateCampaignModal, CreatePostModal, CampaignDetailsModal */}
      {/* For now, these are placeholders - full implementation would include form modals */}
      
      {/* Create Campaign Modal */}
      {showCreateCampaignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-900 border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white">Create New Campaign</CardTitle>
              <CardDescription className="text-gray-400">
                Set up a new campaign to organize and schedule your posts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Campaign Name</label>
                <input
                  type="text"
                  placeholder="Enter campaign name..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  placeholder="Describe your campaign..."
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                  <input
                    type="date"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">End Date</label>
                  <input
                    type="date"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Platforms</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(platformIcons).map(([platform, icon]) => (
                    <label key={platform} className="flex items-center space-x-2 text-white">
                      <input type="checkbox" className="rounded" />
                      <span>{icon}</span>
                      <span className="capitalize">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="marketing, product-launch, social..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  onClick={() => setShowCreateCampaignModal(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Handle campaign creation
                    createCampaign({
                      name: 'New Campaign',
                      description: 'Campaign description',
                      platforms: ['instagram'],
                      tags: ['new']
                    });
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Create Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePostModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-900 border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white">Add Post to {selectedCampaign.name}</CardTitle>
              <CardDescription className="text-gray-400">
                Create a new scheduled post for this campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Post Content</label>
                <textarea
                  placeholder="Write your post content..."
                  rows={4}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Media Files</label>
                <div className="grid grid-cols-3 gap-3 max-h-40 overflow-y-auto">
                  {media.slice(0, 9).map((item) => (
                    <div key={item.id} className="relative group cursor-pointer">
                      <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                        {item.type === 'image' ? (
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Plus className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Scheduled Date</label>
                  <input
                    type="date"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Scheduled Time</label>
                  <input
                    type="time"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Platforms</label>
                <div className="flex gap-2">
                  {selectedCampaign.platforms.map((platform) => (
                    <label key={platform} className="flex items-center space-x-2 text-white">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span>{platformIcons[platform as keyof typeof platformIcons]}</span>
                      <span className="capitalize">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Hashtags</label>
                <input
                  type="text"
                  placeholder="#hashtag1 #hashtag2 #hashtag3..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  onClick={() => setShowCreatePostModal(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Handle post creation
                    addPostToCampaign(selectedCampaign.id, {
                      content: 'New post content',
                      platforms: selectedCampaign.platforms,
                      scheduledFor: new Date().toISOString()
                    });
                    setShowCreatePostModal(false);
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Add to Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaign Details Modal */}
      {showCampaignDetails && selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-900 border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">{selectedCampaign.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {selectedCampaign.description}
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowCampaignDetails(false)}
                  variant="outline"
                  size="sm"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Campaign Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Total Posts</p>
                  <p className="text-2xl font-bold text-white">{selectedCampaign.totalPosts}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Published</p>
                  <p className="text-2xl font-bold text-green-400">{selectedCampaign.publishedPosts}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Scheduled</p>
                  <p className="text-2xl font-bold text-blue-400">{selectedCampaign.scheduledPosts}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Engagement Rate</p>
                  <p className="text-2xl font-bold text-yellow-400">{selectedCampaign.analytics.avgEngagementRate}%</p>
                </div>
              </div>
              
              {/* Posts in Campaign */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Posts in Campaign</h3>
                {selectedCampaign.posts.length === 0 ? (
                  <div className="bg-white/5 p-8 rounded-lg text-center">
                    <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No posts in this campaign yet</p>
                    <Button
                      onClick={() => {
                        setShowCampaignDetails(false);
                        setShowCreatePostModal(true);
                      }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Post
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCampaign.posts.map((post) => (
                      <div key={post.id} className="bg-white/5 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-white font-medium">{post.content.substring(0, 100)}...</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                              <span>{formatDateTime(post.scheduledFor).date} at {formatDateTime(post.scheduledFor).time}</span>
                              <div className="flex gap-1">
                                {post.platforms.map((platform) => (
                                  <span key={platform}>
                                    {platformIcons[platform as keyof typeof platformIcons]}
                                  </span>
                                ))}
                              </div>
                              <Badge className={statusColors[post.status]}>
                                {post.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {post.status === 'scheduled' && (
                              <Button
                                onClick={() => handlePostAction(post.id, 'publish')}
                                variant="outline"
                                size="sm"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              onClick={() => handlePostAction(post.id, 'delete')}
                              variant="outline"
                              size="sm"
                              className="text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 