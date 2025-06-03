'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ExclamationTriangleIcon, LockClosedIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

// Mock types for demo
type TrackableFeature = 'post_creation' | 'media_upload' | 'ai_generation' | 'analytics' | 'scheduling';

interface FeatureGateProps {
  feature: TrackableFeature;
  requiredTier?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  className?: string;
}

// Mock function to check feature access based on tier
const hasFeatureAccess = (userTier: string, requiredTier: string): boolean => {
  const tierOrder = { 'free': 0, 'creator': 1, 'pro': 2 };
  return tierOrder[userTier as keyof typeof tierOrder] >= tierOrder[requiredTier as keyof typeof tierOrder];
};

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  requiredTier = 'creator',
  children,
  fallback,
  showUpgradePrompt = true,
  className = '',
}) => {
  const { user, userProfile } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usageInfo] = useState({
    used: 45,
    limit: 100,
    canUse: true,
    resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  });

  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !userProfile) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Check tier access
      const userTier = userProfile.plan || 'free';
      const tierAccess = hasFeatureAccess(userTier, requiredTier);
      
      // In demo mode, always grant access if user has the right tier
      const canAccess = tierAccess && usageInfo.canUse;
      setHasAccess(canAccess);
      setLoading(false);
    };

    checkAccess();
  }, [user, userProfile, feature, requiredTier, usageInfo.canUse]);

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}>
        <div className="h-20 w-full"></div>
      </div>
    );
  }

  if (!hasAccess) {
    // Custom fallback provided
    if (fallback) {
      return <>{fallback}</>;
    }

    // Default blocked UI
    const currentTier = userProfile?.plan || 'free';
    const tierAccess = hasFeatureAccess(currentTier, requiredTier);

    return (
      <div className={`relative ${className}`}>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 text-center shadow-xl">
            {!tierAccess ? (
              <>
                <LockClosedIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Upgrade Required
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  This feature requires a {requiredTier} plan or higher.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Current plan: <span className="font-medium capitalize">{currentTier}</span>
                </p>
                {showUpgradePrompt && (
                  <Link
                    href="/pricing"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Upgrade Now
                  </Link>
                )}
              </>
            ) : (
              <>
                <ChartBarIcon className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Usage Limit Reached
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You've reached your {feature.replace('_', ' ')} limit for this billing period.
                </p>
                {usageInfo && (
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Used:</span>
                      <span className="font-medium">
                        {usageInfo.used} / {typeof usageInfo.limit === 'number' ? usageInfo.limit : '∞'}
                      </span>
                    </div>
                    {usageInfo.resetDate && (
                      <div className="flex justify-between text-sm mt-1">
                        <span>Resets:</span>
                        <span className="font-medium">
                          {usageInfo.resetDate.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {showUpgradePrompt && (
                  <Link
                    href="/pricing"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Upgrade for More
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Grayed out content */}
        <div className="opacity-30 pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Usage indicator component
interface UsageIndicatorProps {
  feature: TrackableFeature;
  className?: string;
  showLabel?: boolean;
}

export const UsageIndicator: React.FC<UsageIndicatorProps> = ({
  feature,
  className = '',
  showLabel = true,
}) => {
  // Mock usage data for demo
  const usage = {
    used: 45,
    limit: 100,
    percentage: 45
  };

  const getColorClass = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const percentage = Math.min(usage.percentage, 100);

  return (
    <div className={`${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span className="capitalize">{feature.replace('_', ' ')}</span>
          <span>
            {usage.used} / {typeof usage.limit === 'number' ? usage.limit : '∞'}
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getColorClass(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {percentage >= 90 && (
        <div className="flex items-center mt-1 text-xs text-orange-600 dark:text-orange-400">
          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
          <span>Approaching limit</span>
        </div>
      )}
    </div>
  );
};

export default FeatureGate; 