'use client';

import React, { useState } from 'react';
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
import { 
  CpuChipIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export default function MarketingToolDashboard() {
  const { user, userProfile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

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
                <p className="text-gray-400 text-sm">AI-Powered Content Creation Suite</p>
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

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
        </Tabs>
      </div>
    </div>
  );
} 