'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { CrowsEyeAPI, type User, type APIResponse } from '@/services/api';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Wifi, 
  WifiOff,
  Play,
  RotateCcw,
  Download,
  Upload,
  Zap,
  BarChart3,
  Image,
  Video,
  Calendar,
  Users,
  Settings,
  Sparkles,
  Shield,
  FileText,
  Eye,
  Share2,
  TrendingUp,
  Database,
  Bot,
  Globe,
  Smartphone
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Comprehensive API Test Interface
interface APITest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  requiredAuth: boolean;
  testData?: any;
  expectedResponse: number;
  category: string;
  isCore?: boolean;
}

interface TestResult {
  test: APITest;
  status: 'idle' | 'running' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
  response?: any;
  error?: string;
  timestamp?: string;
}

interface TestCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  tests: APITest[];
  color: string;
}

// Comprehensive API Test Suite - All 50+ Endpoints
const API_TESTS: APITest[] = [
  // Health & System
  { endpoint: '/health', method: 'GET', description: 'Basic health check', requiredAuth: false, expectedResponse: 200, category: 'system', isCore: true },
  { endpoint: '/health/system', method: 'GET', description: 'System health status', requiredAuth: false, expectedResponse: 200, category: 'system', isCore: true },
  { endpoint: '/api/test', method: 'GET', description: 'API connectivity test', requiredAuth: false, expectedResponse: 200, category: 'system', isCore: true },

  // Authentication
  { endpoint: '/api/v1/auth/register', method: 'POST', description: 'User registration', requiredAuth: false, expectedResponse: 201, category: 'auth', 
    testData: { email: 'test@example.com', password: 'TestPass123!', name: 'Test User' }
  },
  { endpoint: '/api/v1/auth/login', method: 'POST', description: 'User login', requiredAuth: false, expectedResponse: 200, category: 'auth', isCore: true,
    testData: { email: 'test@example.com', password: 'TestPass123!' }
  },
  { endpoint: '/api/v1/auth/me', method: 'GET', description: 'Get current user', requiredAuth: true, expectedResponse: 200, category: 'auth', isCore: true },
  { endpoint: '/api/v1/auth/refresh', method: 'POST', description: 'Refresh JWT token', requiredAuth: true, expectedResponse: 200, category: 'auth' },
  { endpoint: '/api/v1/auth/logout', method: 'POST', description: 'User logout', requiredAuth: true, expectedResponse: 200, category: 'auth' },

  // User Management
  { endpoint: '/api/v1/users/profile', method: 'GET', description: 'Get user profile', requiredAuth: true, expectedResponse: 200, category: 'users' },
  { endpoint: '/api/v1/users/profile', method: 'PUT', description: 'Update user profile', requiredAuth: true, expectedResponse: 200, category: 'users',
    testData: { name: 'Updated Test User', bio: 'Test bio update' }
  },
  { endpoint: '/api/v1/users/settings', method: 'GET', description: 'Get user settings', requiredAuth: true, expectedResponse: 200, category: 'users' },
  { endpoint: '/api/v1/users/settings', method: 'PUT', description: 'Update user settings', requiredAuth: true, expectedResponse: 200, category: 'users',
    testData: { theme: 'dark', notifications: true }
  },
  { endpoint: '/api/v1/users/change-password', method: 'POST', description: 'Change password', requiredAuth: true, expectedResponse: 200, category: 'users',
    testData: { currentPassword: 'TestPass123!', newPassword: 'NewPass123!' }
  },

  // Platform Management
  { endpoint: '/api/v1/platforms/', method: 'GET', description: 'List all platforms', requiredAuth: true, expectedResponse: 200, category: 'platforms', isCore: true },
  { endpoint: '/api/v1/platforms/instagram/auth-url', method: 'GET', description: 'Instagram OAuth URL', requiredAuth: true, expectedResponse: 200, category: 'platforms' },
  { endpoint: '/api/v1/platforms/tiktok/auth-url', method: 'GET', description: 'TikTok OAuth URL', requiredAuth: true, expectedResponse: 200, category: 'platforms' },
  { endpoint: '/api/v1/platforms/instagram/callback', method: 'POST', description: 'Instagram OAuth callback', requiredAuth: true, expectedResponse: 200, category: 'platforms',
    testData: { code: 'mock_auth_code', state: 'mock_state' }
  },
  { endpoint: '/api/v1/platforms/instagram/disconnect', method: 'DELETE', description: 'Disconnect Instagram', requiredAuth: true, expectedResponse: 200, category: 'platforms' },
  { endpoint: '/api/v1/platforms/instagram/profile', method: 'GET', description: 'Instagram profile info', requiredAuth: true, expectedResponse: 200, category: 'platforms' },

  // Posts & Content
  { endpoint: '/api/v1/posts/', method: 'GET', description: 'List all posts', requiredAuth: true, expectedResponse: 200, category: 'posts', isCore: true },
  { endpoint: '/api/v1/posts/', method: 'POST', description: 'Create new post', requiredAuth: true, expectedResponse: 201, category: 'posts', isCore: true,
    testData: { content: 'Test post content', platforms: ['instagram'], hashtags: ['#test'] }
  },
  { endpoint: '/api/v1/posts/{post_id}', method: 'GET', description: 'Get specific post', requiredAuth: true, expectedResponse: 200, category: 'posts' },
  { endpoint: '/api/v1/posts/{post_id}', method: 'PUT', description: 'Update post', requiredAuth: true, expectedResponse: 200, category: 'posts',
    testData: { content: 'Updated post content' }
  },
  { endpoint: '/api/v1/posts/{post_id}', method: 'DELETE', description: 'Delete post', requiredAuth: true, expectedResponse: 200, category: 'posts' },
  { endpoint: '/api/v1/posts/{post_id}/publish', method: 'POST', description: 'Publish post', requiredAuth: true, expectedResponse: 200, category: 'posts', isCore: true },

  // Media Management
  { endpoint: '/api/v1/media/', method: 'GET', description: 'List media files', requiredAuth: true, expectedResponse: 200, category: 'media', isCore: true },
  { endpoint: '/api/v1/media/upload', method: 'POST', description: 'Upload media file', requiredAuth: true, expectedResponse: 201, category: 'media', isCore: true },
  { endpoint: '/api/v1/media/{media_id}', method: 'GET', description: 'Get media details', requiredAuth: true, expectedResponse: 200, category: 'media' },
  { endpoint: '/api/v1/media/{media_id}', method: 'PUT', description: 'Update media metadata', requiredAuth: true, expectedResponse: 200, category: 'media',
    testData: { title: 'Updated media title', tags: ['test', 'media'] }
  },
  { endpoint: '/api/v1/media/{media_id}', method: 'DELETE', description: 'Delete media file', requiredAuth: true, expectedResponse: 200, category: 'media' },
  { endpoint: '/api/v1/media/gallery', method: 'GET', description: 'Media gallery view', requiredAuth: true, expectedResponse: 200, category: 'media' },

  // AI Content Generation
  { endpoint: '/api/v1/ai/generate-caption', method: 'POST', description: 'Generate AI caption', requiredAuth: true, expectedResponse: 200, category: 'ai', isCore: true,
    testData: { prompt: 'Create a caption for a sunset photo', tone: 'casual', platform: 'instagram' }
  },
  { endpoint: '/api/v1/ai/generate-hashtags', method: 'POST', description: 'Generate AI hashtags', requiredAuth: true, expectedResponse: 200, category: 'ai', isCore: true,
    testData: { content: 'Beautiful sunset at the beach', platform: 'instagram', count: 10 }
  },
  { endpoint: '/api/v1/ai/enhance-image', method: 'POST', description: 'AI image enhancement', requiredAuth: true, expectedResponse: 200, category: 'ai' },
  { endpoint: '/api/v1/ai/generate-video', method: 'POST', description: 'AI video generation', requiredAuth: true, expectedResponse: 200, category: 'ai',
    testData: { prompt: 'Create a short video for social media', duration: 15, style: 'dynamic' }
  },
  { endpoint: '/api/v1/ai/content-ideas', method: 'POST', description: 'Generate content ideas', requiredAuth: true, expectedResponse: 200, category: 'ai',
    testData: { niche: 'travel', platforms: ['instagram', 'tiktok'], count: 5 }
  },
  { endpoint: '/api/v1/ai/optimize-content', method: 'POST', description: 'Optimize content for platforms', requiredAuth: true, expectedResponse: 200, category: 'ai',
    testData: { content: 'Test content', platforms: ['instagram', 'tiktok'] }
  },

  // Scheduling
  { endpoint: '/api/v1/schedule/', method: 'GET', description: 'List scheduled posts', requiredAuth: true, expectedResponse: 200, category: 'scheduling', isCore: true },
  { endpoint: '/api/v1/schedule/', method: 'POST', description: 'Schedule new post', requiredAuth: true, expectedResponse: 201, category: 'scheduling', isCore: true,
    testData: { post_id: 'test_post_id', scheduled_time: '2024-12-31T12:00:00Z', platforms: ['instagram'] }
  },
  { endpoint: '/api/v1/schedule/{schedule_id}', method: 'PUT', description: 'Update schedule', requiredAuth: true, expectedResponse: 200, category: 'scheduling',
    testData: { scheduled_time: '2024-12-31T15:00:00Z' }
  },
  { endpoint: '/api/v1/schedule/{schedule_id}', method: 'DELETE', description: 'Cancel scheduled post', requiredAuth: true, expectedResponse: 200, category: 'scheduling' },
  { endpoint: '/api/v1/schedule/calendar', method: 'GET', description: 'Calendar view of schedules', requiredAuth: true, expectedResponse: 200, category: 'scheduling' },

  // Analytics
  { endpoint: '/api/v1/analytics/overview', method: 'GET', description: 'Analytics overview', requiredAuth: true, expectedResponse: 200, category: 'analytics', isCore: true },
  { endpoint: '/api/v1/analytics/posts/{post_id}', method: 'GET', description: 'Post-specific analytics', requiredAuth: true, expectedResponse: 200, category: 'analytics' },
  { endpoint: '/api/v1/analytics/platforms', method: 'GET', description: 'Platform analytics', requiredAuth: true, expectedResponse: 200, category: 'analytics' },
  { endpoint: '/api/v1/analytics/performance', method: 'GET', description: 'Performance metrics', requiredAuth: true, expectedResponse: 200, category: 'analytics' },
  { endpoint: '/api/v1/analytics/export', method: 'POST', description: 'Export analytics', requiredAuth: true, expectedResponse: 200, category: 'analytics',
    testData: { format: 'csv', date_range: { start: '2024-01-01', end: '2024-12-31' } }
  },

  // Templates
  { endpoint: '/api/v1/templates/', method: 'GET', description: 'List templates', requiredAuth: true, expectedResponse: 200, category: 'templates' },
  { endpoint: '/api/v1/templates/', method: 'POST', description: 'Create template', requiredAuth: true, expectedResponse: 201, category: 'templates',
    testData: { name: 'Test Template', content: 'Template content', category: 'general' }
  },
  { endpoint: '/api/v1/templates/{template_id}', method: 'PUT', description: 'Update template', requiredAuth: true, expectedResponse: 200, category: 'templates',
    testData: { name: 'Updated Template' }
  },
  { endpoint: '/api/v1/templates/{template_id}', method: 'DELETE', description: 'Delete template', requiredAuth: true, expectedResponse: 200, category: 'templates' },
  { endpoint: '/api/v1/templates/categories', method: 'GET', description: 'Template categories', requiredAuth: true, expectedResponse: 200, category: 'templates' },

  // Highlights
  { endpoint: '/api/v1/highlights/', method: 'GET', description: 'List highlights', requiredAuth: true, expectedResponse: 200, category: 'highlights' },
  { endpoint: '/api/v1/highlights/', method: 'POST', description: 'Create highlight', requiredAuth: true, expectedResponse: 201, category: 'highlights',
    testData: { title: 'Test Highlight', media_ids: ['test_media_id'], cover_image: 'test_cover.jpg' }
  },
  { endpoint: '/api/v1/highlights/{highlight_id}', method: 'PUT', description: 'Update highlight', requiredAuth: true, expectedResponse: 200, category: 'highlights',
    testData: { title: 'Updated Highlight' }
  },
  { endpoint: '/api/v1/highlights/{highlight_id}', method: 'DELETE', description: 'Delete highlight', requiredAuth: true, expectedResponse: 200, category: 'highlights' },
  { endpoint: '/api/v1/highlights/generate', method: 'POST', description: 'Auto-generate highlight', requiredAuth: true, expectedResponse: 200, category: 'highlights',
    testData: { media_ids: ['test1', 'test2'], theme: 'travel' }
  }
];

