'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  PhotoIcon, 
  PaintBrushIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  FolderIcon,
  SparklesIcon,
  MegaphoneIcon,
  UserGroupIcon,
  PlusIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

// Import sub-components
import MediaLibrary from './MediaLibrary';
import PostCreator from './PostCreator';
import SchedulingPanel from './SchedulingPanel';
import AnalyticsDashboard from './AnalyticsDashboard';
import AITools from './AITools';
import Settings from './Settings';

type TabType = 'dashboard' | 'library' | 'create' | 'schedule' | 'analytics' | 'ai-tools' | 'desktop' | 'settings';

interface UserStats {
  totalPosts: number;
  scheduledPosts: number;
  aiGenerated: number;
  engagementRate: number;
  socialAccounts: number;
  mediaFiles: number;
  recentActivity: Array<{
    id: string;
    action: string;
    timestamp: string;
    type: 'success' | 'info' | 'warning';
  }>;
  subscriptionTier: string;
  aiCreditsRemaining: number;
  aiEditsRemaining: number;
}

export default function MarketingToolDashboard() {
  const { user, loading } = useAuth();
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
      const response = await fetch('/api/marketing-tool/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Show loading state while authenticating
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-300 mt-4">Loading Marketing Tool...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { id: 'library', name: 'Media Library', icon: FolderIcon },
    { id: 'create', name: 'Create Post', icon: PaintBrushIcon },
    { id: 'schedule', name: 'Schedule', icon: CalendarIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'ai-tools', name: 'AI Tools', icon: SparklesIcon },
    { id: 'desktop', name: 'Desktop App', icon: ComputerDesktopIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview stats={stats} statsLoading={statsLoading} onRefresh={fetchStats} />;
      case 'library':
        return <MediaLibrary />;
      case 'create':
        return <PostCreator />;
      case 'schedule':
        return <SchedulingPanel />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'ai-tools':
        return <AITools />;
      case 'desktop':
        return <DesktopApp />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardOverview stats={stats} statsLoading={statsLoading} onRefresh={fetchStats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-md border-b border-primary-600/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <MegaphoneIcon className="h-8 w-8 text-primary-500" />
              <h1 className="text-2xl font-bold gradient-text">Marketing Tool</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-gray-300 text-sm">Welcome, {user?.displayName || user?.email}</span>
                {stats && (
                  <div className="text-xs text-gray-400">
                    {stats.subscriptionTier.charAt(0).toUpperCase() + stats.subscriptionTier.slice(1)} Plan
                  </div>
                )}
              </div>
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="h-8 w-8 rounded-full" />
                ) : (
                  <UserGroupIcon className="h-5 w-5 text-white" />
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
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
            
            {/* Quick Stats Sidebar */}
            {stats && (
              <div className="mt-8 bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700/50 p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">AI Credits</span>
                    <span className="text-white font-medium">{stats.aiCreditsRemaining}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">AI Edits</span>
                    <span className="text-white font-medium">{stats.aiEditsRemaining}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Social Accounts</span>
                    <span className="text-white font-medium">{stats.socialAccounts}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700/50 p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Desktop App Component
function DesktopApp() {
  const handleDownload = (platform: string) => {
    // Import and use the download utility
    import('@/utils/desktopDownloads').then(({ downloadDesktopApp }) => {
      downloadDesktopApp(platform);
    }).catch(() => {
      // Fallback if import fails
      alert(`Desktop app download for ${platform} will be available soon!`);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Desktop Application</h2>
      </div>
      
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <ComputerDesktopIcon className="h-12 w-12" />
          <div>
            <h3 className="text-2xl font-bold">Crow's Eye Desktop Suite</h3>
            <p className="text-primary-100">Full-featured desktop application with advanced AI tools</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-bold mb-2">🖥️ Windows</h4>
            <p className="text-sm text-primary-100 mb-3">Native Windows application with installer</p>
            <button 
              onClick={() => handleDownload('Windows')}
              className="w-full bg-white text-primary-600 font-bold py-2 px-4 rounded hover:bg-gray-100 transition-colors"
            >
              Download for Windows
            </button>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-bold mb-2">🍎 macOS</h4>
            <p className="text-sm text-primary-100 mb-3">Native Mac app with Apple integration</p>
            <button 
              onClick={() => handleDownload('macOS')}
              className="w-full bg-white text-primary-600 font-bold py-2 px-4 rounded hover:bg-gray-100 transition-colors"
            >
              Download for Mac
            </button>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-bold mb-2">🐧 Linux</h4>
            <p className="text-sm text-primary-100 mb-3">Universal AppImage for all distributions</p>
            <button 
              onClick={() => handleDownload('Linux')}
              className="w-full bg-white text-primary-600 font-bold py-2 px-4 rounded hover:bg-gray-100 transition-colors"
            >
              Download for Linux
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">✨ Features</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center space-x-2">
              <SparklesIcon className="h-5 w-5 text-primary-500" />
              <span>AI Content Generation (OpenAI GPT-4 & Google Gemini)</span>
            </li>
            <li className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-primary-500" />
              <span>Advanced Scheduling & Automation</span>
            </li>
            <li className="flex items-center space-x-2">
              <ChartBarIcon className="h-5 w-5 text-primary-500" />
              <span>Detailed Analytics & Reporting</span>
            </li>
            <li className="flex items-center space-x-2">
              <PhotoIcon className="h-5 w-5 text-primary-500" />
              <span>Media Library & Processing</span>
            </li>
          </ul>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">🌐 Platform Support</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Instagram</span>
              <span className="text-green-400">✓ Supported</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Facebook</span>
              <span className="text-green-400">✓ Supported</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">BlueSky</span>
              <span className="text-green-400">✓ Supported</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Google My Business</span>
              <span className="text-green-400">✓ Supported</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">TikTok</span>
              <span className="text-green-400">✓ Supported</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">YouTube</span>
              <span className="text-green-400">✓ Supported</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 line-through">Twitter/X</span>
              <span className="text-red-400">✗ Deprecated</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 line-through">LinkedIn</span>
              <span className="text-red-400">✗ Deprecated</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-yellow-500">⚠️</span>
          <h4 className="text-yellow-400 font-bold">Installation Requirements</h4>
        </div>
        <ul className="text-yellow-300 text-sm space-y-1">
          <li>• Python 3.11+ (for source installation)</li>
          <li>• 4GB RAM minimum, 8GB recommended</li>
          <li>• 1GB free disk space</li>
          <li>• Internet connection for AI features</li>
          <li>• API keys for enhanced functionality (OpenAI, Google Gemini)</li>
        </ul>
      </div>
    </div>
  );
}

// Dashboard Overview Component with Real Data
interface DashboardOverviewProps {
  stats: UserStats | null;
  statsLoading: boolean;
  onRefresh: () => void;
}

function DashboardOverview({ stats, statsLoading, onRefresh }: DashboardOverviewProps) {
  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">Failed to load dashboard data</p>
        <button 
          onClick={onRefresh}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>
        <button 
          onClick={onRefresh}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      {/* Real Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Posts</p>
              <p className="text-3xl font-bold">{stats.totalPosts}</p>
            </div>
            <DocumentTextIcon className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Scheduled</p>
              <p className="text-3xl font-bold">{stats.scheduledPosts}</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">AI Generated</p>
              <p className="text-3xl font-bold">{stats.aiGenerated}</p>
            </div>
            <SparklesIcon className="h-8 w-8 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Media Files</p>
              <p className="text-3xl font-bold">{stats.mediaFiles}</p>
            </div>
            <PhotoIcon className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-primary-600 hover:bg-primary-700 rounded-lg text-white transition-colors">
            <PlusIcon className="h-6 w-6" />
            <span>Create New Post</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors">
            <CloudArrowUpIcon className="h-6 w-6" />
            <span>Upload Media</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors">
            <SparklesIcon className="h-6 w-6" />
            <span>AI Tools</span>
          </button>
        </div>
      </div>

      {/* Recent Activity with Real Data */}
      <div className="bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-600/50 rounded-lg">
                <div className={`h-2 w-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' : 
                  activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <span className="text-gray-300 flex-1">{activity.action}</span>
                <span className="text-gray-500 text-sm">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No recent activity</p>
              <p className="text-sm mt-2">Start creating content to see your activity here!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 