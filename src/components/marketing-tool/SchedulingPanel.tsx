'use client';

import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  PauseIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface Post {
  id: string;
  content: string;
  platform: string;
  scheduledTime?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  createdAt: string;
}

export default function SchedulingPanel() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'drafts'>('all');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { postsStore } = await import('@/lib/marketing-tool-store');
      const allPosts = postsStore.getPosts();
      setPosts(allPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const { postsStore } = await import('@/lib/marketing-tool-store');
      const success = postsStore.deletePost(postId);
      
      if (success) {
        setPosts(prev => prev.filter(post => post.id !== postId));
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post');
    }
  };

  const updatePostStatus = async (postId: string, newStatus: 'scheduled' | 'draft' | 'published') => {
    try {
      // In a real app, you'd have an update endpoint
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, status: newStatus }
          : post
      ));
    } catch (error) {
      console.error('Error updating post status:', error);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'scheduled') return post.status === 'scheduled';
    if (filter === 'drafts') return post.status === 'draft';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-600 text-gray-100';
      case 'scheduled': return 'bg-yellow-600 text-yellow-100';
      case 'published': return 'bg-green-600 text-green-100';
      case 'failed': return 'bg-red-600 text-red-100';
      default: return 'bg-gray-600 text-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <PencilIcon className="h-3 w-3 mr-1" />;
      case 'scheduled': return <ClockIcon className="h-3 w-3 mr-1" />;
      case 'published': return <CheckCircleIcon className="h-3 w-3 mr-1" />;
      case 'failed': return <ExclamationTriangleIcon className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Schedule Manager</h2>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Schedule Manager</h2>
        <button 
          onClick={() => window.location.href = '#create'}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Create New Post
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-700">
        {[
          { id: 'all', name: 'All Posts', count: posts.length },
          { id: 'scheduled', name: 'Scheduled', count: posts.filter(p => p.status === 'scheduled').length },
          { id: 'drafts', name: 'Drafts', count: posts.filter(p => p.status === 'draft').length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as 'all' | 'scheduled' | 'drafts')}
            className={`px-4 py-3 rounded-t-lg transition-colors ${
              filter === tab.id
                ? 'bg-primary-600 text-white border-b-2 border-primary-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            {tab.name} ({tab.count})
          </button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Posts</p>
              <p className="text-2xl font-bold text-white">{posts.length}</p>
            </div>
            <PencilIcon className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Scheduled</p>
              <p className="text-2xl font-bold text-yellow-400">{posts.filter(p => p.status === 'scheduled').length}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Published</p>
              <p className="text-2xl font-bold text-green-400">{posts.filter(p => p.status === 'published').length}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Drafts</p>
              <p className="text-2xl font-bold text-gray-400">{posts.filter(p => p.status === 'draft').length}</p>
            </div>
            <PencilIcon className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-gray-700/50 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                  </span>
                  <span className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(post.status)}`}>
                    {getStatusIcon(post.status)}
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </span>
                </div>

                <p className="text-white mb-3 line-clamp-3">
                  {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                </p>

                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Created: {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  {post.scheduledTime && (
                    <span className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      Scheduled: {new Date(post.scheduledTime).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {post.status === 'draft' && (
                  <button
                    onClick={() => updatePostStatus(post.id, 'scheduled')}
                    className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-gray-600 rounded-lg transition-colors"
                    title="Schedule Post"
                  >
                    <ClockIcon className="h-5 w-5" />
                  </button>
                )}

                {post.status === 'scheduled' && (
                  <button
                    onClick={() => updatePostStatus(post.id, 'draft')}
                    className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-600 rounded-lg transition-colors"
                    title="Move to Draft"
                  >
                    <PauseIcon className="h-5 w-5" />
                  </button>
                )}

                <button
                  onClick={() => deletePost(post.id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded-lg transition-colors"
                  title="Delete Post"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">
            {filter === 'scheduled' ? 'No scheduled posts' : 
             filter === 'drafts' ? 'No drafts' : 'No posts yet'}
          </h3>
          <p className="text-gray-400 mb-6">
            {filter === 'scheduled' ? 'Schedule your first post to see it here' :
             filter === 'drafts' ? 'Create a draft to get started' :
             'Create your first post to get started'}
          </p>
          <button 
            onClick={() => window.location.href = '#create'}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Create New Post
          </button>
        </div>
      )}
    </div>
  );
} 