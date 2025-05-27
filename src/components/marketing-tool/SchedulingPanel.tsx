'use client';

import React, { useState } from 'react';
import { CalendarIcon, ClockIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function SchedulingPanel() {
  const [scheduledPosts] = useState([
    {
      id: '1',
      title: 'Summer Collection Launch',
      platform: 'Instagram',
      scheduledTime: '2024-01-20T10:00',
      status: 'scheduled'
    },
    {
      id: '2',
      title: 'Behind the Scenes Video',
      platform: 'Facebook',
      scheduledTime: '2024-01-21T14:30',
      status: 'scheduled'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Scheduling</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
          <PlusIcon className="h-4 w-4" />
          <span>Schedule Post</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-700/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Calendar View</h3>
          <div className="bg-gray-600 rounded-lg p-4 h-64 flex items-center justify-center">
            <CalendarIcon className="h-16 w-16 text-gray-400" />
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Scheduled Posts</h3>
          <div className="space-y-3">
            {scheduledPosts.map(post => (
              <div key={post.id} className="bg-gray-600 rounded-lg p-4">
                <h4 className="text-white font-medium">{post.title}</h4>
                <p className="text-gray-400 text-sm">{post.platform}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">{new Date(post.scheduledTime).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 