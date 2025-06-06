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
      const token = await user?.getIdToken();
      const response = await fetch('/api/marketing-tool/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        console.error('Failed to fetch stats:', response.statusText);
        // Set default stats for demo purposes
        setStats({
          totalPosts: 0,
          scheduledPosts: 0,
          aiGenerated: 0,
          engagementRate: 0,
          socialAccounts: 0,
          mediaFiles: 0,
          recentActivity: [],
          subscriptionTier: 'free',
          aiCreditsRemaining: 50,
          aiEditsRemaining: 5
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats for demo purposes
      setStats({
        totalPosts: 0,
        scheduledPosts: 0,
        aiGenerated: 0,
        engagementRate: 0,
        socialAccounts: 0,
        mediaFiles: 0,
        recentActivity: [],
        subscriptionTier: 'free',
        aiCreditsRemaining: 50,
        aiEditsRemaining: 5
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Show loading state while authenticating
  if (loading || !user) {
    return (
      <div className="min-h-screen darker-gradient-bg logo-bg-overlay flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-300 mt-4 tech-body">Loading Marketing Tool...</p>
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
    <div className="min-h-screen darker-gradient-bg logo-bg-overlay">
      {/* Header */}
      <div className="vision-card border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                <MegaphoneIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text-animated tech-heading">Marketing Tool</h1>
                <p className="text-gray-400 text-sm tech-body">AI-Powered Content Creation Suite</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-gray-300 text-sm tech-body">Welcome, {user?.displayName || user?.email}</span>
                {stats && (
                  <div className="text-xs text-purple-300 tech-body">
                    {stats.subscriptionTier.charAt(0).toUpperCase() + stats.subscriptionTier.slice(1)} Plan
                  </div>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                {(user as any)?.photoURL ? (
                  <img src={(user as any).photoURL} alt="Profile" className="h-12 w-12 rounded-full object-cover" />
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
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 tech-subheading ${
                      activeTab === tab.id
                        ? 'vision-button text-white shadow-lg'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white vision-card'
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
              <div className="mt-8 vision-card rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 tech-heading">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm tech-body">AI Credits</span>
                    <span className="text-purple-300 font-bold tech-subheading">{stats.aiCreditsRemaining}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm tech-body">AI Edits</span>
                    <span className="text-purple-300 font-bold tech-subheading">{stats.aiEditsRemaining}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm tech-body">Social Accounts</span>
                    <span className="text-purple-300 font-bold tech-subheading">{stats.socialAccounts}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="text-xs text-gray-500 tech-body">Engagement Rate</div>
                    <div className="text-green-400 font-bold text-lg tech-subheading">{stats.engagementRate}%</div>
                  </div>
                </div>
              </div>
            )}
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

// Desktop App Download Component
function DesktopApp() {
  const handleDownload = (platform: string) => {
    // This would typically trigger a download
    // downloadDesktopApp(platform);
    
    alert(`Desktop app download for ${platform} will be available soon!`);
  };

  return (
    <div className="space-y-8">
      <div className="vision-card rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-white mb-4 tech-heading">🖥️ Desktop Application</h2>
        <p className="text-gray-300 mb-8 tech-body">
          Download our powerful desktop app for enhanced performance and offline capabilities. 
          Perfect for content creators who need maximum productivity.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="vision-card rounded-xl p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <ComputerDesktopIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tech-subheading">Windows</h3>
            <p className="text-gray-400 text-sm mb-4 tech-body">Windows 10/11 compatible</p>
            <button 
              onClick={() => handleDownload('windows')}
              className="vision-button text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 tech-subheading"
            >
              Download
            </button>
          </div>
          
          <div className="vision-card rounded-xl p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl flex items-center justify-center">
              <ComputerDesktopIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tech-subheading">macOS</h3>
            <p className="text-gray-400 text-sm mb-4 tech-body">macOS 12+ compatible</p>
            <button 
              onClick={() => handleDownload('macos')}
              className="vision-button text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 tech-subheading"
            >
              Download
            </button>
          </div>
          
          <div className="vision-card rounded-xl p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <ComputerDesktopIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tech-subheading">Linux</h3>
            <p className="text-gray-400 text-sm mb-4 tech-body">Ubuntu 20.04+ compatible</p>
            <button 
              onClick={() => handleDownload('linux')}
              className="vision-button text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 tech-subheading"
            >
              Download
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4 tech-heading">✨ Features</h3>
            <ul className="space-y-2 text-gray-300 tech-body">
              <li>• Offline content creation and editing</li>
              <li>• Bulk upload and processing</li>
              <li>• Advanced keyboard shortcuts</li>
              <li>• Local file management</li>
              <li>• System-level integrations</li>
              <li>• Enhanced performance</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-white mb-4 tech-heading">🌐 Platform Support</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300 tech-body">Instagram</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300 tech-body">Facebook</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300 tech-body">TikTok</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300 tech-body">YouTube</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300 tech-body">Pinterest</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300 tech-body">Snapchat</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300 tech-body">Discord</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-300 tech-body">Telegram</span>
              </div>
            </div>
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
      <div className="space-y-8">
        <div className="vision-card rounded-2xl p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="vision-card rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4 tech-heading">Welcome to Marketing Tool</h2>
        <p className="text-gray-300 mb-6 tech-body">Start creating amazing content with AI-powered tools.</p>
        <button 
          onClick={onRefresh}
          className="vision-button text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 tech-subheading"
        >
          Get Started
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="vision-card rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 tech-heading">Dashboard Overview</h2>
            <p className="text-gray-300 tech-body">Your content creation command center</p>
          </div>
          <button 
            onClick={onRefresh}
            className="vision-card text-white px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-300 tech-subheading"
          >
            Refresh
          </button>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 vision-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm tech-body">Total Posts</p>
                <p className="text-3xl font-bold text-white tech-heading">{stats.totalPosts}</p>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 vision-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm tech-body">Scheduled</p>
                <p className="text-3xl font-bold text-white tech-heading">{stats.scheduledPosts}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 vision-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm tech-body">AI Generated</p>
                <p className="text-3xl font-bold text-white tech-heading">{stats.aiGenerated}</p>
              </div>
              <SparklesIcon className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 vision-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm tech-body">Engagement</p>
                <p className="text-3xl font-bold text-white tech-heading">{stats.engagementRate}%</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="vision-card rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6 tech-heading">Recent Activity</h3>
        <div className="space-y-4">
          {stats.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 p-4 bg-black/20 rounded-xl">
              <div className={`w-3 h-3 rounded-full ${
                activity.type === 'success' ? 'bg-green-500' : 
                activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-white tech-body">{activity.action}</p>
                <p className="text-gray-400 text-sm tech-body">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="vision-card rounded-xl p-6 hover:bg-white/5 transition-all duration-300 cursor-pointer">
          <PaintBrushIcon className="h-12 w-12 text-purple-400 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2 tech-subheading">Create New Post</h3>
          <p className="text-gray-400 text-sm tech-body">Start creating your next viral content</p>
        </div>
        
        <div className="vision-card rounded-xl p-6 hover:bg-white/5 transition-all duration-300 cursor-pointer">
          <CalendarIcon className="h-12 w-12 text-blue-400 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2 tech-subheading">Schedule Content</h3>
          <p className="text-gray-400 text-sm tech-body">Plan your content calendar</p>
        </div>
        
        <div className="vision-card rounded-xl p-6 hover:bg-white/5 transition-all duration-300 cursor-pointer">
          <ChartBarIcon className="h-12 w-12 text-green-400 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2 tech-subheading">View Analytics</h3>
          <p className="text-gray-400 text-sm tech-body">Track your performance metrics</p>
        </div>
      </div>
    </div>
  );
} 