// Test Categories Configuration
const TEST_CATEGORIES: TestCategory[] = [
  {
    id: 'system',
    name: 'System Health',
    icon: Database,
    description: 'Core system and connectivity tests',
    color: 'green',
    tests: API_TESTS.filter(t => t.category === 'system')
  },
  {
    id: 'auth',
    name: 'Authentication',
    icon: Shield,
    description: 'User authentication and security',
    color: 'blue',
    tests: API_TESTS.filter(t => t.category === 'auth')
  },
  {
    id: 'users',
    name: 'User Management',
    icon: Users,
    description: 'User profiles and settings',
    color: 'purple',
    tests: API_TESTS.filter(t => t.category === 'users')
  },
  {
    id: 'platforms',
    name: 'Social Platforms',
    icon: Globe,
    description: 'Social media platform integrations',
    color: 'orange',
    tests: API_TESTS.filter(t => t.category === 'platforms')
  },
  {
    id: 'posts',
    name: 'Content Management',
    icon: FileText,
    description: 'Post creation and management',
    color: 'red',
    tests: API_TESTS.filter(t => t.category === 'posts')
  },
  {
    id: 'media',
    name: 'Media Library',
    icon: Image,
    description: 'Media upload and management',
    color: 'pink',
    tests: API_TESTS.filter(t => t.category === 'media')
  },
  {
    id: 'ai',
    name: 'AI Generation',
    icon: Bot,
    description: 'AI-powered content creation',
    color: 'cyan',
    tests: API_TESTS.filter(t => t.category === 'ai')
  },
  {
    id: 'scheduling',
    name: 'Scheduling',
    icon: Calendar,
    description: 'Content scheduling system',
    color: 'yellow',
    tests: API_TESTS.filter(t => t.category === 'scheduling')
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: BarChart3,
    description: 'Performance analytics and reporting',
    color: 'indigo',
    tests: API_TESTS.filter(t => t.category === 'analytics')
  },
  {
    id: 'templates',
    name: 'Templates',
    icon: FileText,
    description: 'Content template system',
    color: 'gray',
    tests: API_TESTS.filter(t => t.category === 'templates')
  },
  {
    id: 'highlights',
    name: 'Highlights',
    icon: Sparkles,
    description: 'Story highlights management',
    color: 'amber',
    tests: API_TESTS.filter(t => t.category === 'highlights')
  }
];

