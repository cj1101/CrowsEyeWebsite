'use client';

import React, { useState } from 'react';
import { UserCircleIcon, CogIcon, CreditCardIcon, ArrowRightOnRectangleIcon, ChartBarIcon, CloudArrowUpIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountPage() {
  const { userProfile, logout } = useAuth();
  
  const [user] = useState({
    name: userProfile?.displayName || 'Guest User',
    email: userProfile?.email || 'guest@example.com',
    plan: userProfile?.plan || 'Free',
    joinDate: userProfile?.createdAt || '2024-01-01'
  });

  const [usage] = useState({
    postsCreated: 25,
    mediaUploaded: 150,
    aiCreditsUsed: 75,
    storageUsed: 2.5,
    aiCreditsRemaining: 225,
    socialAccountsConnected: 3,
    totalScheduledPosts: 12
  });

  const handleManageSubscription = () => {
    // Redirect to subscription management page
    window.location.href = '/account/subscription';
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

  const planColors = {
    Free: 'from-gray-500 to-gray-600',
    Creator: 'from-purple-500 to-pink-500',
    Growth: 'from-blue-500 to-cyan-500',
    Pro: 'from-yellow-500 to-orange-500'
  };

  const currentPlanColor = planColors[user.plan as keyof typeof planColors] || planColors.Free;

  return (
    <div className="min-h-screen darker-gradient-bg logo-bg-overlay">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 pt-20">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tech-heading">Account Settings</h1>
            <p className="text-gray-300 tech-body">Manage your profile, subscription, and usage</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 px-6 py-3 rounded-xl transition-all duration-300 vision-card mt-4 md:mt-0 tech-subheading"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Subscription */}
          <div className="lg:col-span-2 space-y-8">
            {/* User Profile */}
            <div className="vision-card rounded-2xl p-8">
              <div className="flex items-center mb-8">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-6">
                    {(userProfile as any)?.photoURL ? (
                      <img src={(userProfile as any).photoURL} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
                    ) : (
                      <UserCircleIcon className="h-12 w-12 text-white" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-gray-900"></div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1 tech-heading">{user.name}</h2>
                  <p className="text-gray-300 tech-body">{user.email}</p>
                  <p className="text-sm text-gray-400 tech-body">Member since {new Date(user.joinDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-3 tech-subheading">Full Name</label>
                  <input
                    type="text"
                    value={user.name}
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600/50 rounded-xl text-white vision-card focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all tech-body"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-3 tech-subheading">Email Address</label>
                  <input
                    type="email"
                    value={user.email}
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600/50 rounded-xl text-white vision-card focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all tech-body"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Subscription */}
            <div className="vision-card rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center tech-heading">
                  <CreditCardIcon className="h-6 w-6 mr-3 text-purple-400" />
                  Subscription & Billing
                </h3>
                <div className={`bg-gradient-to-r ${currentPlanColor} text-white px-4 py-2 rounded-full text-sm font-bold tech-subheading`}>
                  {user.plan} Plan
                </div>
              </div>
              
              <p className="text-gray-300 mb-6 tech-body">
                You are currently on the <strong className="text-white">{user.plan}</strong> plan. 
                Manage your subscription, update payment methods, or view billing history.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleManageSubscription}
                  className="vision-button text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 tech-subheading"
                >
                  Manage Subscription
                </button>
                <a
                  href="/pricing"
                  className="vision-card text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 tech-subheading"
                >
                  View Plans
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Usage Stats & Quick Actions */}
          <div className="space-y-8">
            {/* Usage Overview */}
            <div className="vision-card rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center tech-heading">
                <ChartBarIcon className="h-6 w-6 mr-3 text-blue-400" />
                Usage Overview
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <SparklesIcon className="h-5 w-5 text-purple-400" />
                    <span className="text-gray-300 tech-body">AI Credits</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold tech-subheading">{usage.aiCreditsRemaining}</div>
                    <div className="text-xs text-gray-400">remaining</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UserCircleIcon className="h-5 w-5 text-cyan-400" />
                    <span className="text-gray-300 tech-body">Social Accounts</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold tech-subheading">{usage.socialAccountsConnected}</div>
                    <div className="text-xs text-gray-400">connected</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CloudArrowUpIcon className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300 tech-body">Storage Used</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold tech-subheading">{usage.storageUsed} GB</div>
                    <div className="text-xs text-gray-400">of 10 GB</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CogIcon className="h-5 w-5 text-yellow-400" />
                    <span className="text-gray-300 tech-body">Posts Created</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold tech-subheading">{usage.postsCreated}</div>
                    <div className="text-xs text-gray-400">this month</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="vision-card rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center tech-heading">
                <ShieldCheckIcon className="h-6 w-6 mr-3 text-green-400" />
                Quick Actions
              </h3>
              
              <div className="space-y-4">
                <a
                  href="/marketing-tool"
                  className="block w-full text-left px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl transition-all duration-300 group"
                >
                  <div className="text-white font-medium tech-subheading group-hover:text-purple-300">Marketing Tool</div>
                  <div className="text-gray-400 text-sm tech-body">Create and schedule content</div>
                </a>
                
                <a
                  href="/account/subscription"
                  className="block w-full text-left px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl transition-all duration-300 group"
                >
                  <div className="text-white font-medium tech-subheading group-hover:text-blue-300">Billing History</div>
                  <div className="text-gray-400 text-sm tech-body">View past invoices</div>
                </a>
                
                <a
                  href="/contact"
                  className="block w-full text-left px-4 py-3 bg-green-500/20 hover:bg-green-500/30 rounded-xl transition-all duration-300 group"
                >
                  <div className="text-white font-medium tech-subheading group-hover:text-green-300">Support</div>
                  <div className="text-gray-400 text-sm tech-body">Get help and support</div>
                </a>
              </div>
            </div>

            {/* Plan Progress */}
            <div className="vision-card rounded-2xl p-8">
              <h3 className="text-lg font-bold text-white mb-6 tech-heading">Monthly Progress</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300 text-sm tech-body">AI Credits</span>
                    <span className="text-gray-300 text-sm tech-body">{usage.aiCreditsUsed}/300</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${(usage.aiCreditsUsed / 300) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300 text-sm tech-body">Storage</span>
                    <span className="text-gray-300 text-sm tech-body">{usage.storageUsed}/10 GB</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${(usage.storageUsed / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 