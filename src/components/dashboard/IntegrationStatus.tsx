'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { apiFetch } from '@/lib/api';

interface IntegrationStatusProps {
  className?: string;
}

interface HealthCheck {
  api: 'connected' | 'disconnected' | 'checking';
  auth: 'authenticated' | 'unauthenticated' | 'checking';
  features: {
    mediaLibrary: boolean;
    galleries: boolean;
    stories: boolean;
    highlights: boolean;
    analytics: boolean;
  };
}

export default function IntegrationStatus({ className = '' }: IntegrationStatusProps) {
  const [health, setHealth] = useState<HealthCheck>({
    api: 'checking',
    auth: 'checking',
    features: {
      mediaLibrary: false,
      galleries: false,
      stories: false,
      highlights: false,
      analytics: false,
    },
  });

  useEffect(() => {
    checkIntegrationHealth();
  }, []);

  const checkIntegrationHealth = async () => {
    try {
      // Check API connectivity
      const response = await apiFetch('/health');
      setHealth(prev => ({
        ...prev,
        api: response.success ? 'connected' : 'disconnected',
      }));

      // Check authentication
      try {
        const authResponse = await apiFetch('/auth/me');
        setHealth(prev => ({
          ...prev,
          auth: authResponse.success ? 'authenticated' : 'unauthenticated',
        }));
      } catch {
        setHealth(prev => ({ ...prev, auth: 'unauthenticated' }));
      }

      // Check feature availability
      const responseData = response.data as any;
      const features = {
        mediaLibrary: true, // Always available
        galleries: true, // Always available
        stories: true, // Always available
        highlights: responseData?.features?.includes('highlights') || false,
        analytics: responseData?.features?.includes('analytics') || false,
      };

      setHealth(prev => ({ ...prev, features }));
    } catch (error) {
      console.error('Health check failed:', error);
      setHealth(prev => ({
        ...prev,
        api: 'disconnected',
        auth: 'unauthenticated',
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'authenticated':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'disconnected':
      case 'unauthenticated':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'checking':
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500 animate-spin" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'authenticated':
        return 'Authenticated';
      case 'unauthenticated':
        return 'Not Authenticated';
      case 'checking':
      default:
        return 'Checking...';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">API Integration Status</h3>
        <button
          onClick={checkIntegrationHealth}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {/* API Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(health.api)}
            <span className="text-sm font-medium text-gray-900">API Connection</span>
          </div>
          <span className="text-sm text-gray-600">{getStatusText(health.api)}</span>
        </div>

        {/* Auth Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(health.auth)}
            <span className="text-sm font-medium text-gray-900">Authentication</span>
          </div>
          <span className="text-sm text-gray-600">{getStatusText(health.auth)}</span>
        </div>

        {/* Features Status */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Available Features</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(health.features).map(([feature, available]) => (
              <div key={feature} className="flex items-center space-x-2">
                {available ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircleIcon className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-600 capitalize">
                  {feature.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Info */}
        <div className="border-t border-gray-200 pt-4">
          <div className="text-xs text-gray-500 space-y-1">
            <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'Not configured'}</p>
            <p>Version: 1.0.0</p>
            <p>Last checked: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 