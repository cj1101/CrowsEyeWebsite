'use client';

import React, { useState } from 'react';
import { UserCircleIcon, CogIcon, CreditCardIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountPage() {
  const { userProfile, logout } = useAuth();
  
  const [user] = useState({
    name: userProfile?.displayName || 'Demo User',
    email: userProfile?.email || 'demo@example.com',
    plan: userProfile?.plan || 'Free',
    joinDate: userProfile?.createdAt || '2024-01-01'
  });

  const [usage] = useState({
    postsCreated: 25,
    mediaUploaded: 150,
    aiCreditsUsed: 75,
    storageUsed: 2.5
  });

  const handleManageSubscription = () => {
    // Mock subscription management
    alert('Subscription management would open here');
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await logout();
        window.location.href = '/';
      } catch (error) {
        console.error('Logout failed:', error);
        alert('Logout failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>

        {/* User Profile */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-6">
            <UserCircleIcon className="h-16 w-16 text-gray-400 mr-4" />
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-sm text-gray-500">Member since {new Date(user.joinDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={user.name}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={user.email}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Subscription
            </h3>
            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
              {user.plan}
            </span>
          </div>
          <p className="text-gray-400 mb-4">
            You are currently on the {user.plan} plan.
          </p>
          <button
            onClick={handleManageSubscription}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Manage Subscription
          </button>
        </div>

        {/* Usage Stats */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CogIcon className="h-5 w-5 mr-2" />
            Usage Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400">{usage.postsCreated}</div>
              <div className="text-sm text-gray-400">Posts Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400">{usage.mediaUploaded}</div>
              <div className="text-sm text-gray-400">Media Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400">{usage.aiCreditsUsed}</div>
              <div className="text-sm text-gray-400">AI Credits Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400">{usage.storageUsed} GB</div>
              <div className="text-sm text-gray-400">Storage Used</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 