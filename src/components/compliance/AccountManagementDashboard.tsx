'use client';

import React, { useEffect, useState } from 'react';
import { useCompliance } from '@/hooks/useCompliance';

interface AccountManagementDashboardProps {
  className?: string;
  showHeader?: boolean;
}

// Platform Connection Row Component
interface PlatformConnectionRowProps {
  platform: string;
  name: string;
  icon: string;
  color: string;
  status: 'connected' | 'disconnected' | 'error';
  userInfo?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

const PlatformConnectionRow: React.FC<PlatformConnectionRowProps> = ({
  platform,
  name,
  icon,
  color,
  status,
  userInfo,
  onConnect,
  onDisconnect
}) => {
  const isConnected = status === 'connected';
  
  return (
    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white text-lg`}>
          {icon}
        </div>
        <div>
          <div className="text-white font-medium">{name}</div>
          {userInfo && (
            <div className="text-xs text-gray-400">{userInfo}</div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-gray-500'
        }`}></div>
        <span className={`text-sm font-medium ${
          isConnected ? 'text-green-400' : status === 'error' ? 'text-red-400' : 'text-gray-400'
        }`}>
          {isConnected ? 'Connected' : status === 'error' ? 'Error' : 'Disconnected'}
        </span>
        {isConnected ? (
          <button
            onClick={onDisconnect}
            className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded hover:bg-red-500/30 transition-colors"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={onConnect}
            className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded hover:bg-blue-500/30 transition-colors"
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
};

const AccountManagementDashboard: React.FC<AccountManagementDashboardProps> = ({ 
  className = "", 
  showHeader = true 
}) => {
  const {
    loading,
    error,
    auditResult,
    platformsSummary,
    rateLimits,
    healthCheck,
    runComprehensiveAudit,
    loadPlatformsSummary,
    loadRateLimits,
    checkHealth,
    clearError
  } = useCompliance();

  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  // Google Photos functionality has been discontinued

  useEffect(() => {
    // Load initial data
    loadInitialData();
    // Google Photos functionality discontinued
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        runComprehensiveAudit(),
        loadPlatformsSummary(),
        loadRateLimits(),
        checkHealth()
      ]);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to load account management data:', err);
    }
  };

  const handleRefresh = () => {
    clearError();
    loadInitialData();
    // Google Photos functionality discontinued
  };

  // Google Photos functionality has been discontinued

  const handleDisconnectPlatform = async (platform: string) => {
    try {
      // This would need to be implemented for each platform
      console.log(`Disconnect ${platform} - not implemented`);
    } catch (error) {
      console.error(`Failed to disconnect ${platform}:`, error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'healthy':
      case 'connected':
      case 'ok':
        return 'text-green-500 bg-green-500/10';
      case 'partial':
      case 'degraded':
      case 'warning':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'non_compliant':
      case 'unhealthy':
      case 'disconnected':
      case 'error':
      case 'limited':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getAccountScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className={`bg-gray-900/50 rounded-lg border border-gray-700 ${className}`}>
      {showHeader && (
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 text-blue-400">👤</div>
              <h2 className="text-xl font-semibold text-white">Account Management Dashboard</h2>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                <span className={loading ? 'animate-spin' : ''}>🔄</span>
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-red-400">⚠️</span>
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}

        {loading && !auditResult && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <span className="ml-3 text-gray-400">Loading account data...</span>
          </div>
        )}

        {/* Overall Account Health */}
        {auditResult && (
          <div className="mb-6">
            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Overall Account Health</h3>
                  <div className="flex items-center space-x-4">
                    <div className={`text-3xl font-bold ${getAccountScoreColor(auditResult.score)}`}>
                      {auditResult.score}%
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(auditResult.overall_status || 'unknown')}`}>
                      {(auditResult.overall_status || 'unknown').replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">{auditResult.passed_checks}</div>
                  <div className="text-sm text-gray-400">Healthy</div>
                  <div className="text-2xl font-bold text-red-400 mt-2">{auditResult.failed_checks}</div>
                  <div className="text-sm text-gray-400">Issues</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Connections */}
          <div className="bg-gray-800/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">🔗</span>
                <h3 className="text-lg font-semibold text-white">Platform Connections</h3>
              </div>
              <button
                onClick={handleRefresh}
                className="p-1 text-gray-400 hover:text-white transition-colors rounded"
                title="Refresh connections"
              >
                🔄
              </button>
            </div>
            <div className="space-y-3">
              <PlatformConnectionRow
                platform="tiktok"
                name="TikTok"
                icon="🎵"
                color="bg-black"
                status="connected"
                onConnect={() => window.open('/api/auth/tiktok/start', '_blank')}
                onDisconnect={() => handleDisconnectPlatform('tiktok')}
              />
              <PlatformConnectionRow
                platform="instagram"
                name="Instagram"
                icon="📸"
                color="bg-gradient-to-r from-purple-600 to-pink-600"
                status="connected"
                onConnect={() => window.open('/api/auth/instagram/start', '_blank')}
                onDisconnect={() => handleDisconnectPlatform('instagram')}
              />
              {/* Google Photos functionality has been discontinued */}
              <PlatformConnectionRow
                platform="facebook"
                name="Facebook"
                icon="📘"
                color="bg-blue-700"
                status="disconnected"
                onConnect={() => window.open('/api/auth/facebook/start', '_blank')}
                onDisconnect={() => handleDisconnectPlatform('facebook')}
              />
            </div>
          </div>
          
          {/* Platform Status */}
          {platformsSummary && (
            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-blue-400">🌐</span>
                <h3 className="text-lg font-semibold text-white">Account Status</h3>
              </div>
              <div className="space-y-3">
                {(platformsSummary.platforms || []).map((platform) => (
                  <div key={platform.platform} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(platform.status).split(' ')[1]}`}></div>
                      <span className="text-white font-medium capitalize">{platform.platform}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`text-sm font-medium ${getAccountScoreColor(platform.compliance_score)}`}>
                        {platform.compliance_score}%
                      </div>
                      {platform.issues_count > 0 && (
                        <div className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                          {platform.issues_count} issues
                        </div>
                      )}
                      {platform.warnings_count > 0 && (
                        <div className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                          {platform.warnings_count} warnings
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rate Limits */}
          {rateLimits && rateLimits.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-orange-400">⏰</span>
                <h3 className="text-lg font-semibold text-white">Usage Limits</h3>
              </div>
              <div className="space-y-3">
                {(rateLimits || []).slice(0, 3).map((limit) => (
                  <div key={limit.platform} className="p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium capitalize">{limit.platform}</span>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(limit.status)}`}>
                        {limit.status.toUpperCase()}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Posts today:</span>
                        <span className="text-white ml-2">
                          {limit.current_usage.posts_today}/{limit.limits.posts_per_day}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Remaining:</span>
                        <span className={`ml-2 font-medium ${
                          (limit.limits.posts_per_day - limit.current_usage.posts_today) > 10 ? 'text-green-400' : 
                          (limit.limits.posts_per_day - limit.current_usage.posts_today) > 5 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {limit.limits.posts_per_day - limit.current_usage.posts_today}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account Health */}
          {healthCheck && (
            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-green-400">❤️</span>
                <h3 className="text-lg font-semibold text-white">System Health</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Overall Status</span>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(healthCheck.status)}`}>
                    {healthCheck.status.toUpperCase()}
                  </div>
                </div>
                {healthCheck.services && healthCheck.services.slice(0, 3).map((service) => (
                  <div key={service.name} className="flex items-center justify-between py-1">
                    <span className="text-gray-300 capitalize">{service.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">{service.response_time}ms</span>
                      <div className={`w-2 h-2 rounded-full ${
                        service.status === 'up' ? 'bg-green-500' : 
                        service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountManagementDashboard; 