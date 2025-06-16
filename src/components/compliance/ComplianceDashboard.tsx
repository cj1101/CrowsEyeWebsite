'use client';

import React, { useEffect, useState } from 'react';
import { useCompliance } from '@/hooks/useCompliance';

interface ComplianceDashboardProps {
  className?: string;
  showHeader?: boolean;
}

const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ 
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

  useEffect(() => {
    // Load initial data
    loadInitialData();
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
      console.error('Failed to load compliance data:', err);
    }
  };

  const handleRefresh = () => {
    clearError();
    loadInitialData();
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

  const getComplianceScoreColor = (score: number) => {
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
              <div className="h-6 w-6 text-blue-400">🛡️</div>
              <h2 className="text-xl font-semibold text-white">Compliance Dashboard</h2>
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
            <span className="ml-3 text-gray-400">Loading compliance data...</span>
          </div>
        )}

        {/* Overall Compliance Score */}
        {auditResult && (
          <div className="mb-6">
            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Overall Compliance</h3>
                  <div className="flex items-center space-x-4">
                    <div className={`text-3xl font-bold ${getComplianceScoreColor(auditResult.score)}`}>
                      {auditResult.score}%
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(auditResult.overall_status || 'unknown')}`}>
                      {(auditResult.overall_status || 'unknown').replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">{auditResult.passed_checks}</div>
                  <div className="text-sm text-gray-400">Passed</div>
                  <div className="text-2xl font-bold text-red-400 mt-2">{auditResult.failed_checks}</div>
                  <div className="text-sm text-gray-400">Failed</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Status */}
          {platformsSummary && (
            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-blue-400">🌐</span>
                <h3 className="text-lg font-semibold text-white">Platform Status</h3>
              </div>
              <div className="space-y-3">
                {(platformsSummary.platforms || []).map((platform) => (
                  <div key={platform.platform} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(platform.status).split(' ')[1]}`}></div>
                      <span className="text-white font-medium capitalize">{platform.platform}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`text-sm font-medium ${getComplianceScoreColor(platform.compliance_score)}`}>
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
                <h3 className="text-lg font-semibold text-white">Rate Limits</h3>
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
                        <span className="text-gray-400">API calls/min:</span>
                        <span className="text-white ml-2">
                          {limit.current_usage.api_calls_this_minute}/{limit.limits.api_calls_per_minute}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System Health */}
          {healthCheck && (
            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-green-400">📊</span>
                <h3 className="text-lg font-semibold text-white">System Health</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Overall Status</span>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(healthCheck.status)}`}>
                    {healthCheck.status.toUpperCase()}
                  </div>
                </div>
                {(healthCheck.services || []).slice(0, 3).map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                    <span className="text-white text-sm">{service.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">{service.response_time}ms</span>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status).split(' ')[1]}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Violations */}
          {auditResult && auditResult.violations.length > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-red-400">⚠️</span>
                <h3 className="text-lg font-semibold text-white">Recent Issues</h3>
              </div>
              <div className="space-y-3">
                {auditResult.violations.slice(0, 3).map((violation, index) => (
                  <div key={index} className="p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        violation.severity === 'critical' ? 'bg-red-500' :
                        violation.severity === 'high' ? 'bg-orange-500' :
                        violation.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{violation.message}</div>
                        {violation.suggestion && (
                          <div className="text-gray-400 text-xs mt-1">{violation.suggestion}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center space-x-2 p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors">
            <span className="text-blue-400">📋</span>
            <span className="text-blue-300 text-sm">View Policies</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-3 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors">
            <span className="text-green-400">🔐</span>
            <span className="text-green-300 text-sm">Auth Setup</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-3 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors">
            <span className="text-purple-400">📈</span>
            <span className="text-purple-300 text-sm">Analytics</span>
          </button>
          <button 
            onClick={handleRefresh}
            className="flex items-center justify-center space-x-2 p-3 bg-orange-600/20 hover:bg-orange-600/30 rounded-lg transition-colors"
          >
            <span className="text-orange-400">🔄</span>
            <span className="text-orange-300 text-sm">Run Audit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard; 