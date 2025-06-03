'use client';

import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  PlayIcon, 
  PauseIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ScheduledPost {
  id: string;
  content: string;
  platform: string;
  scheduledTime: string;
  status: 'scheduled' | 'published' | 'failed';
}

export default function SchedulingPanel() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    const mockPosts: ScheduledPost[] = [
      {
        id: '1',
        content: 'Check out our latest product update!',
        platform: 'Instagram',
        scheduledTime: '2024-01-20T10:00:00Z',
        status: 'scheduled'
      },
      {
        id: '2',
        content: 'Behind the scenes at our office',
        platform: 'Facebook',
        scheduledTime: '2024-01-19T14:30:00Z',
        status: 'published'
      }
    ];

    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 500);
  }, []);

  const handleTogglePost = async (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, status: post.status === 'scheduled' ? 'failed' : 'scheduled' }
        : post
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Scheduled Posts</h2>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          Schedule New Post
        </button>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-white mb-2">{post.content}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {new Date(post.scheduledTime).toLocaleString()}
                  </span>
                  <span className="bg-primary-600 text-white px-2 py-1 rounded text-xs">
                    {post.platform}
                  </span>
                  <span className={`flex items-center px-2 py-1 rounded text-xs ${
                    post.status === 'scheduled' ? 'bg-yellow-600 text-yellow-100' :
                    post.status === 'published' ? 'bg-green-600 text-green-100' :
                    'bg-red-600 text-red-100'
                  }`}>
                    {post.status === 'scheduled' && <ClockIcon className="h-3 w-3 mr-1" />}
                    {post.status === 'published' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                    {post.status === 'failed' && <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
                    {post.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleTogglePost(post.id)}
                className="ml-4 p-2 text-gray-400 hover:text-white"
              >
                {post.status === 'scheduled' ? (
                  <PauseIcon className="h-5 w-5" />
                ) : (
                  <PlayIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-8">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No scheduled posts</h3>
          <p className="text-gray-400">Schedule your first post to get started</p>
        </div>
      )}
    </div>
  );
} 