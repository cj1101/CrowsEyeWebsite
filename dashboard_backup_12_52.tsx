'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Calendar, 
  Camera, 
  Settings, 
  Users, 
  Zap, 
  Shield, 
  Upload,
  Play,
  Eye,
  Heart,
  TrendingUp,
  Sparkles,
  Rocket,
  Crown,
  FolderOpen,
  Image,
  Video,
  Music,
  Clock,
  Share2,
  Palette,
  Wand2,
  Link,
  Target,
  CheckCircle,
  AlertCircle,
  Plus,
  Grid3X3,
  List,
  Search,
  Filter,
  Download,
  Trash2,
  Edit3,
  MessageSquare,
  Hash,
  MapPin,
  Send
} from 'lucide-react';

// Import dashboard components
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import LibraryTab from '@/components/dashboard/LibraryTab';
import CreatePostTab from '@/components/dashboard/CreatePostTab';
import ScheduleTab from '@/components/dashboard/ScheduleTab';
import AnalyticsTab from '@/components/dashboard/AnalyticsTab';
import ConnectionsTab from '@/components/dashboard/ConnectionsTab';

export default function DashboardPage() {
  const { user, userProfile, loading, hasValidSubscription, requiresSubscription, needsPAYGSetup } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Temporarily bypass authentication for production testing
  const shouldBypassAuth = true; // TODO: Remove this after testing

  // Enhanced authentication and subscription enforcement
  useEffect(() => {
    if (!shouldBypassAuth && !loading) {
      // If not authenticated, redirect to pricing page
      if (!user) {
        router.push('/pricing?required=true');
        return;
      }

      // If authenticated but no valid subscription, redirect to pricing
      if (user && userProfile && !hasValidSubscription()) {
        // Special case: if user needs PAYG setup, send them to PAYG setup instead
        if (needsPAYGSetup()) {
          router.push('/payg-setup');
        } else {
          router.push('/pricing?required=true');
        }
        return;
      }
    }
  }, [shouldBypassAuth, user, userProfile, loading, hasValidSubscription, needsPAYGSetup, router]);

  if (!shouldBypassAuth && loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!shouldBypassAuth && (!user || (userProfile && !hasValidSubscription()))) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-300">Redirecting...</p>
        </div>
      </div>
    );
  }

  const getPlanLabel = (tier?: string) => {
    switch (tier) {
      case 'payg':
        return 'Pay-as-you-Go';
      case 'creator':
        return 'Creator';
      case 'growth':
        return 'Growth';
      case 'pro':
        return 'Pro';
      default:
        return 'Free';
    }
  };

  const navigationItems = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3, description: 'Overview & Analytics' },
    { id: 'library', label: 'Media Library', icon: FolderOpen, description: 'Manage your content' },
    { id: 'create', label: 'Create Post', icon: Plus, description: 'Create new content' },
    { id: 'schedule', label: 'Scheduler', icon: Calendar, description: 'Manage scheduled posts' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, description: 'Performance insights' },
    { id: 'connections', label: 'Platforms', icon: Link, description: 'Social media accounts' },
  ];

  const quickActions = [
    { 
      label: 'Upload Media', 
      icon: Upload, 
      action: () => setActiveTab('library'),
      color: 'blue',
      description: 'Add new photos and videos'
    },
    { 
      label: 'Create Post', 
      icon: Plus, 
      action: () => setActiveTab('create'),
      color: 'green',
      description: 'Start creating content'
    },
    { 
      label: 'AI Tools', 
      icon: Wand2, 
      action: () => setActiveTab('create'),
      color: 'purple',
      description: 'Use AI to enhance content'
    },
    { 
      label: 'Connect Platform', 
      icon: Link, 
      action: () => setActiveTab('connections'),
      color: 'orange',
      description: 'Link social accounts'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            
            <div>
              <h1 className="text-xl font-bold text-white">Crow's Eye Dashboard</h1>
              <p className="text-sm text-gray-400">
                Welcome back, {userProfile?.displayName || user.email?.split('@')[0]}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  onClick={action.action}
                  className={`
                    border-gray-700 hover:border-${action.color}-500 
                    hover:bg-${action.color}-500/10 hover:text-${action.color}-400
                    transition-all duration-200 group
                  `}
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              ))}
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {getPlanLabel(userProfile?.subscription_tier)} Plan
              </Badge>
              
              {userProfile?.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt="Profile"
                  className="h-8 w-8 rounded-full border border-gray-600"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <Users className="h-4 w-4 text-gray-300" />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'w-64' : 'w-16'} 
          bg-gray-900/30 border-r border-gray-800 transition-all duration-300
          ${sidebarOpen ? 'block' : 'hidden lg:block'}
        `}>
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  ${activeTab === item.id 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                  }
                `}
              >
                <item.icon className={`h-5 w-5 ${sidebarOpen ? '' : 'mx-auto'}`} />
                {sidebarOpen && (
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-400">{item.description}</div>
                  </div>
                )}
              </button>
            ))}
          </nav>

          {sidebarOpen && userProfile?.subscription_tier === 'free' && (
            <div className="p-4 mt-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl">🚀</div>
                    <div className="text-sm font-medium text-white">Upgrade for More</div>
                    <div className="text-xs text-gray-400">
                      Unlock advanced features and unlimited posting
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      onClick={() => router.push('/pricing')}
                    >
                      View Plans
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {activeTab === 'overview' && <DashboardOverview />}
            {activeTab === 'library' && <LibraryTab />}
            {activeTab === 'create' && <CreatePostTab />}
            {activeTab === 'schedule' && <ScheduleTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'connections' && <ConnectionsTab />}
          </div>
        </main>
      </div>
    </div>
  );
} 