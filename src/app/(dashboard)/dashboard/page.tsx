'use client';

import React, { useState } from 'react';
import AnalyticsTab from '@/components/dashboard/AnalyticsTab';
import LibraryTab from '@/components/dashboard/LibraryTab';
import StoriesTab from '@/components/dashboard/StoriesTab';
import GalleriesTab from '@/components/dashboard/GalleriesTab';
import HighlightsTab from '@/components/dashboard/HighlightsTab';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('analytics');

  const tabs = [
    { id: 'analytics', name: 'Analytics', component: AnalyticsTab },
    { id: 'library', name: 'Media Library', component: LibraryTab },
    { id: 'stories', name: 'Stories', component: StoriesTab },
    { id: 'galleries', name: 'Galleries', component: GalleriesTab },
    { id: 'highlights', name: 'Highlights', component: HighlightsTab },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AnalyticsTab;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Tab Navigation */}
        <div className="border-b border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
} 