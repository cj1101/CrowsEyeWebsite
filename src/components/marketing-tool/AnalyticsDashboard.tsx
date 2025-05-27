'use client';

import React from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, EyeIcon, HeartIcon } from '@heroicons/react/24/outline';

export default function AnalyticsDashboard() {
  const metrics = [
    { name: 'Total Reach', value: '12.5K', change: '+15%', icon: EyeIcon },
    { name: 'Engagement Rate', value: '4.2%', change: '+8%', icon: HeartIcon },
    { name: 'Posts Published', value: '24', change: '+12%', icon: ChartBarIcon },
    { name: 'Growth Rate', value: '2.1%', change: '+5%', icon: ArrowTrendingUpIcon },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Analytics Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.name} className="bg-gray-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{metric.name}</p>
                  <p className="text-2xl font-bold text-white">{metric.value}</p>
                  <p className="text-green-400 text-sm">{metric.change}</p>
                </div>
                <Icon className="h-8 w-8 text-primary-500" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-700/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Performance Chart</h3>
          <div className="bg-gray-600 rounded-lg p-4 h-64 flex items-center justify-center">
            <ChartBarIcon className="h-16 w-16 text-gray-400" />
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Top Performing Posts</h3>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-600 rounded-lg p-4">
                <h4 className="text-white font-medium">Post Title {i}</h4>
                <p className="text-gray-400 text-sm">1.2K likes • 89 comments</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 