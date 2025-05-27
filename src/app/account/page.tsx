'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { signOutUser } from '@/lib/auth';
import { 
  UserIcon, 
  EnvelopeIcon, 
  CalendarIcon, 
  CreditCardIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function AccountPage() {
  const { user, userProfile, loading } = useAuth();
  const [signOutLoading, setSignOutLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    setSignOutLoading(true);
    try {
      await signOutUser();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setSignOutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getSubscriptionBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'inactive':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Account Center</h1>
          <p className="text-xl text-gray-300">Manage your Crow&apos;s Eye account and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-8">
          <div className="flex items-center space-x-6 mb-6">
            <div className="relative">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="h-20 w-20 rounded-full border-4 border-purple-500"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-purple-600 flex items-center justify-center border-4 border-purple-500">
                  <UserIcon className="h-10 w-10 text-white" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {user.displayName || 'User'}
              </h2>
              <p className="text-gray-300 flex items-center">
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                {user.email}
              </p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSubscriptionBadgeColor(userProfile.subscription?.status || 'inactive')}`}>
                  <ShieldCheckIcon className="h-4 w-4 mr-1" />
                  {userProfile.subscription?.plan?.toUpperCase() || 'FREE'} Plan
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center text-gray-300 mb-2">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">Member Since</span>
              </div>
              <p className="text-white">{formatDate(userProfile.createdAt)}</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center text-gray-300 mb-2">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">Last Login</span>
              </div>
              <p className="text-white">{formatDate(userProfile.lastLoginAt)}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-left hover:bg-white/20 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <CogIcon className="h-8 w-8 text-purple-400" />
              <span className="text-sm text-gray-400">Settings</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Account Settings</h3>
            <p className="text-gray-300 text-sm">Update your profile, password, and preferences</p>
          </button>

          <button className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-left hover:bg-white/20 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <CreditCardIcon className="h-8 w-8 text-green-400" />
              <span className="text-sm text-gray-400">Billing</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Subscription</h3>
            <p className="text-gray-300 text-sm">Manage your subscription and billing information</p>
          </button>

          <button className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-left hover:bg-white/20 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <ShieldCheckIcon className="h-8 w-8 text-blue-400" />
              <span className="text-sm text-gray-400">Security</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Security</h3>
            <p className="text-gray-300 text-sm">Two-factor authentication and security settings</p>
          </button>
        </div>

        {/* Subscription Details */}
        {userProfile.subscription && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-8">
            <h3 className="text-xl font-bold text-white mb-6">Subscription Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-300 text-sm">Current Plan</p>
                <p className="text-white font-semibold text-lg capitalize">
                  {userProfile.subscription.plan}
                </p>
              </div>
              <div>
                <p className="text-gray-300 text-sm">Status</p>
                <p className="text-white font-semibold text-lg capitalize">
                  {userProfile.subscription.status}
                </p>
              </div>
              <div>
                <p className="text-gray-300 text-sm">Next Billing</p>
                <p className="text-white font-semibold text-lg">
                  {userProfile.subscription.expiresAt 
                    ? formatDate(userProfile.subscription.expiresAt)
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sign Out */}
        <div className="text-center">
          <button
            onClick={handleSignOut}
            disabled={signOutLoading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
            {signOutLoading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  );
} 