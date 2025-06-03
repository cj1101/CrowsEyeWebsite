'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSubscriptionFeatures, PRICING_TIERS } from '@/lib/subscription';
import { Tab } from '@headlessui/react';
import { 
  PhotoIcon, 
  RectangleGroupIcon, 
  DocumentTextIcon, 
  VideoCameraIcon, 
  ChartBarIcon,
  LockClosedIcon 
} from '@heroicons/react/24/outline';
import LibraryTab from '@/components/dashboard/LibraryTab';
import GalleriesTab from '@/components/dashboard/GalleriesTab';
import StoriesTab from '@/components/dashboard/StoriesTab';
import HighlightsTab from '@/components/dashboard/HighlightsTab';
import AnalyticsTab from '@/components/dashboard/AnalyticsTab';
import IntegrationStatus from '@/components/dashboard/IntegrationStatus';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function DashboardPage() {
  const { userProfile, isAuthenticated } = useAuth();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Get user's current tier (default to 'free' if not authenticated)
  const userTier = userProfile?.subscription?.tier || 'free';
  const features = getSubscriptionFeatures(userTier);

  const tabs = [
    {
      name: 'Library',
      icon: PhotoIcon,
      component: LibraryTab,
      requiredTier: 'free',
      enabled: features.basicLibrary,
    },
    {
      name: 'Galleries',
      icon: RectangleGroupIcon,
      component: GalleriesTab,
      requiredTier: 'free',
      enabled: features.galleries,
    },
    {
      name: 'Stories',
      icon: DocumentTextIcon,
      component: StoriesTab,
      requiredTier: 'free',
      enabled: features.stories,
    },
    {
      name: 'Highlights',
      icon: VideoCameraIcon,
      component: HighlightsTab,
      requiredTier: 'creator',
      enabled: features.highlightVideo,
    },
    {
      name: 'Analytics',
      icon: ChartBarIcon,
      component: AnalyticsTab,
      requiredTier: 'pro',
      enabled: features.analyticsExport,
    },
  ];

  const getNextTier = (requiredTier: string) => {
    if (requiredTier === 'creator') return 'Creator';
    if (requiredTier === 'pro') return 'Pro';
    return 'Enterprise';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access the dashboard</h1>
          <p className="text-gray-600">You need to be authenticated to use the Crow's Eye dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="mt-2 flex items-center space-x-4">
            <span className="text-sm text-gray-600">Current plan:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {PRICING_TIERS[userTier as keyof typeof PRICING_TIERS]?.name || userTier} 
              {typeof PRICING_TIERS[userTier as keyof typeof PRICING_TIERS]?.price === 'number' 
                ? ` ($${PRICING_TIERS[userTier as keyof typeof PRICING_TIERS].price}/mo)`
                : PRICING_TIERS[userTier as keyof typeof PRICING_TIERS]?.price === 'Custom'
                ? ' (Custom pricing)'
                : ' ($0/mo)'
              }
            </span>
          </div>
        </div>

        {/* Integration Status */}
        <div className="mb-6">
          <IntegrationStatus />
        </div>

        {/* Tabs */}
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 relative',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-blue-700 shadow'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  )
                }
                disabled={!tab.enabled}
              >
                <div className="flex items-center justify-center space-x-2">
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                  {!tab.enabled && (
                    <LockClosedIcon className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                {!tab.enabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                    <div className="text-xs text-white text-center px-2">
                      <div>Upgrade to {getNextTier(tab.requiredTier)}</div>
                      <div>for this feature</div>
                    </div>
                  </div>
                )}
              </Tab>
            ))}
          </Tab.List>
          
          <Tab.Panels className="mt-6">
            {tabs.map((tab) => (
              <Tab.Panel
                key={tab.name}
                className={classNames(
                  'rounded-xl bg-white p-6',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                )}
              >
                {tab.enabled ? (
                  <tab.component />
                ) : (
                  <div className="text-center py-12">
                    <LockClosedIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {tab.name} requires {getNextTier(tab.requiredTier)} plan
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Upgrade to {getNextTier(tab.requiredTier)} to access this feature.
                    </p>
                    <div className="mt-6">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={() => window.location.href = '/pricing'}
                      >
                        Upgrade to {getNextTier(tab.requiredTier)}
                      </button>
                    </div>
                  </div>
                )}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
} 