'use client';

import React, { useState } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  PlusIcon, 
  PlayIcon,
  PauseIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Schedule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  platforms: string[];
  postsPerDay: number;
  postingTimes: string[];
  startDate: string;
  endDate: string;
  totalPosts: number;
  publishedPosts: number;
  nextPost: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
}

interface ScheduledPost {
  id: string;
  scheduleId: string;
  title: string;
  platforms: string[];
  scheduledTime: string;
  status: 'scheduled' | 'published' | 'failed';
  mediaType: 'image' | 'video' | 'audio';
}

const mockSchedules: Schedule[] = [
  {
    id: '1',
    name: 'Daily Content Campaign',
    description: 'Regular posting schedule for brand awareness',
    isActive: true,
    platforms: ['instagram', 'facebook', 'twitter'],
    postsPerDay: 3,
    postingTimes: ['09:00', '13:00', '18:00'],
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    totalPosts: 270,
    publishedPosts: 45,
    nextPost: '2024-01-20T09:00:00Z',
    status: 'active'
  },
  {
    id: '2',
    name: 'Product Launch Series',
    description: 'Countdown posts for new product launch',
    isActive: false,
    platforms: ['instagram', 'linkedin'],
    postsPerDay: 1,
    postingTimes: ['10:00'],
    startDate: '2024-02-01',
    endDate: '2024-02-14',
    totalPosts: 14,
    publishedPosts: 0,
    nextPost: '2024-02-01T10:00:00Z',
    status: 'draft'
  },
  {
    id: '3',
    name: 'Weekend Engagement',
    description: 'Special content for weekend audience',
    isActive: true,
    platforms: ['instagram', 'tiktok'],
    postsPerDay: 2,
    postingTimes: ['11:00', '16:00'],
    startDate: '2024-01-06',
    endDate: '2024-12-31',
    totalPosts: 104,
    publishedPosts: 12,
    nextPost: '2024-01-20T11:00:00Z',
    status: 'active'
  }
];

const mockScheduledPosts: ScheduledPost[] = [
  {
    id: '1',
    scheduleId: '1',
    title: 'Morning motivation post',
    platforms: ['instagram', 'facebook'],
    scheduledTime: '2024-01-20T09:00:00Z',
    status: 'scheduled',
    mediaType: 'image'
  },
  {
    id: '2',
    scheduleId: '1',
    title: 'Lunch break content',
    platforms: ['instagram', 'twitter'],
    scheduledTime: '2024-01-20T13:00:00Z',
    status: 'scheduled',
    mediaType: 'video'
  },
  {
    id: '3',
    scheduleId: '3',
    title: 'Weekend vibes',
    platforms: ['instagram', 'tiktok'],
    scheduledTime: '2024-01-20T11:00:00Z',
    status: 'scheduled',
    mediaType: 'video'
  },
  {
    id: '4',
    scheduleId: '1',
    title: 'Evening engagement',
    platforms: ['facebook', 'twitter'],
    scheduledTime: '2024-01-19T18:00:00Z',
    status: 'published',
    mediaType: 'image'
  }
];

