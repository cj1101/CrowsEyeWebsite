'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { CrowsEyeAPI } from '@/services/api';
import { 
  PlusCircle,
  FileText,
  Image,
  Video,
  Calendar,
  Sparkles,
  Edit3,
  Trash2,
  Send,
  Save,
  Upload,
  Download,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Instagram,
  Bot,
  Hash,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  Grid,
  List,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Post {
  id: string;
  content: string;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  createdAt: string;
  scheduledAt?: string;
  publishedAt?: string;
  mediaUrls: string[];
  hashtags: string[];
  analytics?: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  };
}

interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  tags: string[];
  usage: number;
}

export default function ContentHubPage() {
  const { user, isAuthenticated } = useAuth();
  const [api] = useState(() => new CrowsEyeAPI());
  const [activeTab, setActiveTab] = useState('create');
  const [posts, setPosts] = useState<Post[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'scheduled' | 'published'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Content Creation State
  const [newPost, setNewPost] = useState({
    content: '',
    platforms: [] as string[],
    hashtags: [] as string[],
    mediaUrls: [] as string[],
    scheduledAt: ''
  });

  // AI Generation State
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Load posts and templates on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadPosts();
      loadTemplates();
    }
  }, [isAuthenticated]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const response = await api.getPosts();
      if (response.data) {
        setPosts(response.data);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await api.getTemplates();
      if (response.data) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const generateAIContent = async () => {
    if (!aiPrompt.trim()) return;
    
    try {
      setIsGenerating(true);
      const response = await api.generateCaption({
        prompt: aiPrompt,
        type: 'caption',
        tone: 'casual',
        platform: newPost.platforms[0] || 'instagram'
      });
      
      if (response.data?.generated_content) {
        setGeneratedContent(response.data.generated_content);
        setNewPost(prev => ({ ...prev, content: response.data.generated_content }));
      }
    } catch (error) {
      console.error('Failed to generate content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateHashtags = async () => {
    if (!newPost.content.trim()) return;
    
    try {
      const response = await api.generateHashtags({
        prompt: newPost.content,
        type: 'hashtags',
        platform: newPost.platforms[0] || 'instagram'
      });
      
      if (response.data?.generated_content) {
        const hashtags = response.data.generated_content.split(' ').filter((tag: string) => tag.startsWith('#'));
        setNewPost(prev => ({ ...prev, hashtags }));
      }
    } catch (error) {
      console.error('Failed to generate hashtags:', error);
    }
  };

  const createPost = async () => {
    try {
      setIsLoading(true);
      const response = await api.createPost({
        content: newPost.content,
        media_ids: newPost.mediaUrls,
        platforms: newPost.platforms,
        hashtags: newPost.hashtags,
        schedule_date: newPost.scheduledAt || undefined
      });
      
      if (response.data) {
        await loadPosts();
        setNewPost({
          content: '',
          platforms: [],
          hashtags: [],
          mediaUrls: [],
          scheduledAt: ''
        });
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const publishPost = async (postId: string) => {
    try {
      await api.publishPost({ content: 'publish', media_ids: [], platforms: [], hashtags: [] });
      await loadPosts();
    } catch (error) {
      console.error('Failed to publish post:', error);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await api.deletePost(postId);
      await loadPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const platforms = [
    { id: 'instagram', name: 'Instagram', color: 'bg-pink-500', icon: Instagram },
    { id: 'tiktok', name: 'TikTok', color: 'bg-black', icon: Video },
    { id: 'twitter', name: 'Twitter', color: 'bg-blue-500', icon: MessageCircle },
    { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700', icon: Share2 },
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600', icon: Share2 },
  ];

  const statusColors = {
    draft: 'bg-gray-500/20 text-gray-300',
    scheduled: 'bg-blue-500/20 text-blue-300',
    published: 'bg-green-500/20 text-green-300',
    failed: 'bg-red-500/20 text-red-300'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              📝 Content Creation Hub
            </h1>
            <p className="text-xl text-gray-300 mt-2">
              Create, manage, and publish content across all platforms
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              variant="outline"
              className="border-gray-600 hover:bg-gray-800"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm font-medium">Total Posts</p>
                  <p className="text-3xl font-bold text-white">{posts.length}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium">Scheduled</p>
                  <p className="text-3xl font-bold text-white">
                    {posts.filter(p => p.status === 'scheduled').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm font-medium">Published</p>
                  <p className="text-3xl font-bold text-white">
                    {posts.filter(p => p.status === 'published').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/50 to-red-900/50 border-orange-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-200 text-sm font-medium">Templates</p>
                  <p className="text-3xl font-bold text-white">{templates.length}</p>
                </div>
                <Sparkles className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-900/50 p-2">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Manage
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Create Content Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Content Editor */}
              <div className="lg:col-span-2">
                <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Edit3 className="h-5 w-5" />
                      Content Editor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Platform Selection */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-3 block">
                        Select Platforms
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {platforms.map(platform => {
                          const Icon = platform.icon;
                          const isSelected = newPost.platforms.includes(platform.id);
                          
                          return (
                            <button
                              key={platform.id}
                              onClick={() => {
                                setNewPost(prev => ({
                                  ...prev,
                                  platforms: isSelected 
                                    ? prev.platforms.filter(p => p !== platform.id)
                                    : [...prev.platforms, platform.id]
                                }));
                              }}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                isSelected 
                                  ? `${platform.color} border-white/30 text-white`
                                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                              {platform.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Content Input */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-3 block">
                        Content
                      </label>
                      <textarea
                        value={newPost.content}
                        onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Write your content here..."
                        className="w-full h-32 bg-gray-800 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-400">
                          {newPost.content.length} characters
                        </span>
                        <Button
                          onClick={generateHashtags}
                          size="sm"
                          variant="outline"
                          className="border-gray-600 hover:bg-gray-800"
                          disabled={!newPost.content.trim()}
                        >
                          <Hash className="h-3 w-3 mr-1" />
                          Generate Hashtags
                        </Button>
                      </div>
                    </div>

                    {/* Hashtags */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-3 block">
                        Hashtags
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {newPost.hashtags.map((tag, index) => (
                          <Badge
                            key={index}
                            className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 cursor-pointer"
                            onClick={() => {
                              setNewPost(prev => ({
                                ...prev,
                                hashtags: prev.hashtags.filter((_, i) => i !== index)
                              }));
                            }}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Add hashtag (press Enter)"
                        className="bg-gray-800 border-gray-600"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            const tag = input.value.trim();
                            if (tag && !newPost.hashtags.includes(tag)) {
                              const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
                              setNewPost(prev => ({
                                ...prev,
                                hashtags: [...prev.hashtags, formattedTag]
                              }));
                              input.value = '';
                            }
                          }
                        }}
                      />
                    </div>

                    {/* Schedule */}
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-3 block">
                        Schedule (Optional)
                      </label>
                      <Input
                        type="datetime-local"
                        value={newPost.scheduledAt}
                        onChange={(e) => setNewPost(prev => ({ ...prev, scheduledAt: e.target.value }))}
                        className="bg-gray-800 border-gray-600"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        onClick={createPost}
                        disabled={!newPost.content.trim() || newPost.platforms.length === 0 || isLoading}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex-1"
                      >
                        {isLoading ? (
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                        ) : newPost.scheduledAt ? (
                          <Calendar className="h-4 w-4 mr-2" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        {newPost.scheduledAt ? 'Schedule Post' : 'Publish Now'}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-gray-600 hover:bg-gray-800"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Assistant */}
              <div>
                <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-cyan-400" />
                      AI Assistant
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Generate Content
                      </label>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Describe what you want to create..."
                        className="w-full h-24 bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none"
                      />
                      <Button
                        onClick={generateAIContent}
                        disabled={!aiPrompt.trim() || isGenerating}
                        className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                      >
                        {isGenerating ? (
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        Generate Content
                      </Button>
                    </div>

                    {generatedContent && (
                      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                        <p className="text-sm text-gray-300">{generatedContent}</p>
                        <Button
                          onClick={() => {
                            setNewPost(prev => ({ ...prev, content: generatedContent }));
                            setGeneratedContent('');
                          }}
                          size="sm"
                          className="mt-2 w-full"
                          variant="outline"
                        >
                          Use This Content
                        </Button>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-300">Quick Actions</p>
                      <div className="grid grid-cols-1 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 hover:bg-gray-800 justify-start"
                        >
                          <Upload className="h-3 w-3 mr-2" />
                          Upload Media
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 hover:bg-gray-800 justify-start"
                        >
                          <Eye className="h-3 w-3 mr-2" />
                          Preview Post
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 hover:bg-gray-800 justify-start"
                        >
                          <TrendingUp className="h-3 w-3 mr-2" />
                          Best Time to Post
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Manage Posts Tab */}
          <TabsContent value="manage" className="space-y-6">
            {/* Filters */}
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-gray-800 border-gray-600 w-64"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                    >
                      <option value="all">All Posts</option>
                      <option value="draft">Drafts</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredPosts.map(post => (
                <Card key={post.id} className="bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:border-gray-700 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={statusColors[post.status]}>
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 hover:text-red-400"
                          onClick={() => deletePost(post.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        {post.status === 'draft' && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 hover:text-green-400"
                            onClick={() => publishPost(post.id)}
                          >
                            <Send className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3 line-clamp-3">
                      {post.content}
                    </p>
                    
                    {post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.hashtags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} className="bg-purple-500/20 text-purple-300 text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {post.hashtags.length > 3 && (
                          <Badge className="bg-gray-500/20 text-gray-300 text-xs">
                            +{post.hashtags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        {post.platforms.map(platform => {
                          const platformInfo = platforms.find(p => p.id === platform);
                          const Icon = platformInfo?.icon || Share2;
                          return (
                            <Icon key={platform} className="h-3 w-3" />
                          );
                        })}
                      </div>
                    </div>
                    
                    {post.analytics && post.status === 'published' && (
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-700">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3 text-red-400" />
                          <span className="text-xs">{post.analytics.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3 text-blue-400" />
                          <span className="text-xs">{post.analytics.comments}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="h-3 w-3 text-green-400" />
                          <span className="text-xs">{post.analytics.shares}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No posts found</h3>
                <p className="text-gray-400 mb-6">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Try adjusting your filters or search query'
                    : 'Create your first post to get started'
                  }
                </p>
                <Button 
                  onClick={() => setActiveTab('create')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="text-center py-12">
              <Sparkles className="h-16 w-16 text-orange-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Content Templates</h3>
              <p className="text-gray-400 mb-6">
                Save time with pre-designed content templates
              </p>
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Content Analytics</h3>
              <p className="text-gray-400 mb-6">
                Track performance across all your content
              </p>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 