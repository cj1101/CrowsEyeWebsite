'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LibraryTab from '@/components/dashboard/LibraryTab';
import CreatePostTab from '@/components/dashboard/CreatePostTab';
import SchedulingTab from '@/components/dashboard/SchedulingTab';
import ToolsTab from '@/components/dashboard/ToolsTab';
import AnalyticsTab from '@/components/dashboard/AnalyticsTab';
import MediaUpload from '@/components/media/MediaUpload';
import HighlightGenerator from '@/components/ai/HighlightGenerator';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import ComplianceDashboard from '@/components/compliance/ComplianceDashboard';
import { 
  CpuChipIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';

export default function MarketingToolDashboard() {
  const { user, userProfile, loading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get tab from URL parameters, default to 'overview'
  const tabFromUrl = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [showConnectionSuccess, setShowConnectionSuccess] = useState(false);

  // Check for connection success message
  const connectedPlatform = searchParams.get('connected');
  
  useEffect(() => {
    if (connectedPlatform) {
      setShowConnectionSuccess(true);
      // Auto-hide success message after 5 seconds
      const timer = setTimeout(() => {
        setShowConnectionSuccess(false);
        // Clean up the URL parameter
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete('connected');
        const newUrl = newSearchParams.toString() ? 
          `/marketing-tool?${newSearchParams.toString()}` : 
          '/marketing-tool';
        router.replace(newUrl, { scroll: false });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [connectedPlatform, searchParams, router]);

  // Update tab when URL parameters change
  useEffect(() => {
    const urlTab = searchParams.get('tab') || 'overview';
    setActiveTab(urlTab);
  }, [searchParams]);

  useEffect(() => {
    // Check API health on component mount
    const checkApiHealth = async () => {
      try {
        await apiService.healthCheck();
        setApiStatus('connected');
      } catch (error) {
        console.error('API health check failed:', error);
        setApiStatus('error');
      }
    };
    
    checkApiHealth();
  }, []);

  // Handle tab changes and update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL without page reload
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('tab', value);
    router.push(`/marketing-tool?${newSearchParams.toString()}`, { scroll: false });
  };

  // Show loading state while authenticating
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-300 mt-4">Loading Web Application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Enhanced Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                <CpuChipIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Crow's Eye Web Application
                </h1>
                <div className="flex items-center space-x-3">
                  <p className="text-gray-400 text-sm">AI-Powered Content Creation Suite</p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      apiStatus === 'connected' ? 'bg-green-500' : 
                      apiStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : 
                      'bg-red-500'
                    }`}></div>
                    <span className="text-xs text-gray-500">
                      {apiStatus === 'connected' ? 'API Connected' : 
                       apiStatus === 'checking' ? 'Checking API...' : 
                       'API Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-gray-300 text-sm">
                  {user ? `Welcome, ${userProfile?.displayName || user?.email?.split('@')[0]}` : 'Welcome to Crow\'s Eye'}
                </span>
                <div className="text-xs text-purple-300">
                  Pro Plan
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                {user && (userProfile as any)?.photoURL ? (
                  <img src={(userProfile as any).photoURL} alt="Profile" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <UserGroupIcon className="h-6 w-6 text-white" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showConnectionSuccess && connectedPlatform && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-300">
                  {connectedPlatform.charAt(0).toUpperCase() + connectedPlatform.slice(1)} connected successfully!
                </p>
                <p className="text-xs text-green-400 mt-1">
                  You can now use {connectedPlatform.charAt(0).toUpperCase() + connectedPlatform.slice(1)} features in your campaigns.
                </p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => setShowConnectionSuccess(false)}
                  className="text-green-400 hover:text-green-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gray-800/50 backdrop-blur-sm">
            <TabsTrigger 
              value="overview" 
              className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-blue-600/50"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="library" 
              className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-blue-600/50"
            >
              Media Library
            </TabsTrigger>
            <TabsTrigger 
              value="create" 
              className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-blue-600/50"
            >
              Create Post
            </TabsTrigger>
            <TabsTrigger 
              value="schedule" 
              className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-blue-600/50"
            >
              Scheduling
            </TabsTrigger>
            <TabsTrigger 
              value="tools" 
              className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-blue-600/50"
            >
              AI Tools
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-blue-600/50"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="compliance" 
              className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-blue-600/50"
            >
              Compliance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Media Upload</CardTitle>
                <CardDescription className="text-gray-400">
                  Upload and manage your media files with drag & drop support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MediaUpload />
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Media Library</CardTitle>
                <CardDescription className="text-gray-400">
                  Browse, organize, and manage your uploaded content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LibraryTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Create Post</CardTitle>
                <CardDescription className="text-gray-400">
                  Design and customize your social media posts with AI assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreatePostTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Content Scheduling</CardTitle>
                <CardDescription className="text-gray-400">
                  Schedule posts, manage your content calendar, and automate publishing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SchedulingTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">AI Highlight Generator</CardTitle>
                <CardDescription className="text-gray-400">
                  Generate engaging video highlights automatically using AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HighlightGenerator />
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">AI-Powered Tools</CardTitle>
                <CardDescription className="text-gray-400">
                  Advanced AI tools for content creation, optimization, and automation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ToolsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <ComplianceDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 