export default function SchedulingTab() {
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(mockScheduledPosts);
  const [activeTab, setActiveTab] = useState<'schedules' | 'calendar' | 'queue'>('schedules');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const toggleSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === scheduleId 
        ? { ...schedule, isActive: !schedule.isActive, status: schedule.isActive ? 'paused' : 'active' }
        : schedule
    ));
  };

  const deleteSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
    setScheduledPosts(prev => prev.filter(post => post.scheduleId !== scheduleId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'completed': return 'text-blue-400';
      case 'draft': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PlayIcon className="h-4 w-4" />;
      case 'paused': return <PauseIcon className="h-4 w-4" />;
      case 'completed': return <CheckCircleIcon className="h-4 w-4" />;
      case 'draft': return <PencilIcon className="h-4 w-4" />;
      default: return <ExclamationTriangleIcon className="h-4 w-4" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      instagram: '📷',
      facebook: '📘',
      twitter: '🐦',
      linkedin: '💼',
      tiktok: '🎵',
      youtube: '📺',
      pinterest: '📌',
      'google-mybusiness': '🏢',
      snapchat: '👻'
    };
    return icons[platform] || '🌐';
  };

  const getPostsForDate = (date: string) => {
    return scheduledPosts.filter(post => 
      post.scheduledTime.startsWith(date)
    );
  };

  const generateCalendarDays = () => {
    const year = parseInt(selectedDate.split('-')[0]);
    const month = parseInt(selectedDate.split('-')[1]) - 1;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const postsForDay = getPostsForDate(dateStr);
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      
      days.push({
        date: dateStr,
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        posts: postsForDay
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Content Scheduling</h2>
          <p className="text-gray-400 mt-1">Automate your social media posting schedule</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 flex items-center gap-2 transition-all"
        >
          <PlusIcon className="h-4 w-4" />
          Create Schedule
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2">
        <nav className="flex space-x-2">
          {[
            { id: 'schedules', name: 'Schedules', icon: Cog6ToothIcon },
            { id: 'calendar', name: 'Calendar', icon: CalendarIcon },
            { id: 'queue', name: 'Queue', icon: ClockIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{schedule.name}</h3>
                    <div className={`flex items-center gap-1 ${getStatusColor(schedule.status)}`}>
                      {getStatusIcon(schedule.status)}
                      <span className="text-sm capitalize">{schedule.status}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 mb-4">{schedule.description}</p>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Platforms</p>
                      <div className="flex gap-1 mt-1">
                        {schedule.platforms.map((platform, index) => (
                          <span key={index} className="text-lg" title={platform}>
                            {getPlatformIcon(platform)}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Posts per day</p>
                      <p className="text-white font-medium">{schedule.postsPerDay}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Progress</p>
                      <p className="text-white font-medium">
                        {schedule.publishedPosts}/{schedule.totalPosts}
                      </p>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{ width: `${(schedule.publishedPosts / schedule.totalPosts) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400">Next post</p>
                      <p className="text-white font-medium">
                        {new Date(schedule.nextPost).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(schedule.nextPost).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {schedule.postingTimes.map((time, index) => (
                      <span key={index} className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-sm">
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleSchedule(schedule.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      schedule.isActive 
                        ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30' 
                        : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                    }`}
                    title={schedule.isActive ? 'Pause' : 'Resume'}
                  >
                    {schedule.isActive ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                  </button>
                  
                  <button
                    className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => deleteSchedule(schedule.id)}
                    className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                  
                  <button
                    className="p-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors"
                    title="Analytics"
                  >
                    <ChartBarIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {schedules.length === 0 && (
            <div className="text-center py-12">
              <CalendarIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No schedules created</h3>
              <p className="text-gray-400 mb-6">Create your first posting schedule to automate your content</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Create Schedule
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <input
              type="month"
              value={selectedDate.substring(0, 7)}
              onChange={(e) => setSelectedDate(e.target.value + '-01')}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-400">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((day, index) => (
              <div
                key={index}
                className={`min-h-[80px] p-2 border border-white/10 rounded ${
                  day.isCurrentMonth ? 'bg-white/5' : 'bg-gray-800/50'
                } ${day.isToday ? 'ring-2 ring-purple-500' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  day.isCurrentMonth ? 'text-white' : 'text-gray-500'
                }`}>
                  {day.day}
                </div>
                
                <div className="space-y-1">
                  {day.posts.slice(0, 2).map((post) => (
                    <div
                      key={post.id}
                      className={`text-xs p-1 rounded truncate ${
                        post.status === 'published' ? 'bg-green-600/30 text-green-200' :
                        post.status === 'failed' ? 'bg-red-600/30 text-red-200' :
                        'bg-blue-600/30 text-blue-200'
                      }`}
                      title={post.title}
                    >
                      {new Date(post.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  ))}
                  
                  {day.posts.length > 2 && (
                    <div className="text-xs text-gray-400">
                      +{day.posts.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Upcoming Posts</h3>
            
            <div className="space-y-3">
              {scheduledPosts
                .filter(post => post.status === 'scheduled')
                .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
                .map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">
                        {post.mediaType === 'image' ? '🖼️' : post.mediaType === 'video' ? '🎥' : '🎵'}
                      </div>
                      
                      <div>
                        <h4 className="text-white font-medium">{post.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-400">
                            {new Date(post.scheduledTime).toLocaleDateString()} at{' '}
                            {new Date(post.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div className="flex gap-1">
                            {post.platforms.map((platform, index) => (
                              <span key={index} className="text-sm" title={platform}>
                                {getPlatformIcon(platform)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-sm">
                        Scheduled
                      </span>
                      <button className="p-1 text-gray-400 hover:text-white transition-colors">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Posts</h3>
            
            <div className="space-y-3">
              {scheduledPosts
                .filter(post => post.status !== 'scheduled')
                .sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime())
                .slice(0, 5)
                .map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">
                        {post.mediaType === 'image' ? '🖼️' : post.mediaType === 'video' ? '🎥' : '🎵'}
                      </div>
                      
                      <div>
                        <h4 className="text-white font-medium">{post.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-400">
                            {new Date(post.scheduledTime).toLocaleDateString()} at{' '}
                            {new Date(post.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div className="flex gap-1">
                            {post.platforms.map((platform, index) => (
                              <span key={index} className="text-sm" title={platform}>
                                {getPlatformIcon(platform)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        post.status === 'published' ? 'bg-green-600/30 text-green-200' :
                        'bg-red-600/30 text-red-200'
                      }`}>
                        {post.status === 'published' ? 'Published' : 'Failed'}
                      </span>
                      <button className="p-1 text-gray-400 hover:text-white transition-colors">
                        <ChartBarIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-6">Create New Schedule</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Schedule Name</label>
                <input
                  type="text"
                  placeholder="e.g., Daily Content Campaign"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Description</label>
                <textarea
                  placeholder="Describe your posting schedule..."
                  className="w-full h-20 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                  <input
                    type="date"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">End Date</label>
                  <input
                    type="date"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Posts per Day</label>
                <select className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="1">1 post per day</option>
                  <option value="2">2 posts per day</option>
                  <option value="3">3 posts per day</option>
                  <option value="4">4 posts per day</option>
                  <option value="5">5 posts per day</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Posting Times</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="time"
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="time"
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="time"
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Create Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 