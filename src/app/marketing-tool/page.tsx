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
  Crown
} from 'lucide-react';

const planLimits = {
  payg: {
    name: 'Pay-as-you-Go',
    linkedAccounts: 10,
    aiCredits: 'Per usage',
    scheduledPosts: 'Per usage',
    storage: 'Per usage',
    features: {
      basicTools: true,
      smartGallery: true,
      advancedAnalytics: true,
      teamCollaboration: true,
      customBranding: true,
      apiAccess: true
    },
    upgradeUrl: '/pricing'
  },
  creator: {
    name: 'Creator Plan',
    linkedAccounts: 3,
    aiCredits: 150,
    scheduledPosts: 100,
    storage: 5000,
    features: {
      basicTools: true,
      smartGallery: true,
      advancedAnalytics: false,
      teamCollaboration: false,
      customBranding: false,
      apiAccess: false
    },
    upgradeUrl: '/pricing'
  },
  growth: {
    name: 'Growth Plan',
    linkedAccounts: 7,
    aiCredits: 400,
    scheduledPosts: 300,
    storage: 15000,
    features: {
      basicTools: true,
      smartGallery: true,
      advancedAnalytics: true,
      teamCollaboration: false,
      customBranding: true,
      apiAccess: false
    },
    upgradeUrl: '/pricing'
  },
  pro: {
    name: 'Pro Plan',
    linkedAccounts: 10,
    aiCredits: 999999,
    scheduledPosts: 999999,
    storage: 50000,
    features: {
      basicTools: true,
      smartGallery: true,
      advancedAnalytics: true,
      teamCollaboration: true,
      customBranding: true,
      apiAccess: true
    },
    upgradeUrl: '/pricing'
  }
};

