'use client';

import React, { useState, useEffect } from 'react';
import { format, parseISO, addDays, addWeeks, addMonths } from 'date-fns';
import { X, Calendar, Clock, Repeat, Send, Save, Edit3, Copy, Trash2, Eye, Share2, BarChart3 } from 'lucide-react';

interface Post {
  id: string;
  mediaId: string;
  caption: string;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledTime?: string;
  publishedTime?: string;
  createdAt: string;
  updatedAt?: string;
  mediaType: 'image' | 'video' | 'audio';
  mediaUrl: string;
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  recurringEndDate?: string;
  customInstructions?: string;
  formatting?: {
    verticalOptimization?: boolean;
    captionOverlay?: boolean;
    overlayPosition?: 'top' | 'center' | 'bottom';
    overlayFontSize?: 'small' | 'medium' | 'large';
    aspectRatio?: string;
  };
  contextFiles?: string[];
  analytics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
  };
}

interface PostDetailDialogProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onDuplicate?: (post: Post) => void;
  onPublishNow?: (postId: string) => void;
}

export default function PostDetailDialog({ 
  post, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  onDuplicate,
  onPublishNow 
}: PostDetailDialogProps) {
  const [editedPost, setEditedPost] = useState<Post>(post);
  const [activeTab, setActiveTab] = useState<'details' | 'scheduling' | 'formatting' | 'analytics'>('details');
  const [isEditing, setIsEditing] = useState(false);

  const platforms = [
    { id: 'instagram', name: 'Instagram', color: 'bg-purple-500', icon: '📷' },
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600', icon: '📘' },
    { id: 'bluesky', name: 'BlueSky', color: 'bg-sky-400', icon: '🦋' },
    { id: 'snapchat', name: 'Snapchat', color: 'bg-yellow-400', icon: '👻' },
    { id: 'pinterest', name: 'Pinterest', color: 'bg-red-600', icon: '📌' },
    { id: 'tiktok', name: 'TikTok', color: 'bg-black', icon: '🎵' },
    { id: 'youtube', name: 'YouTube', color: 'bg-red-500', icon: '🎥' },
  ];

  useEffect(() => {
    setEditedPost(post);
  }, [post]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave?.(editedPost);
    setIsEditing(false);
  };

  const handleSchedulePost = () => {
    const updatedPost = {
      ...editedPost,
      status: 'scheduled' as const,
      scheduledTime: editedPost.scheduledTime || new Date(Date.now() + 3600000).toISOString() // Default to 1 hour from now
    };
    setEditedPost(updatedPost);
    onSave?.(updatedPost);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlatformInfo = (platformId: string) => {
    return platforms.find(p => p.id === platformId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">Post Details</h2>
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(editedPost.status)}`}>
              {editedPost.status.charAt(0).toUpperCase() + editedPost.status.slice(1)}
            </span>
            {editedPost.isRecurring && (
              <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded-full border border-purple-200 flex items-center gap-1">
                <Repeat className="w-3 h-3" />
                Recurring
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isEditing 
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              } flex items-center gap-2`}
            >
              <Edit3 className="w-4 h-4" />
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('scheduling')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'scheduling'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Scheduling
          </button>
          <button
            onClick={() => setActiveTab('formatting')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'formatting'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Formatting
          </button>
          {editedPost.status === 'published' && (
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Media Preview */}
              <div className="flex gap-6">
                <div className="w-48 h-48 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {editedPost.mediaType === 'image' ? (
                    <img
                      src={editedPost.mediaUrl}
                      alt="Post media"
                      className="w-full h-full object-cover"
                    />
                  ) : editedPost.mediaType === 'video' ? (
                    <video
                      src={editedPost.mediaUrl}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-4xl">🎵</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  {/* Caption */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
                    {isEditing ? (
                      <textarea
                        value={editedPost.caption}
                        onChange={(e) => setEditedPost({ ...editedPost, caption: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={4}
                        placeholder="Write your caption..."
                      />
                    ) : (
                      <p className="text-gray-900 p-3 bg-gray-50 rounded-lg border">
                        {editedPost.caption}
                      </p>
                    )}
                  </div>

                  {/* Platforms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
                    {isEditing ? (
                      <div className="flex flex-wrap gap-2">
                        {platforms.map(platform => (
                          <label
                            key={platform.id}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                              editedPost.platforms.includes(platform.id)
                                ? `${platform.color} text-white border-transparent`
                                : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={editedPost.platforms.includes(platform.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditedPost({
                                    ...editedPost,
                                    platforms: [...editedPost.platforms, platform.id]
                                  });
                                } else {
                                  setEditedPost({
                                    ...editedPost,
                                    platforms: editedPost.platforms.filter(p => p !== platform.id)
                                  });
                                }
                              }}
                              className="sr-only"
                            />
                            <span className="text-sm">{platform.icon}</span>
                            <span className="text-sm font-medium">{platform.name}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {editedPost.platforms.map(platformId => {
                          const platform = getPlatformInfo(platformId);
                          return platform ? (
                            <span
                              key={platformId}
                              className={`px-3 py-1 text-sm font-medium text-white rounded-lg ${platform.color} flex items-center gap-1`}
                            >
                              <span>{platform.icon}</span>
                              {platform.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  {/* Custom Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom Instructions</label>
                    {isEditing ? (
                      <textarea
                        value={editedPost.customInstructions || ''}
                        onChange={(e) => setEditedPost({ ...editedPost, customInstructions: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={2}
                        placeholder="Add custom instructions for AI processing..."
                      />
                    ) : (
                      <p className="text-gray-700 p-3 bg-gray-50 rounded-lg border">
                        {editedPost.customInstructions || 'No custom instructions'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <span className="text-sm text-gray-500 block">Created</span>
                  <span className="text-sm font-medium text-gray-900">
                    {format(parseISO(editedPost.createdAt), 'MMM d, yyyy - HH:mm')}
                  </span>
                </div>
                {editedPost.updatedAt && (
                  <div>
                    <span className="text-sm text-gray-500 block">Last Updated</span>
                    <span className="text-sm font-medium text-gray-900">
                      {format(parseISO(editedPost.updatedAt), 'MMM d, yyyy - HH:mm')}
                    </span>
                  </div>
                )}
                {editedPost.scheduledTime && (
                  <div>
                    <span className="text-sm text-gray-500 block">Scheduled For</span>
                    <span className="text-sm font-medium text-blue-600">
                      {format(parseISO(editedPost.scheduledTime), 'MMM d, yyyy - HH:mm')}
                    </span>
                  </div>
                )}
                {editedPost.publishedTime && (
                  <div>
                    <span className="text-sm text-gray-500 block">Published</span>
                    <span className="text-sm font-medium text-green-600">
                      {format(parseISO(editedPost.publishedTime), 'MMM d, yyyy - HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Scheduling Tab */}
          {activeTab === 'scheduling' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date & Time */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Schedule Date & Time</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={editedPost.scheduledTime ? format(parseISO(editedPost.scheduledTime), 'yyyy-MM-dd') : ''}
                      onChange={(e) => {
                        const currentTime = editedPost.scheduledTime ? format(parseISO(editedPost.scheduledTime), 'HH:mm') : '12:00';
                        setEditedPost({
                          ...editedPost,
                          scheduledTime: `${e.target.value}T${currentTime}:00Z`
                        });
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input
                      type="time"
                      value={editedPost.scheduledTime ? format(parseISO(editedPost.scheduledTime), 'HH:mm') : '12:00'}
                      onChange={(e) => {
                        const currentDate = editedPost.scheduledTime ? format(parseISO(editedPost.scheduledTime), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
                        setEditedPost({
                          ...editedPost,
                          scheduledTime: `${currentDate}T${e.target.value}:00Z`
                        });
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Quick Schedule Buttons */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Quick Schedule</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setEditedPost({
                          ...editedPost,
                          scheduledTime: addDays(new Date(), 1).toISOString()
                        })}
                        className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Tomorrow
                      </button>
                      <button
                        onClick={() => setEditedPost({
                          ...editedPost,
                          scheduledTime: addWeeks(new Date(), 1).toISOString()
                        })}
                        className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Next Week
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recurring Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recurring Settings</h3>
                  
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editedPost.isRecurring || false}
                        onChange={(e) => setEditedPost({
                          ...editedPost,
                          isRecurring: e.target.checked
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Repeat this post</span>
                    </label>
                  </div>

                  {editedPost.isRecurring && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Repeat Pattern</label>
                        <select
                          value={editedPost.recurringPattern || 'weekly'}
                          onChange={(e) => setEditedPost({
                            ...editedPost,
                            recurringPattern: e.target.value as 'daily' | 'weekly' | 'monthly'
                          })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                          type="date"
                          value={editedPost.recurringEndDate ? format(parseISO(editedPost.recurringEndDate), 'yyyy-MM-dd') : ''}
                          onChange={(e) => setEditedPost({
                            ...editedPost,
                            recurringEndDate: e.target.value ? `${e.target.value}T00:00:00Z` : undefined
                          })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Schedule Actions */}
              <div className="flex justify-center gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSchedulePost}
                  disabled={!editedPost.scheduledTime}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Post
                </button>
                {editedPost.status === 'scheduled' && onPublishNow && (
                  <button
                    onClick={() => onPublishNow(editedPost.id)}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Publish Now
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Formatting Tab */}
          {activeTab === 'formatting' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Media Formatting */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Media Formatting</h3>
                  
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editedPost.formatting?.verticalOptimization || false}
                        onChange={(e) => setEditedPost({
                          ...editedPost,
                          formatting: {
                            ...editedPost.formatting,
                            verticalOptimization: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Vertical Optimization</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
                    <select
                      value={editedPost.formatting?.aspectRatio || 'original'}
                      onChange={(e) => setEditedPost({
                        ...editedPost,
                        formatting: {
                          ...editedPost.formatting,
                          aspectRatio: e.target.value
                        }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="original">Original</option>
                      <option value="1:1">Square (1:1)</option>
                      <option value="4:5">Portrait (4:5)</option>
                      <option value="16:9">Landscape (16:9)</option>
                      <option value="9:16">Stories (9:16)</option>
                    </select>
                  </div>
                </div>

                {/* Caption Overlay */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Caption Overlay</h3>
                  
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editedPost.formatting?.captionOverlay || false}
                        onChange={(e) => setEditedPost({
                          ...editedPost,
                          formatting: {
                            ...editedPost.formatting,
                            captionOverlay: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Add text overlay</span>
                    </label>
                  </div>

                  {editedPost.formatting?.captionOverlay && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                        <select
                          value={editedPost.formatting?.overlayPosition || 'center'}
                          onChange={(e) => setEditedPost({
                            ...editedPost,
                            formatting: {
                              ...editedPost.formatting,
                              overlayPosition: e.target.value as 'top' | 'center' | 'bottom'
                            }
                          })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="top">Top</option>
                          <option value="center">Center</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                        <select
                          value={editedPost.formatting?.overlayFontSize || 'medium'}
                          onChange={(e) => setEditedPost({
                            ...editedPost,
                            formatting: {
                              ...editedPost.formatting,
                              overlayFontSize: e.target.value as 'small' | 'medium' | 'large'
                            }
                          })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && editedPost.status === 'published' && editedPost.analytics && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{editedPost.analytics.views.toLocaleString()}</div>
                  <div className="text-sm text-blue-800">Views</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{editedPost.analytics.likes.toLocaleString()}</div>
                  <div className="text-sm text-red-800">Likes</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{editedPost.analytics.comments.toLocaleString()}</div>
                  <div className="text-sm text-green-800">Comments</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{editedPost.analytics.shares.toLocaleString()}</div>
                  <div className="text-sm text-purple-800">Shares</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xl font-bold text-gray-900">{editedPost.analytics.engagementRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Engagement Rate</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            {onDuplicate && (
              <button
                onClick={() => onDuplicate(editedPost)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(editedPost.id)}
                className="px-4 py-2 text-red-600 hover:text-red-800 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            {isEditing && (
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 