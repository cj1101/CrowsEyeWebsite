'use client';

import React from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, EyeIcon, HeartIcon } from '@heroicons/react/24/outline';

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Reach</p>
              <p className="text-3xl font-bold">12.5K</p>
            </div>
            <EyeIcon className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Engagement</p>
              <p className="text-3xl font-bold">8.2%</p>
            </div>
            <HeartIcon className="h-8 w-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Growth</p>
              <p className="text-3xl font-bold">+15%</p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Posts</p>
              <p className="text-3xl font-bold">24</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      <div className="bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Analytics Coming Soon</h3>
        <div className="text-center py-8 text-gray-400">
          <ChartBarIcon className="h-16 w-16 mx-auto mb-4" />
          <p>Detailed analytics dashboard is under development</p>
          <p className="text-sm mt-2">Track your performance across all platforms</p>
        </div>
      </div>
    </div>
  );
} 