const UsageMeter = ({ 
  label, 
  used, 
  max, 
  unit = '', 
  isUnlimited = false, 
  displayText 
}: { 
  label: string; 
  used: number; 
  max: number; 
  unit?: string; 
  isUnlimited?: boolean;
  displayText?: string;
}) => {
  const percentage = isUnlimited ? 100 : Math.min((used / max) * 100, 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-400">
          {isUnlimited ? (
            <span className="text-green-400 font-semibold">∞ Unlimited</span>
          ) : displayText ? (
            <span className="text-blue-400">{displayText}</span>
          ) : (
            `${used}/${max}${unit}`
          )}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            isUnlimited ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
            percentage > 80 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
            percentage > 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
            'bg-gradient-to-r from-blue-500 to-purple-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const PlanCard = ({ userPlan }: { userPlan: 'payg' | 'creator' | 'growth' | 'pro' }) => {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const plan = planLimits[userPlan];
  
  // Check if user has lifetime access
  const isLifetimeUser = userProfile?.subscription_tier === 'pro' && 
                        (userProfile?.subscription_status === 'active' || 
                         userProfile?.subscription_type === 'lifetime');

  const handleUpgradeClick = () => {
    // Use router.push instead of window.open to maintain auth state
    router.push('/pricing');
  };

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-white">{plan.name}</span>
          {isLifetimeUser && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold">
              LIFETIME ACCESS
            </Badge>
          )}
          {userPlan === 'pro' && !isLifetimeUser && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              PRO
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-gray-300">
          {isLifetimeUser ? 'You have unlimited access for life!' : 'Your current plan and usage'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <UsageMeter 
          label="Linked Accounts" 
          used={0} 
          max={plan.linkedAccounts} 
          isUnlimited={isLifetimeUser || userPlan === 'pro'}
        />
        <UsageMeter 
          label="AI Credits" 
          used={0} 
          max={typeof plan.aiCredits === 'number' ? plan.aiCredits : 1000} 
          unit=" credits"
          isUnlimited={isLifetimeUser || userPlan === 'pro'}
          displayText={typeof plan.aiCredits === 'string' ? plan.aiCredits : undefined}
        />
        <UsageMeter 
          label="Scheduled Posts" 
          used={0} 
          max={typeof plan.scheduledPosts === 'number' ? plan.scheduledPosts : 1000} 
          unit=" posts"
          isUnlimited={isLifetimeUser || userPlan === 'pro'}
          displayText={typeof plan.scheduledPosts === 'string' ? plan.scheduledPosts : undefined}
        />
        <UsageMeter 
          label="Storage" 
          used={0} 
          max={typeof plan.storage === 'number' ? plan.storage : 10000} 
          unit="MB"
          isUnlimited={isLifetimeUser || userPlan === 'pro'}
          displayText={typeof plan.storage === 'string' ? plan.storage : undefined}
        />
        
        {userPlan !== 'pro' && !isLifetimeUser && (
          <div className="pt-4 border-t border-gray-700">
            <Button 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={handleUpgradeClick}
            >
              <Rocket className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const QuickStats = () => {
  const mockStats = {
    totalPosts: 0,
    totalEngagement: 0,
    reach: 0,
    growth: 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 text-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Posts</p>
              <p className="text-2xl font-bold">{mockStats.totalPosts}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 text-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Heart className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Engagement</p>
              <p className="text-2xl font-bold">{mockStats.totalEngagement}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 text-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Eye className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Reach</p>
              <p className="text-2xl font-bold">{mockStats.reach}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800 text-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Growth</p>
              <p className="text-2xl font-bold">+{mockStats.growth}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CreatePostCard = () => {
  return (
    <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm border-purple-500/30 text-white">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-400" />
          Create Your First Post
        </CardTitle>
        <CardDescription className="text-gray-300">
          Get started with AI-powered content creation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Media
          </Button>
          <Button 
            variant="outline" 
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            AI Generate
          </Button>
          <Button 
            variant="outline" 
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Schedule
          </Button>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-4">
            Or try one of our AI-powered templates
          </p>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Play className="h-4 w-4 mr-2" />
            Start Creating
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const FeatureCard = ({ icon: Icon, title, description, available, upgradeText }: {
  icon: any;
  title: string;
  description: string;
  available: boolean;
  upgradeText?: string;
}) => {
  return (
    <Card className={`bg-gray-900/50 backdrop-blur-sm border-gray-800 text-white transition-all duration-300 hover:border-purple-500/50 ${!available ? 'opacity-60' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-lg ${available ? 'bg-purple-500/20' : 'bg-gray-500/20'}`}>
            <Icon className={`h-6 w-6 ${available ? 'text-purple-400' : 'text-gray-400'}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <p className="text-gray-400 text-sm mb-4">{description}</p>
            {!available && upgradeText && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{upgradeText}</span>
                <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
                  Upgrade
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function MarketingToolPage() {
  const { user, userProfile, hasValidSubscription, requiresSubscription } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!userProfile) {
      router.push('/auth/signin');
      return;
    }
    
    // Check if user needs to set up subscription
    if (requiresSubscription()) {
      console.log('🔒 User requires subscription setup, redirecting to pricing');
      router.push('/pricing?required=true');
      return;
    }
  }, [userProfile, requiresSubscription, router]);

  // Show loading while checking auth and subscription
  if (!userProfile || requiresSubscription()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-300 mt-4">
            {!userProfile ? 'Checking authentication...' : 'Checking subscription status...'}
          </p>
        </div>
      </div>
    );
  }

  // Determine user plan - default to payg if no subscription tier
  const userPlan: 'payg' | 'creator' | 'growth' | 'pro' = userProfile?.subscription_tier === 'free' 
    ? 'payg' 
    : (userProfile?.subscription_tier as 'payg' | 'creator' | 'growth' | 'pro') || 'payg';

  // Check if user has lifetime access
  const isLifetimeUser = userProfile?.subscription_tier === 'pro' && 
                        (userProfile?.subscription_status === 'active' || 
                         userProfile?.subscription_type === 'lifetime');

  const currentPlan = planLimits[userPlan];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Welcome back, {userProfile?.firstName || 'Creator'}!
              </h1>
              <p className="text-gray-300 mt-2">
                Ready to create amazing content? Let's get started with your {currentPlan.name}.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                ✨ AI-Powered
              </Badge>
              <Button 
                onClick={() => router.push('/account/settings')}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:border-purple-500"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 bg-gray-800/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-purple-500">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="create" className="text-white data-[state=active]:bg-purple-500">
              <Sparkles className="h-4 w-4 mr-2" />
              Create
            </TabsTrigger>
            <TabsTrigger value="library" className="text-white data-[state=active]:bg-purple-500">
              <Camera className="h-4 w-4 mr-2" />
              Library
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-purple-500">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Quick Stats */}
            <QuickStats />

            {/* Plan Status and Create Post */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <PlanCard userPlan={userPlan} />
              </div>
              <div className="lg:col-span-2">
                <CreatePostCard />
              </div>
            </div>

            {/* Features Grid */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Available Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard
                  icon={Upload}
                  title="Media Upload"
                  description="Upload and organize your photos and videos"
                  available={currentPlan.features.basicTools}
                />
                <FeatureCard
                  icon={Sparkles}
                  title="AI Content Generation"
                  description="Generate captions, hashtags, and content ideas"
                  available={currentPlan.features.basicTools}
                />
                <FeatureCard
                  icon={Calendar}
                  title="Post Scheduling"
                  description="Schedule posts across multiple platforms"
                  available={currentPlan.features.basicTools}
                />
                <FeatureCard
                  icon={Eye}
                  title="Smart Gallery"
                  description="AI-powered image organization and search"
                  available={currentPlan.features.smartGallery}
                  upgradeText={!currentPlan.features.smartGallery ? "Available in Creator+" : undefined}
                />
                <FeatureCard
                  icon={TrendingUp}
                  title="Advanced Analytics"
                  description="Detailed insights and performance metrics"
                  available={currentPlan.features.advancedAnalytics}
                  upgradeText={!currentPlan.features.advancedAnalytics ? "Available in Growth+" : undefined}
                />
                <FeatureCard
                  icon={Users}
                  title="Team Collaboration"
                  description="Work together with your team members"
                  available={currentPlan.features.teamCollaboration}
                  upgradeText={!currentPlan.features.teamCollaboration ? "Available in Pro" : undefined}
                />
                <FeatureCard
                  icon={Shield}
                  title="Custom Branding"
                  description="White-label solutions and custom branding"
                  available={currentPlan.features.customBranding}
                  upgradeText={!currentPlan.features.customBranding ? "Available in Growth+" : undefined}
                />
                <FeatureCard
                  icon={Settings}
                  title="API Access"
                  description="Integrate with your existing workflows"
                  available={currentPlan.features.apiAccess}
                  upgradeText={!currentPlan.features.apiAccess ? "Available in Pro" : undefined}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-8">
            <div className="text-center py-20">
              <Sparkles className="h-16 w-16 text-purple-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Content Creation Studio</h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Create stunning content with AI-powered tools. Upload your media, generate captions, 
                and schedule posts across all your social platforms.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Media
                </Button>
                <Button variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-500/10">
                  <Camera className="h-4 w-4 mr-2" />
                  AI Generate
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="library" className="space-y-8">
            <div className="text-center py-20">
              <Camera className="h-16 w-16 text-purple-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Media Library</h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Your media library is empty. Upload photos and videos to get started with creating amazing content.
              </p>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Upload className="h-4 w-4 mr-2" />
                Upload First Media
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            <div className="text-center py-20">
              <TrendingUp className="h-16 w-16 text-purple-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Analytics Dashboard</h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Track your performance and grow your audience. Analytics will appear here once you start posting content.
              </p>
              {!currentPlan.features.advancedAnalytics && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
                  <p className="text-sm text-gray-400 mb-4">
                    Advanced analytics available in Growth+ plans
                  </p>
                  <Button variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-500/10">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 