'use client';

import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ClockIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  platforms: string[];
  scheduledFor: string;
  status: 'scheduled' | 'published' | 'failed';
  createdAt: string;
}

export default function SchedulingPanel() {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  const fetchScheduledPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/marketing-tool/posts');
      if (response.ok) {
        const data = await response.json();
        setScheduledPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this scheduled post?')) return;
    
    try {
      const response = await fetch(`/api/marketing-tool/posts/${postId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setScheduledPosts(prev => prev.filter(post => post.id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'published':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPlatformIcon = (platform: string) => {
    // Return platform-specific styling
    const platformColors: { [key: string]: string } = {
      instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
      twitter: 'bg-blue-500',
      linkedin: 'bg-blue-700',
      facebook: 'bg-blue-600'
    };
    
    return platformColors[platform] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Scheduled Posts</h2>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {scheduledPosts.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No scheduled posts</h3>
          <p className="text-gray-400 mb-6">Create your first scheduled post to see it here</p>
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors">
            Create Scheduled Post
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {scheduledPosts.map((post) => (
            <div key={post.id} className="bg-gray-700/50 rounded-lg p-6 hover:bg-gray-700/70 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(post.status)}`}>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 mb-4 line-clamp-2">{post.content}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{formatDate(post.scheduledFor)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span>Platforms:</span>
                      <div className="flex space-x-1">
                        {post.platforms.map((platform) => (
                          <span
                            key={platform}
                            className={`px-2 py-1 rounded text-xs text-white ${getPlatformIcon(platform)}`}
                          >
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {post.status === 'scheduled' && (
                    <>
                      <button
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Edit post"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Publish now"
                      >
                        <PlayIcon className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => deletePost(post.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete post"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar View */}
      <div className="bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Calendar View</h3>
        <div className="text-center py-8 text-gray-400">
          <CalendarIcon className="h-12 w-12 mx-auto mb-4" />
          <p>Calendar view coming soon!</p>
          <p className="text-sm mt-2">Visualize your posting schedule across platforms</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-700/50 rounded-lg p-6 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-2">
            {scheduledPosts.filter(p => p.status === 'scheduled').length}
          </div>
          <div className="text-gray-300">Scheduled</div>
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-6 text-center">
          <div className="text-2xl font-bold text-green-400 mb-2">
            {scheduledPosts.filter(p => p.status === 'published').length}
          </div>
          <div className="text-gray-300">Published</div>
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-6 text-center">
          <div className="text-2xl font-bold text-red-400 mb-2">
            {scheduledPosts.filter(p => p.status === 'failed').length}
          </div>
          <div className="text-gray-300">Failed</div>
        </div>
      </div>
    </div>
  );
} 