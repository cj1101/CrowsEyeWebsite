'use client';

import { useAnalytics } from '@/hooks/api/useAnalytics';
import { ChartBarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function AnalyticsTab() {
  const { analytics, loading, error, exportAnalytics, refreshAnalytics } = useAnalytics();

  const handleExport = async () => {
    try {
      const result = await exportAnalytics();
      if (result.success && result.data) {
        // Create download link
        const url = window.URL.createObjectURL(result.data);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert(result.error || 'Export failed');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Export failed');
    }
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Analytics Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">
            View detailed analytics and export data for reporting.
          </p>
          <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Pro+ Feature
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={refreshAnalytics}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">Error loading analytics: {error.message}</p>
        </div>
      )}

      {/* Analytics Data */}
      {analytics ? (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Media
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {analytics.totalMedia.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Galleries
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {analytics.totalGalleries.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Stories
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {analytics.totalStories.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Highlights
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {analytics.totalHighlights.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Storage Usage */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Storage Usage
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Current storage usage across all your media files.</p>
              </div>
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {(analytics.storageUsed / (1024 * 1024 * 1024)).toFixed(2)} GB used
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min((analytics.storageUsed / (10 * 1024 * 1024 * 1024)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Storage limit varies by plan
                </div>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="bg-gray-50 px-4 py-3 rounded-md">
            <p className="text-sm text-gray-600">
              Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Analytics data will appear here once you start using the platform.
          </p>
        </div>
      )}
    </div>
  );
} 