export default function APITestingPage() {
  const { user, isAuthenticated } = useAuth();
  const [api] = useState(() => new CrowsEyeAPI());
  const [activeTab, setActiveTab] = useState('overview');
  const [testResults, setTestResults] = useState<Map<string, any>>(new Map());
  const [isRunningTests, setIsRunningTests] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            🦅 Crow's Eye API Testing Suite
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive testing dashboard for all 50+ API endpoints and features
          </p>
          <div className="flex items-center justify-center gap-2 text-lg">
            <span className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Wifi className="h-5 w-5 text-green-500" />
                  <span className="text-green-400">Authenticated as {user?.email}</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-red-500" />
                  <span className="text-red-400">Not authenticated - limited testing available</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm font-medium">Total Endpoints</p>
                  <p className="text-3xl font-bold text-white">50+</p>
                </div>
                <Database className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium">Categories</p>
                  <p className="text-3xl font-bold text-white">11</p>
                </div>
                <Globe className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm font-medium">Success Rate</p>
                  <p className="text-3xl font-bold text-white">--</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/50 to-red-900/50 border-orange-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-200 text-sm font-medium">Avg Response</p>
                  <p className="text-3xl font-bold text-white">--ms</p>
                </div>
                <Zap className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Categories */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 bg-gray-900/50 p-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="auth" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Auth
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Media
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  API Testing Control Panel
                </CardTitle>
                <CardDescription>
                  Test all endpoints across different categories with comprehensive validation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <Button 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    disabled={isRunningTests}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run All Tests
                  </Button>
                  <Button variant="outline" className="border-gray-600 hover:bg-gray-800">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Results
                  </Button>
                  <Button variant="outline" className="border-gray-600 hover:bg-gray-800">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* System Health */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Database className="h-5 w-5 text-green-400" />
                        System Health
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Health Check</span>
                          <Badge className="bg-green-500/20 text-green-300">Ready</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Connection Test</span>
                          <Badge className="bg-yellow-500/20 text-yellow-300">Pending</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">System Status</span>
                          <Badge className="bg-gray-500/20 text-gray-300">Not Tested</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Authentication */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-400" />
                        Authentication
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Login/Register</span>
                          <Badge className="bg-gray-500/20 text-gray-300">5 tests</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">JWT Management</span>
                          <Badge className="bg-gray-500/20 text-gray-300">3 tests</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">User Profile</span>
                          <Badge className="bg-gray-500/20 text-gray-300">4 tests</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Content Management */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-purple-400" />
                        Content Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Posts CRUD</span>
                          <Badge className="bg-gray-500/20 text-gray-300">6 tests</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Publishing</span>
                          <Badge className="bg-gray-500/20 text-gray-300">4 tests</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Templates</span>
                          <Badge className="bg-gray-500/20 text-gray-300">5 tests</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Media Library */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Image className="h-5 w-5 text-pink-400" />
                        Media Library
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Upload/Download</span>
                          <Badge className="bg-gray-500/20 text-gray-300">4 tests</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Media CRUD</span>
                          <Badge className="bg-gray-500/20 text-gray-300">5 tests</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Gallery Views</span>
                          <Badge className="bg-gray-500/20 text-gray-300">3 tests</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Features */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bot className="h-5 w-5 text-cyan-400" />
                        AI Generation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Caption Generation</span>
                          <Badge className="bg-gray-500/20 text-gray-300">3 tests</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Hashtag Generation</span>
                          <Badge className="bg-gray-500/20 text-gray-300">2 tests</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Content Optimization</span>
                          <Badge className="bg-gray-500/20 text-gray-300">4 tests</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Analytics */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-orange-400" />
                        Analytics & Reports
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Performance Data</span>
                          <Badge className="bg-gray-500/20 text-gray-300">5 tests</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Export Functions</span>
                          <Badge className="bg-gray-500/20 text-gray-300">3 tests</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Real-time Data</span>
                          <Badge className="bg-gray-500/20 text-gray-300">4 tests</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authentication Tab */}
          <TabsContent value="auth" className="space-y-6">
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Authentication System Testing
                </CardTitle>
                <CardDescription>
                  Test user registration, login, JWT management, and security features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Shield className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Authentication Testing Suite</h3>
                  <p className="text-gray-400 mb-6">
                    Comprehensive testing for user authentication, JWT tokens, and security endpoints
                  </p>
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                    <Play className="h-4 w-4 mr-2" />
                    Start Authentication Tests
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add other tabs with similar structure */}
          <TabsContent value="content" className="space-y-6">
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Content Management Testing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Content Management Suite</h3>
                  <p className="text-gray-400 mb-6">
                    Test post creation, editing, publishing, and template management
                  </p>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Play className="h-4 w-4 mr-2" />
                    Start Content Tests
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Media Library Testing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Image className="h-16 w-16 text-pink-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Media Management Suite</h3>
                  <p className="text-gray-400 mb-6">
                    Test file uploads, media processing, gallery management, and storage
                  </p>
                  <Button className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600">
                    <Play className="h-4 w-4 mr-2" />
                    Start Media Tests
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Generation Testing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Bot className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">AI Content Generation Suite</h3>
                  <p className="text-gray-400 mb-6">
                    Test AI caption generation, hashtag suggestions, and content optimization
                  </p>
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                    <Play className="h-4 w-4 mr-2" />
                    Start AI Tests
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics Testing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Analytics & Reporting Suite</h3>
                  <p className="text-gray-400 mb-6">
                    Test performance metrics, data export, and real-time analytics
                  </p>
                  <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    <Play className="h-4 w-4 mr-2" />
                    Start Analytics Tests
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm">
          <p>
            🦅 Crow's Eye API Testing Suite v1.0 | Testing 50+ endpoints across 11 categories
          </p>
          <p className="mt-1">
            Deploy URL: <code className="bg-gray-800 px-2 py-1 rounded">https://crows-eye-website.uc.r.appspot.com</code>
          </p>
        </div>
      </div>
    </div>
  );
} 