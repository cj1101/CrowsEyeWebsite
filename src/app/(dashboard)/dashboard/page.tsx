'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LibraryTab from '@/components/dashboard/LibraryTab';
import CreatePostTab from '@/components/dashboard/CreatePostTab';
import SchedulingTab from '@/components/dashboard/SchedulingTab';
import ToolsTab from '@/components/dashboard/ToolsTab';
import AnalyticsTab from '@/components/dashboard/AnalyticsTab';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('library');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Crow's Eye Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            Manage your social media content and campaigns
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800/50 backdrop-blur-sm">
            <TabsTrigger 
              value="library" 
              className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-blue-600/50"
            >
              Library
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
              Tools
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-blue-600/50"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-6">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Media Library</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your media files and AI processing
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
                  Create and customize your social media posts
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
                <CardTitle className="text-white">Scheduling</CardTitle>
                <CardDescription className="text-gray-400">
                  Schedule posts and manage your content calendar
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
                <CardTitle className="text-white">AI Tools</CardTitle>
                <CardDescription className="text-gray-400">
                  AI-powered content creation and optimization tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ToolsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Analytics</CardTitle>
                <CardDescription className="text-gray-400">
                  Track your social media performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsTab />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 