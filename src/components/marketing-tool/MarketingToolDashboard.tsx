'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  PhotoIcon, 
  PlayIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  FolderIcon,
  SparklesIcon,
  UserGroupIcon,
  PlusIcon,
  CloudArrowUpIcon,
  MusicalNoteIcon,
  VideoCameraIcon,
  PresentationChartLineIcon,
  CpuChipIcon,
  ComputerDesktopIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

type TabType = 'dashboard' | 'media' | 'gallery' | 'stories' | 'highlights' | 'audio' | 'analytics' | 'admin' | 'desktop' | 'settings';

interface UserStats {
  totalMediaFiles: number;
  totalGalleries: number;
  totalStories: number;
  totalHighlights: number;
  totalAudioFiles: number;
  subscriptionTier: string;
  storageUsed: number;
  storageLimit: number;
  recentActivity: Array<{
    id: string;
    action: string;
    timestamp: string;
    type: 'success' | 'info' | 'warning';
  }>;
}

export default function MarketingToolDashboard() {
  const { user, userProfile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch user stats
  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      // Simulate API call - in real implementation, this would call your Python API
      setStats({
        totalMediaFiles: 0,
        totalGalleries: 0,
        totalStories: 0,
        totalHighlights: 0,
        totalAudioFiles: 0,
        subscriptionTier: 'free',
        storageUsed: 0,
        storageLimit: 1000,
        recentActivity: []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Show loading state while authenticating
  if (loading) {
    return (
      <div className="min-h-screen darker-gradient-bg logo-bg-overlay flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-300 mt-4 tech-body">Loading Web Application...</p>
        </div>
      </div>
    );
  }

  // Allow access even without authentication for this version
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon, tier: 'free' },
    { id: 'media', name: 'Media Library', icon: FolderIcon, tier: 'free' },
    { id: 'gallery', name: 'Smart Galleries', icon: PhotoIcon, tier: 'free' },
    { id: 'stories', name: 'Story Formatting', icon: DocumentTextIcon, tier: 'free' },
    { id: 'highlights', name: 'Highlight Reels', icon: VideoCameraIcon, tier: 'creator' },
    { id: 'audio', name: 'Audio Import', icon: MusicalNoteIcon, tier: 'creator' },
    { id: 'analytics', name: 'Analytics', icon: PresentationChartLineIcon, tier: 'pro' },
    { id: 'admin', name: 'Admin', icon: BuildingOfficeIcon, tier: 'enterprise' },
    { id: 'desktop', name: 'Desktop App', icon: ComputerDesktopIcon, tier: 'free' },
    { id: 'settings', name: 'Settings', icon: CogIcon, tier: 'free' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview stats={stats} statsLoading={statsLoading} onRefresh={fetchStats} />;
      case 'media':
        return <MediaManagement />;
      case 'gallery':
        return <SmartGalleries />;
      case 'stories':
        return <StoryFormatting />;
      case 'highlights':
        return <HighlightReels />;
      case 'audio':
        return <AudioImport />;
      case 'analytics':
        return <AnalyticsPanel />;
      case 'admin':
        return <AdminPanel />;
      case 'desktop':
        return <DesktopApp />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardOverview stats={stats} statsLoading={statsLoading} onRefresh={fetchStats} />;
    }
  };

  return (
    <div className="min-h-screen darker-gradient-bg logo-bg-overlay">
      {/* Header */}
      <div className="vision-card border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                <CpuChipIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text-animated tech-heading">Web Application</h1>
                <p className="text-gray-400 text-sm tech-body">AI-Powered Content Creation Suite</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-gray-300 text-sm tech-body">
                  {user ? `Welcome, ${userProfile?.displayName || user?.email}` : 'Welcome to Crow\'s Eye'}
                </span>
                {stats && (
                  <div className="text-xs text-purple-300 tech-body">
                    {stats.subscriptionTier.charAt(0).toUpperCase() + stats.subscriptionTier.slice(1)} Plan
                  </div>
                )}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isLocked = tab.tier !== 'free' && (!stats || stats.subscriptionTier === 'free');
                return (
                  <button
                    key={tab.id}
                    onClick={() => !isLocked && setActiveTab(tab.id as TabType)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'vision-card border-purple-500/50 text-white gradient-text-animated'
                        : isLocked
                        ? 'text-gray-500 cursor-not-allowed opacity-50'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }`}
                    disabled={isLocked}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <span className="tech-body font-medium">{tab.name}</span>
                    {isLocked && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard Overview Component
interface DashboardOverviewProps {
  stats: UserStats | null;
  statsLoading: boolean;
  onRefresh: () => void;
}

function DashboardOverview({ stats, statsLoading, onRefresh }: DashboardOverviewProps) {
  if (statsLoading) {
    return (
      <div className="vision-card p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-gray-300 mt-4 tech-body">Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    { title: 'Media Files', value: stats?.totalMediaFiles || 0, icon: PhotoIcon, color: 'purple' },
    { title: 'Smart Galleries', value: stats?.totalGalleries || 0, icon: FolderIcon, color: 'blue' },
    { title: 'Stories', value: stats?.totalStories || 0, icon: DocumentTextIcon, color: 'green' },
    { title: 'Highlight Reels', value: stats?.totalHighlights || 0, icon: VideoCameraIcon, color: 'pink' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="vision-card p-8">
        <h2 className="text-3xl font-bold gradient-text-animated tech-heading mb-4">
          Welcome to Crow's Eye Web Application
        </h2>
        <p className="text-gray-300 tech-body text-lg leading-relaxed">
          A comprehensive AI-powered marketing platform that replicates all the functionality of our desktop application. 
          Create, manage, and optimize your content with advanced AI tools, media management, analytics, and more.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="vision-card p-6 hover:border-purple-500/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm tech-body">{card.title}</p>
                  <p className="text-3xl font-bold text-white tech-heading">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-r from-${card.color}-500 to-${card.color}-600`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="vision-card p-8">
        <h3 className="text-xl font-bold text-white tech-heading mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 rounded-lg border border-gray-700 hover:border-purple-500 transition-all duration-200 text-left">
            <CloudArrowUpIcon className="h-8 w-8 text-purple-400 mb-2" />
            <h4 className="text-white font-semibold tech-body">Upload Media</h4>
            <p className="text-gray-400 text-sm">Add images and videos to your library</p>
          </button>
          <button className="p-4 rounded-lg border border-gray-700 hover:border-purple-500 transition-all duration-200 text-left">
            <SparklesIcon className="h-8 w-8 text-blue-400 mb-2" />
            <h4 className="text-white font-semibold tech-body">Create Gallery</h4>
            <p className="text-gray-400 text-sm">Generate AI-powered photo galleries</p>
          </button>
          <button className="p-4 rounded-lg border border-gray-700 hover:border-purple-500 transition-all duration-200 text-left">
            <DocumentTextIcon className="h-8 w-8 text-green-400 mb-2" />
            <h4 className="text-white font-semibold tech-body">Format Story</h4>
            <p className="text-gray-400 text-sm">Create engaging stories with templates and AI assistance</p>
          </button>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="vision-card p-8">
        <h3 className="text-xl font-bold text-white tech-heading mb-6">Platform Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-purple-300 font-semibold tech-body">Free Tier</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Media library management</li>
              <li>• Smart galleries with AI</li>
              <li>• Story formatting tools</li>
              <li>• Basic analytics</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-blue-300 font-semibold tech-body">Premium Features</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• 30-second highlight reels (Creator+)</li>
              <li>• Custom audio imports (Creator+)</li>
              <li>• Advanced analytics (Pro+)</li>
              <li>• Multi-account management (Enterprise)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Media Management Component
function MediaManagement() {
  return (
    <div className="space-y-8">
      <div className="vision-card p-8">
        <h2 className="text-2xl font-bold text-white tech-heading mb-6">Media Library</h2>
        <div className="text-center py-12">
          <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Upload Your Media</h3>
          <p className="text-gray-400 mb-6">Drag and drop images or videos to get started</p>
          <button className="vision-button">
            <CloudArrowUpIcon className="h-5 w-5 mr-2" />
            Upload Files
          </button>
        </div>
      </div>
    </div>
  );
}

// Smart Galleries Component
function SmartGalleries() {
  return (
    <div className="space-y-8">
      <div className="vision-card p-8">
        <h2 className="text-2xl font-bold text-white tech-heading mb-6">Smart Galleries</h2>
        <div className="text-center py-12">
          <SparklesIcon className="h-16 w-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">AI-Powered Gallery Creation</h3>
          <p className="text-gray-400 mb-6">Create curated photo galleries with AI assistance</p>
          <button className="vision-button">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Gallery
          </button>
        </div>
      </div>
    </div>
  );
}

// Story Formatting Component
function StoryFormatting() {
  return (
    <div className="space-y-8">
      <div className="vision-card p-8">
        <h2 className="text-2xl font-bold text-white tech-heading mb-6">Story Formatting</h2>
        <div className="text-center py-12">
          <DocumentTextIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Format Stories for Social Media</h3>
          <p className="text-gray-400 mb-6">Create engaging stories with templates and AI assistance</p>
          <button className="vision-button">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Story
          </button>
        </div>
      </div>
    </div>
  );
}

// Highlight Reels Component
function HighlightReels() {
  return (
    <div className="space-y-8">
      <div className="vision-card p-8">
        <h2 className="text-2xl font-bold text-white tech-heading mb-6">Highlight Reels</h2>
        <div className="text-center py-12">
          <VideoCameraIcon className="h-16 w-16 text-pink-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">30-Second Highlight Reels</h3>
          <p className="text-gray-400 mb-6">Create dynamic video highlights with AI editing</p>
          <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-4 mb-6">
            <p className="text-orange-300 text-sm">Creator+ subscription required</p>
          </div>
          <button className="vision-button opacity-50 cursor-not-allowed" disabled>
            <PlayIcon className="h-5 w-5 mr-2" />
            Create Highlight Reel
          </button>
        </div>
      </div>
    </div>
  );
}

// Audio Import Component
function AudioImport() {
  return (
    <div className="space-y-8">
      <div className="vision-card p-8">
        <h2 className="text-2xl font-bold text-white tech-heading mb-6">Audio Import</h2>
        <div className="text-center py-12">
          <MusicalNoteIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Custom Audio Files</h3>
          <p className="text-gray-400 mb-6">Import and edit audio with natural language commands</p>
          <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-4 mb-6">
            <p className="text-orange-300 text-sm">Creator+ subscription required</p>
          </div>
          <button className="vision-button opacity-50 cursor-not-allowed" disabled>
            <CloudArrowUpIcon className="h-5 w-5 mr-2" />
            Import Audio
          </button>
        </div>
      </div>
    </div>
  );
}

// Analytics Panel Component
function AnalyticsPanel() {
  return (
    <div className="space-y-8">
      <div className="vision-card p-8">
        <h2 className="text-2xl font-bold text-white tech-heading mb-6">Analytics</h2>
        <div className="text-center py-12">
          <PresentationChartLineIcon className="h-16 w-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Performance Analytics</h3>
          <p className="text-gray-400 mb-6">Track performance and get AI-powered insights</p>
          <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-4 mb-6">
            <p className="text-orange-300 text-sm">Pro+ subscription required</p>
          </div>
          <button className="vision-button opacity-50 cursor-not-allowed" disabled>
            <ChartBarIcon className="h-5 w-5 mr-2" />
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
}

// Admin Panel Component
function AdminPanel() {
  return (
    <div className="space-y-8">
      <div className="vision-card p-8">
        <h2 className="text-2xl font-bold text-white tech-heading mb-6">Admin Panel</h2>
        <div className="text-center py-12">
          <BuildingOfficeIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Multi-Account Management</h3>
          <p className="text-gray-400 mb-6">Manage team members and organization accounts</p>
          <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-4 mb-6">
            <p className="text-orange-300 text-sm">Enterprise subscription required</p>
          </div>
          <button className="vision-button opacity-50 cursor-not-allowed" disabled>
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Manage Accounts
          </button>
        </div>
      </div>
    </div>
  );
}

// Desktop App Component
function DesktopApp() {
  const handleDownload = (platform: string) => {
    window.open(`/download?platform=${platform}`, '_blank');
  };

  return (
    <div className="space-y-8">
      <div className="vision-card p-8">
        <h2 className="text-2xl font-bold text-white tech-heading mb-6">Desktop Application</h2>
        <div className="text-center py-12">
          <ComputerDesktopIcon className="h-16 w-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Full-Featured Desktop App</h3>
          <p className="text-gray-400 mb-6">Download the complete desktop version with all features unlocked</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <button
              onClick={() => handleDownload('windows')}
              className="vision-button flex items-center justify-center"
            >
              <ComputerDesktopIcon className="h-5 w-5 mr-2" />
              Windows
            </button>
            <button
              onClick={() => handleDownload('mac')}
              className="vision-button flex items-center justify-center"
            >
              <ComputerDesktopIcon className="h-5 w-5 mr-2" />
              macOS
            </button>
            <button
              onClick={() => handleDownload('linux')}
              className="vision-button flex items-center justify-center"
            >
              <ComputerDesktopIcon className="h-5 w-5 mr-2" />
              Linux
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Component
function Settings() {
  return (
    <div className="space-y-8">
      <div className="vision-card p-8">
        <h2 className="text-2xl font-bold text-white tech-heading mb-6">Settings</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white tech-body mb-4">API Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">API Base URL</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  placeholder="http://localhost:8000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  placeholder="Enter your API key"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white tech-body mb-4">Preferences</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input type="checkbox" className="rounded bg-gray-800 border-gray-600 text-purple-500 focus:ring-purple-500" />
                <span className="ml-2 text-gray-300">Enable notifications</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded bg-gray-800 border-gray-600 text-purple-500 focus:ring-purple-500" />
                <span className="ml-2 text-gray-300">Auto-save work</span>
              </label>
            </div>
          </div>
          
          <button className="vision-button">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
} 