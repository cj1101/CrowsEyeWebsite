'use client';

import React, { useState } from 'react';
import AnalyticsTab from '@/components/dashboard/AnalyticsTab';
import LibraryTab from '@/components/dashboard/LibraryTab';
import StoriesTab from '@/components/dashboard/StoriesTab';
import GalleriesTab from '@/components/dashboard/GalleriesTab';
import HighlightsTab from '@/components/dashboard/HighlightsTab';
import { 
  ChartBarIcon, 
  PhotoIcon, 
  BookOpenIcon, 
  RectangleGroupIcon, 
  StarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('analytics');

  const tabs = [
    { 
      id: 'analytics', 
      name: 'Analytics', 
      component: AnalyticsTab,
      icon: ChartBarIcon,
      description: 'Performance insights and metrics'
    },
    { 
      id: 'library', 
      name: 'Media Library', 
      component: LibraryTab,
      icon: PhotoIcon,
      description: 'Manage your content assets'
    },
    { 
      id: 'stories', 
      name: 'Stories', 
      component: StoriesTab,
      icon: BookOpenIcon,
      description: 'Create engaging story content'
    },
    { 
      id: 'galleries', 
      name: 'Galleries', 
      component: GalleriesTab,
      icon: RectangleGroupIcon,
      description: 'Organize content collections'
    },
    { 
      id: 'highlights', 
      name: 'Highlights', 
      component: HighlightsTab,
      icon: StarIcon,
      description: 'Showcase your best content'
    },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AnalyticsTab;
  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Dashboard
                </span>
              </h1>
              <p className="text-gray-300 mt-1">
                Your AI-powered content command center
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2">
            <nav className="flex space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="hidden sm:block">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Active Tab Description */}
          {activeTabData && (
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                {activeTabData.description}
              </p>
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
} 