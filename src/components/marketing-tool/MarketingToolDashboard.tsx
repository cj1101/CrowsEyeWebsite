'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CreatePostTab from '@/components/dashboard/CreatePostTab';
import SchedulingTab from '@/components/dashboard/SchedulingTab';
import ToolsTab from '@/components/dashboard/ToolsTab';
import MediaUpload from '@/components/media/MediaUpload';
import HighlightGenerator from '@/components/ai/HighlightGenerator';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import ComplianceDashboard from '@/components/compliance/ComplianceDashboard';
import AccountManagementDashboard from '@/components/compliance/AccountManagementDashboard';
import VideoProcessingHub from '@/components/video-processing/VideoProcessingHub';
import { 
  CpuChipIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';

export default function MarketingToolDashboard() {
  const { user, userProfile, loading, isConfigured } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get tab from URL parameters, default to 'overview'
  const tabFromUrl = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
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
        // Use the correct health endpoint that we know works
        const response = await fetch('https://firebasestorage.googleapis.com/api/v1/health');
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'ok') {
            setApiStatus('connected');
          } else {
            setApiStatus('error');
          }
        } else {
          setApiStatus('error');
        }
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
                  {isConfigured ? 'Connected' : 'Demo Mode'}
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

      {/* System Status Warning */}
      {!isConfigured && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
              <p className="text-yellow-200 text-sm">
                Running in demo mode. Some features may be limited. Please configure Firebase for full functionality.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showConnectionSuccess && connectedPlatform && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-300">
                  {connectedPlatform.charAt(0).toUpperCase() + connectedPlatform.slice(1)} connected successfully!
                </p>
                <p className="text-xs text-green-400 mt-1">
                  You can now use {connectedPlatform.charAt(0).toUpperCase() + connectedPlatform.slice(1)} features in your campaigns.
                </p>
              </div>
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
      )}

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-gray-800/50 backdrop-blur-sm">
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
              value="video-processing" 
              className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-blue-600/50"
            >
              Video AI
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
              value="analytics" 
              className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-blue-600/50"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="account-management" 
              className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-blue-600/50"
            >
              Account Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Media Tools</CardTitle>
                <CardDescription className="text-gray-400">
                  Access powerful AI-driven media creation and editing tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Photo Generation */}
                  <Button
                    onClick={() => router.push('/ai-tools/photo-generation')}
                    className="h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-3 rounded-full bg-purple-500/20">
                        <svg className="h-8 w-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-white">Photo Generation</span>
                    </div>
                  </Button>

                  {/* Video Generation */}
                  <Button
                    onClick={() => router.push('/ai-tools/video-generation')}
                    className="h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-3 rounded-full bg-blue-500/20">
                        <svg className="h-8 w-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-white">Video Generation</span>
                    </div>
                  </Button>

                  {/* Edit Photo */}
                  <Button
                    onClick={() => router.push('/ai-tools/photo-editor')}
                    className="h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 hover:border-green-400/50 transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-3 rounded-full bg-green-500/20">
                        <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-white">Edit Photo</span>
                    </div>
                  </Button>

                  {/* Video Processing Suite */}
                  <Button
                    onClick={() => router.push('/ai-tools/video-processing')}
                    className="h-24 bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 hover:border-orange-400/50 transition-all duration-200 hover:scale-105"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-3 rounded-full bg-orange-500/20">
                        <svg className="h-8 w-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-white">Video Processing Suite</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="video-processing" className="space-y-6">
            <VideoProcessingHub />
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <CreatePostTab />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <SchedulingTab />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Performance Analytics</CardTitle>
                  <CardDescription className="text-gray-400">
                    Detailed metrics and insights from your campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AnalyticsDashboard />
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Processing Statistics</CardTitle>
                  <CardDescription className="text-gray-400">
                    Video processing and API usage metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-700/50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400">24</div>
                        <div className="text-sm text-gray-400">Videos Processed</div>
                      </div>
                      <div className="p-3 bg-gray-700/50 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">18</div>
                        <div className="text-sm text-gray-400">Highlights Created</div>
                      </div>
                      <div className="p-3 bg-gray-700/50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-400">142</div>
                        <div className="text-sm text-gray-400">Photos Imported</div>
                      </div>
                      <div className="p-3 bg-gray-700/50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-400">2.3GB</div>
                        <div className="text-sm text-gray-400">Storage Used</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Account Management Monitor</CardTitle>
                  <CardDescription className="text-gray-400">
                    Monitor your account across all platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ComplianceDashboard showHeader={false} />
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Legacy AI Tools</CardTitle>
                  <CardDescription className="text-gray-400">
                    Classic content generation tools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <MediaUpload key={activeTab} />
                    <HighlightGenerator />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="account-management" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Account Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your platform connections, monitor account health, and ensure optimal performance across all integrated services
                </CardDescription>
              </CardHeader>
                              <CardContent>
                  <AccountManagementDashboard showHeader={true} />
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 