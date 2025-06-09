'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { apiService } from '@/services/api';

interface AnalyticsDashboardProps {
  timeRange?: TimeRange;
  filters?: AnalyticsFilters;
}

interface TimeRange {
  start: Date;
  end: Date;
  label: string;
}

interface AnalyticsFilters {
  platform?: string;
  contentType?: string;
  tags?: string[];
}

interface AnalyticsData {
  engagement: {
    total: number;
    change: number;
    trend: Array<{ date: string; value: number }>;
  };
  reach: {
    total: number;
    change: number;
    trend: Array<{ date: string; value: number }>;
  };
  interactions: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  topContent: Array<{
    id: string;
    title: string;
    platform: string;
    engagement: number;
    reach: number;
  }>;
  platformBreakdown: Array<{
    platform: string;
    value: number;
    color: string;
  }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const timeRanges: TimeRange[] = [
  { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date(), label: 'Last 7 days' },
  { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date(), label: 'Last 30 days' },
  { start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), end: new Date(), label: 'Last 3 months' },
  { start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), end: new Date(), label: 'Last year' }
];

export default function AnalyticsDashboard({ 
  timeRange = timeRanges[1], 
  filters = {} 
}: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [activeFilters, setActiveFilters] = useState(filters);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedTimeRange, activeFilters]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAnalytics({
        timeRange: selectedTimeRange.label,
        ...activeFilters
      });
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = async (format: 'pdf' | 'csv') => {
    try {
      const response = await apiService.exportAnalytics(format, {
        timeRange: selectedTimeRange.label,
        ...activeFilters
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${selectedTimeRange.label}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getChangeColor = (change: number): string => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="h-96 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="animate-pulse h-full bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Performance Analytics
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedTimeRange.label} • Last updated: {new Date().toLocaleString()}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={selectedTimeRange.label}
              onChange={(e) => {
                const range = timeRanges.find(r => r.label === e.target.value);
                if (range) setSelectedTimeRange(range);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {timeRanges.map(range => (
                <option key={range.label} value={range.label}>
                  {range.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FunnelIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => exportAnalytics('csv')}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Export CSV
              </button>
              <button
                onClick={() => exportAnalytics('pdf')}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reach</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatNumber(data.reach.total)}
              </p>
              <p className={`text-sm ${getChangeColor(data.reach.change)}`}>
                {data.reach.change >= 0 ? '+' : ''}{data.reach.change.toFixed(1)}% from last period
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <EyeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Engagement</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatNumber(data.engagement.total)}
              </p>
              <p className={`text-sm ${getChangeColor(data.engagement.change)}`}>
                {data.engagement.change >= 0 ? '+' : ''}{data.engagement.change.toFixed(1)}% from last period
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Likes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatNumber(data.interactions.likes)}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <HeartIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Comments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatNumber(data.interactions.comments)}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Engagement Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.engagement.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Platform Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Platform Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.platformBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.platformBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Content Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Top Performing Content
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 font-medium text-gray-600 dark:text-gray-400">Content</th>
                <th className="text-left py-2 font-medium text-gray-600 dark:text-gray-400">Platform</th>
                <th className="text-right py-2 font-medium text-gray-600 dark:text-gray-400">Engagement</th>
                <th className="text-right py-2 font-medium text-gray-600 dark:text-gray-400">Reach</th>
              </tr>
            </thead>
            <tbody>
              {data.topContent.map((content, index) => (
                <tr key={content.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 text-gray-900 dark:text-gray-100 font-medium">
                    {content.title}
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                      {content.platform}
                    </span>
                  </td>
                  <td className="py-3 text-right text-gray-900 dark:text-gray-100">
                    {formatNumber(content.engagement)}
                  </td>
                  <td className="py-3 text-right text-gray-900 dark:text-gray-100">
                    {formatNumber(content.reach)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
} 