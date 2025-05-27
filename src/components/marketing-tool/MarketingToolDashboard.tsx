'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  PhotoIcon, 
  VideoCameraIcon, 
  PaintBrushIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  FolderIcon,
  SparklesIcon,
  MegaphoneIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

// Import sub-components (we'll create these next)
import MediaLibrary from './MediaLibrary';
import PostCreator from './PostCreator';
import SchedulingPanel from './SchedulingPanel';
import AnalyticsDashboard from './AnalyticsDashboard';
import AITools from './AITools';
import Settings from './Settings';

type TabType = 'dashboard' | 'library' | 'create' | 'schedule' | 'analytics' | 'ai-tools' | 'settings';

export default function MarketingToolDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { id: 'library', name: 'Media Library', icon: FolderIcon },
    { id: 'create', name: 'Create Post', icon: PaintBrushIcon },
    { id: 'schedule', name: 'Schedule', icon: CalendarIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'ai-tools', name: 'AI Tools', icon: SparklesIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
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
      case 'settings':
        return <Settings />;
      default:
        return <DashboardOverview />;
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
              <span className="text-gray-300">Welcome, {user?.displayName || user?.email}</span>
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

// Dashboard Overview Component
function DashboardOverview() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-6">Dashboard Overview</h2>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Posts</p>
              <p className="text-3xl font-bold">24</p>
            </div>
            <PhotoIcon className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Scheduled</p>
              <p className="text-3xl font-bold">8</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">AI Generated</p>
              <p className="text-3xl font-bold">12</p>
            </div>
            <SparklesIcon className="h-8 w-8 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Engagement</p>
              <p className="text-3xl font-bold">94%</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-primary-600 hover:bg-primary-700 rounded-lg text-white transition-colors">
            <PaintBrushIcon className="h-6 w-6" />
            <span>Create New Post</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors">
            <VideoCameraIcon className="h-6 w-6" />
            <span>Generate Video</span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors">
            <SparklesIcon className="h-6 w-6" />
            <span>AI Gallery</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-600/50 rounded-lg">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-300">Post "Summer Collection" published to Instagram</span>
            <span className="text-gray-500 text-sm ml-auto">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-600/50 rounded-lg">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-300">AI generated 5 new captions</span>
            <span className="text-gray-500 text-sm ml-auto">4 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-600/50 rounded-lg">
            <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
            <span className="text-gray-300">Video "Product Demo" processed</span>
            <span className="text-gray-500 text-sm ml-auto">6 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
} 