'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, startOfMonth, endOfMonth, eachWeekOfInterval } from 'date-fns';
import { CalendarDays, Clock, Plus, Edit3, Trash2, PlayCircle, PauseCircle, Calendar, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface ScheduledPost {
  id: string;
  mediaId: string;
  caption: string;
  platforms: string[];
  scheduledTime: string;
  status: 'scheduled' | 'published' | 'failed' | 'draft';
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
}

interface Schedule {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  postsPerDay: number;
  isActive: boolean;
  platforms: string[];
  postingTimes: string[];
  createdAt: string;
}

interface SchedulingHubProps {
  onCreatePost?: () => void;
}

export default function SchedulingHub({ onCreatePost }: SchedulingHubProps) {
  const [view, setView] = useState<'calendar' | 'list' | 'schedules'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [showPostDialog, setShowPostDialog] = useState(false);

  // Mock data - replace with actual API calls
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([
    {
      id: '1',
      mediaId: '1',
      caption: 'Check out our latest product launch! 🚀 #innovation #product #launch',
      platforms: ['instagram', 'facebook', 'bluesky'],
      scheduledTime: '2024-01-20T14:00:00Z',
      status: 'scheduled',
      createdAt: '2024-01-15T10:30:00Z',
      mediaType: 'image',
      mediaUrl: '/images/placeholder-image.jpg'
    },
    {
      id: '2',
      mediaId: '2',
      caption: 'Behind the scenes content coming your way! 📸 #behindthescenes #content',
      platforms: ['snapchat', 'tiktok'],
      scheduledTime: '2024-01-21T16:30:00Z',
      status: 'scheduled',
      isRecurring: true,
      recurringPattern: 'weekly',
      createdAt: '2024-01-15T11:00:00Z',
      mediaType: 'video',
      mediaUrl: '/images/video-thumb.jpg'
    }
  ]);

  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: '1',
      name: 'Weekly Product Updates',
      description: 'Regular updates about our products and services',
      startDate: '2024-01-15',
      endDate: '2024-03-15',
      postsPerDay: 2,
      isActive: true,
      platforms: ['instagram', 'facebook', 'bluesky'],
      postingTimes: ['09:00', '17:00'],
      createdAt: '2024-01-15T08:00:00Z'
    },
    {
      id: '2',
      name: 'Content Marketing Campaign',
      description: 'Educational and engaging content for our audience',
      startDate: '2024-01-10',
      endDate: '2024-02-10',
      postsPerDay: 1,
      isActive: false,
      platforms: ['pinterest', 'tiktok'],
      postingTimes: ['12:00'],
      createdAt: '2024-01-10T09:00:00Z'
    }
  ]);

  const platforms = [
    { id: 'instagram', name: 'Instagram', color: 'bg-purple-500' },
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600' },
    { id: 'bluesky', name: 'BlueSky', color: 'bg-sky-400' },
    { id: 'snapchat', name: 'Snapchat', color: 'bg-yellow-400' },
    { id: 'pinterest', name: 'Pinterest', color: 'bg-red-600' },
    { id: 'tiktok', name: 'TikTok', color: 'bg-black' },
    { id: 'youtube', name: 'YouTube', color: 'bg-red-500' },
  ];

  // Calendar utilities
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => 
      isSameDay(new Date(post.scheduledTime), date)
    );
  };

  const filteredPosts = scheduledPosts.filter(post => {
    const matchesSearch = post.caption.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || post.platforms.includes(filterPlatform);
    return matchesSearch && matchesPlatform;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlatformColor = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform?.color || 'bg-gray-500';
  };

  const handlePostClick = (post: ScheduledPost) => {
    setSelectedPost(post);
    setShowPostDialog(true);
  };

  const handleDeletePost = (postId: string) => {
    setScheduledPosts(prev => prev.filter(p => p.id !== postId));
  };

  const handleToggleSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.map(s => 
      s.id === scheduleId ? { ...s, isActive: !s.isActive } : s
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scheduling Hub</h2>
          <p className="text-gray-600 mt-1">Manage your scheduled posts and automation schedules</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowScheduleDialog(true)}
            className="vision-button bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Schedule
          </button>
          <button
            onClick={onCreatePost}
            className="vision-button bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Schedule Post
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === 'calendar' 
                ? 'bg-white text-gray-900 shadow' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CalendarDays className="w-4 h-4 inline mr-2" />
            Calendar
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === 'list' 
                ? 'bg-white text-gray-900 shadow' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Timeline
          </button>
          <button
            onClick={() => setView('schedules')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === 'schedules' 
                ? 'bg-white text-gray-900 shadow' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Schedules
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Platforms</option>
            {platforms.map(platform => (
              <option key={platform.id} value={platform.id}>{platform.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="vision-card">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6 p-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-semibold">
                {format(currentDate, 'MMMM yyyy')}
              </h3>
              <button
                onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Today
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {/* Day Headers */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {weeks.flatMap(week => 
              eachDayOfInterval({ start: week, end: endOfWeek(week, { weekStartsOn: 1 }) })
            ).map(day => {
              const postsForDay = getPostsForDate(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();

              return (
                <div
                  key={day.toISOString()}
                  className={`bg-white p-2 min-h-[120px] ${
                    !isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {postsForDay.slice(0, 3).map(post => (
                      <div
                        key={post.id}
                        onClick={() => handlePostClick(post)}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded cursor-pointer hover:bg-blue-200 transition-colors truncate"
                      >
                        {format(new Date(post.scheduledTime), 'HH:mm')} - {post.caption.substring(0, 20)}...
                      </div>
                    ))}
                    {postsForDay.length > 3 && (
                      <div className="text-xs text-gray-500 px-2">
                        +{postsForDay.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="vision-card">
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled posts</h3>
                <p className="text-gray-600 mb-4">Start by creating your first scheduled post</p>
                <button
                  onClick={onCreatePost}
                  className="vision-button bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Schedule First Post
                </button>
              </div>
            ) : (
              filteredPosts.map(post => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(post.status)}`}>
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </span>
                        {post.isRecurring && (
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                            Recurring
                          </span>
                        )}
                        <span className="text-sm text-gray-600">
                          {format(new Date(post.scheduledTime), 'MMM d, yyyy - HH:mm')}
                        </span>
                      </div>
                      
                      <p className="text-gray-900 mb-3">{post.caption}</p>
                      
                      <div className="flex items-center gap-2">
                        {post.platforms.map(platformId => {
                          const platform = platforms.find(p => p.id === platformId);
                          return (
                            <span
                              key={platformId}
                              className={`px-2 py-1 text-xs font-medium text-white rounded ${getPlatformColor(platformId)}`}
                            >
                              {platform?.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handlePostClick(post)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit post"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Schedules View */}
      {view === 'schedules' && (
        <div className="vision-card">
          <div className="space-y-4">
            {schedules.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No automation schedules</h3>
                <p className="text-gray-600 mb-4">Create automated posting schedules to save time</p>
                <button
                  onClick={() => setShowScheduleDialog(true)}
                  className="vision-button bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Create First Schedule
                </button>
              </div>
            ) : (
              schedules.map(schedule => (
                <div key={schedule.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{schedule.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          schedule.isActive 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {schedule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{schedule.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 block">Duration</span>
                          <span className="font-medium">
                            {format(new Date(schedule.startDate), 'MMM d')} - {format(new Date(schedule.endDate), 'MMM d')}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Posts per day</span>
                          <span className="font-medium">{schedule.postsPerDay}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Posting times</span>
                          <span className="font-medium">{schedule.postingTimes.join(', ')}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Platforms</span>
                          <div className="flex gap-1 mt-1">
                            {schedule.platforms.slice(0, 3).map(platformId => {
                              const platform = platforms.find(p => p.id === platformId);
                              return (
                                <span
                                  key={platformId}
                                  className={`w-5 h-5 rounded text-xs flex items-center justify-center text-white ${getPlatformColor(platformId)}`}
                                  title={platform?.name}
                                >
                                  {platform?.name.charAt(0)}
                                </span>
                              );
                            })}
                            {schedule.platforms.length > 3 && (
                              <span className="w-5 h-5 rounded text-xs flex items-center justify-center bg-gray-400 text-white">
                                +{schedule.platforms.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleSchedule(schedule.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          schedule.isActive 
                            ? 'text-orange-600 hover:bg-orange-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={schedule.isActive ? 'Pause schedule' : 'Activate schedule'}
                      >
                        {schedule.isActive ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit schedule"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete schedule"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
} 