'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload,
  FolderOpen,
  Palette,
  Plus,
  Grid3X3,
  Users,
  BarChart3
} from 'lucide-react';

// Import dashboard components
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import LibraryTab from '@/components/dashboard/LibraryTab';
import CreatePostTab from '@/components/dashboard/CreatePostTab';
import BrandingTab from '@/components/dashboard/BrandingTab';

function DashboardContent() {
  const { user, userProfile, loading, hasValidSubscription, requiresSubscription, needsPAYGSetup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Enhanced authentication and subscription enforcement
  useEffect(() => {
    if (!loading) {
      // If not authenticated, redirect to the login page.
      if (!user) {
        router.push('/auth/login?reason=unauthenticated');
        return;
      }

      // If authenticated but has no valid plan, redirect to the pricing page.
      if (user && userProfile && (!userProfile.plan || userProfile.plan === 'free')) {
        router.push('/pricing?reason=subscription_required');
        return;
      }
      
      // If on PAYG plan but needs to set up payment method.
      if (needsPAYGSetup()) {
        router.push('/payg-setup');
        return;
      }
    }
  }, [user, userProfile, loading, needsPAYGSetup, router]);

  // Sync activeTab when URL param changes (e.g. redirects)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams, activeTab]);

  if (loading || !userProfile || (!userProfile.plan || userProfile.plan === 'free')) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-300">Verifying access...</p>
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

  const handleTabSelect = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/dashboard?tab=${tabId}`);
  };

  // Navigation items with beta tagging
  const navigationItems = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3, description: 'Overview & insights', beta: false },
    { id: 'library', label: 'Media Library', icon: FolderOpen, description: 'Manage your content', beta: false },
    { id: 'create', label: 'Create Post', icon: Plus, description: 'Create new content', beta: false },
    { id: 'branding', label: 'Branding', icon: Palette, description: 'Brand guidelines', beta: false }
  ];

  const quickActions = [
    {
      label: 'Upload Media',
      icon: Upload,
      action: () => handleTabSelect('library'),
      color: 'blue',
      description: 'Add new photos and videos'
    },
    {
      label: 'Create Post',
      icon: Plus,
      action: () => handleTabSelect('create'),
      color: 'green',
      description: 'Start creating content'
    },
    {
      label: 'Brand Kit',
      icon: Palette,
      action: () => handleTabSelect('branding'),
      color: 'purple',
      description: 'Manage brand assets'
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
                Welcome back, {userProfile?.displayName || user?.email?.split('@')[0] || 'Guest'}
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
          ${sidebarOpen ? 'block' : 'hidden'} md:block md:w-64
          bg-gray-900/30 border-r border-gray-800 transition-all duration-300
          fixed md:relative z-30 h-full
        `}>
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabSelect(item.id)}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  ${activeTab === item.id 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                <div className="flex-1 text-left">
                  <div className="font-medium flex items-center">
                    {item.label}
                    {item.beta && (
                      <Badge className="ml-2 bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-[10px] py-0 px-1">
                        Beta
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">{item.description}</div>
                </div>
              </button>
            ))}
          </nav>

          {userProfile?.subscription_tier === 'free' && (
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
        <main className="flex-1 overflow-hidden md:ml-0">
          <div className="h-full overflow-y-auto">
            {activeTab === 'overview' && <DashboardOverview />}
            {activeTab === 'library' && <LibraryTab />}
            {activeTab === 'create' && <CreatePostTab />}
            {activeTab === 'branding' && <BrandingTab />}
          </div>
        </main>
      </div>
    </div>
  );
}

// Wrapper component with Suspense boundary for useSearchParams
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
} 