'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCrowEye } from '@/hooks/useCrowEye';
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
        return <DashboardOverview stats={stats} statsLoading={statsLoading} onRefresh={fetchStats} onTabChange={setActiveTab} />;
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
        return <DashboardOverview stats={stats} statsLoading={statsLoading} onRefresh={fetchStats} onTabChange={setActiveTab} />;
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
  onTabChange: (tab: TabType) => void;
}

function DashboardOverview({ stats, statsLoading, onRefresh, onTabChange }: DashboardOverviewProps) {
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
          <button 
            onClick={() => onTabChange('media')}
            className="p-4 rounded-lg border border-gray-700 hover:border-purple-500 transition-all duration-200 text-left"
          >
            <CloudArrowUpIcon className="h-8 w-8 text-purple-400 mb-2" />
            <h4 className="text-white font-semibold tech-body">Upload Media</h4>
            <p className="text-gray-400 text-sm">Add images and videos to your library</p>
          </button>
          <button 
            onClick={() => onTabChange('gallery')}
            className="p-4 rounded-lg border border-gray-700 hover:border-purple-500 transition-all duration-200 text-left"
          >
            <SparklesIcon className="h-8 w-8 text-blue-400 mb-2" />
            <h4 className="text-white font-semibold tech-body">Create Gallery</h4>
            <p className="text-gray-400 text-sm">Generate AI-powered photo galleries</p>
          </button>
          <button 
            onClick={() => onTabChange('stories')}
            className="p-4 rounded-lg border border-gray-700 hover:border-purple-500 transition-all duration-200 text-left"
          >
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
  const crowEye = useCrowEye();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      for (let i = 0; i < files.length; i++) {
        await crowEye.media.upload(files[i]);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (crowEye.media.loading) {
    return (
      <div className="vision-card p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-gray-300 mt-4">Loading media library...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="vision-card p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tech-heading">Media Library</h2>
          <button 
            onClick={handleUploadClick}
            disabled={crowEye.media.uploadState.uploading}
            className="vision-button flex items-center"
          >
            <CloudArrowUpIcon className="h-5 w-5 mr-2" />
            {crowEye.media.uploadState.uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {crowEye.media.error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-300 text-sm">{crowEye.media.error}</p>
          </div>
        )}

        {crowEye.media.items.length === 0 ? (
          <div className="text-center py-12">
            <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No media files yet</h3>
            <p className="text-gray-400 mb-6">Upload images or videos to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {crowEye.media.items.map((file: any) => (
              <div key={file.id} className="vision-card p-4 group">
                <div className="aspect-square bg-gray-800 rounded-lg mb-3 overflow-hidden">
                  {file.type === 'image' ? (
                    <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <VideoCameraIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{file.filename}</p>
                    <p className="text-gray-400 text-xs">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  <button
                    onClick={() => crowEye.media.delete(file.id)}
                    className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Smart Galleries Component
function SmartGalleries() {
  const crowEye = useCrowEye();
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [maxItems, setMaxItems] = useState(5);

  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setCreating(true);
    try {
      await crowEye.galleries.create(prompt, maxItems);
      setPrompt('');
      setMaxItems(5);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create gallery:', err);
    } finally {
      setCreating(false);
    }
  };

  if (crowEye.galleries.loading) {
    return (
      <div className="vision-card p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-gray-300 mt-4">Loading galleries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="vision-card p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tech-heading">Smart Galleries</h2>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="vision-button flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Gallery
          </button>
        </div>

        {crowEye.galleries.error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-300 text-sm">{crowEye.galleries.error}</p>
          </div>
        )}

        {showCreateForm && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Create AI Gallery</h3>
            <form onSubmit={handleCreateGallery} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gallery Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Best 5 photos for a winter campaign"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Items: {maxItems}
                </label>
                <input
                  type="range"
                  min="3"
                  max="20"
                  value={maxItems}
                  onChange={(e) => setMaxItems(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={creating || !prompt.trim()}
                  className="vision-button flex items-center"
                >
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  {creating ? 'Creating...' : 'Create Gallery'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {crowEye.galleries.items.length === 0 ? (
          <div className="text-center py-12">
            <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No galleries yet</h3>
            <p className="text-gray-400 mb-6">Create AI-powered galleries from your media</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crowEye.galleries.items.map((gallery) => (
              <div key={gallery.id} className="vision-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white truncate">{gallery.name}</h3>
                  <button
                    onClick={() => crowEye.galleries.delete(gallery.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-400 text-sm mb-3">{gallery.prompt}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{gallery.media_ids.length} items</span>
                  <span>{new Date(gallery.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
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
  const crowEye = useCrowEye();
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState('https://crow-eye-api-605899951231.us-central1.run.app');
  const [apiKey, setApiKey] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // Configuration updated - using centralized config now
    console.log('Settings saved:', { baseUrl, apiKey });
    
    // Save preferences to localStorage (only on client side)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('crow-eye-preferences', JSON.stringify({
          notifications,
          autoSave,
        }));
      } catch (error) {
        console.warn('Failed to save preferences:', error);
      }
    }

    alert('Settings saved successfully!');
  };

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    try {
      // Load saved preferences
      const savedPreferences = localStorage.getItem('crow-eye-preferences');
      if (savedPreferences) {
        const prefs = JSON.parse(savedPreferences);
        setNotifications(prefs.notifications ?? true);
        setAutoSave(prefs.autoSave ?? true);
      }

      // Load saved API config
      const savedConfig = localStorage.getItem('crow-eye-api-config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setBaseUrl(config.baseUrl || 'https://crow-eye-api-605899951231.us-central1.run.app');
        setApiKey(config.apiKey || '');
      }
    } catch (error) {
      console.warn('Failed to load saved settings:', error);
    }
  }, []);

  return (
    <div className="space-y-8">
      <div className="vision-card p-8">
        <h2 className="text-2xl font-bold text-white tech-heading mb-6">Settings</h2>
        
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white tech-body mb-4">API Configuration</h3>
            
            {/* Connection Status */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Connection Status:</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    isConnected ? 'bg-green-500' : error ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className={`text-sm ${
                    isConnected ? 'text-green-400' : error ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {isChecking ? 'Checking...' : isConnected ? 'Connected' : error ? 'Disconnected' : 'Unknown'}
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsChecking(true);
                      setError(null);
                      try {
                        const isHealthy = await crowEye.utils.healthCheck();
                        setIsConnected(isHealthy);
                        if (!isHealthy) {
                          setError('Connection failed');
                        }
                      } catch (err) {
                        setError('Connection failed');
                        setIsConnected(false);
                      } finally {
                        setIsChecking(false);
                      }
                    }}
                    disabled={isChecking}
                    className="text-xs text-purple-400 hover:text-purple-300 underline"
                  >
                    Test Connection
                  </button>
                </div>
              </div>
              {error && (
                <p className="text-red-400 text-xs mt-2">{error}</p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">API Base URL</label>
                <input
                  type="url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  placeholder="https://crow-eye-api-605899951231.us-central1.run.app"
                  required
                />
                <p className="text-gray-500 text-xs mt-1">
                  The base URL of your Crow's Eye Python API server
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  placeholder="Enter your API key (Enterprise feature)"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Leave empty to use JWT authentication instead
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white tech-body mb-4">Preferences</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="rounded bg-gray-800 border-gray-600 text-purple-500 focus:ring-purple-500" 
                />
                <span className="ml-2 text-gray-300">Enable notifications</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="rounded bg-gray-800 border-gray-600 text-purple-500 focus:ring-purple-500" 
                />
                <span className="ml-2 text-gray-300">Auto-save work</span>
              </label>
            </div>
          </div>
          
          <button type="submit" className="vision-button flex items-center">
            <CogIcon className="h-4 w-4 mr-2" />
            Save Settings
          </button>
        </form>

        {/* Quick Setup Guide */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-blue-300 font-semibold mb-2">Quick Setup</h4>
          <div className="text-blue-200 text-sm space-y-1">
            <p>1. Start your Python API server: <code className="bg-gray-800 px-1 rounded">uvicorn crow_eye_api.main:app --host 0.0.0.0 --port 8000 --reload</code></p>
            <p>2. Update the API Base URL above to match your server</p>
            <p>3. Test the connection and start using the features!</p>
          </div>
        </div>
      </div>
    </div>
  );
} 