'use client';

import React, { useState, useEffect } from 'react';
import { UserCircleIcon, CogIcon, CreditCardIcon, ArrowRightOnRectangleIcon, ChartBarIcon, CloudArrowUpIcon, ShieldCheckIcon, SparklesIcon, ArrowPathIcon, ExclamationTriangleIcon, CheckCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { updateEmail, updatePassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserService } from '@/lib/firestore';

export default function AccountPage() {
  const { userProfile, logout, loading, isAuthenticated, refreshUserProfile } = useAuth();

  // --- Component state hooks (must be declared before any early returns) ---
  const [firstName, setFirstName] = useState((userProfile as any)?.firstName || '');
  const [lastName, setLastName] = useState((userProfile as any)?.lastName || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);

  // Keep editable fields in sync when the user profile loads or changes
  useEffect(() => {
    if (userProfile) {
      setFirstName((userProfile as any)?.firstName || '');
      setLastName((userProfile as any)?.lastName || '');
      setEmail(userProfile.email || '');
    }
  }, [userProfile]);

  // Show loading state if user profile is not loaded yet
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen darker-gradient-bg logo-bg-overlay flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading account information...</p>
        </div>
      </div>
    );
  }
  
  const limits: any = (userProfile as any)?.usage_limits || {};

  const aiCreditsUsed = limits.ai_credits || 0;
  const aiCreditsLimit = limits.max_ai_credits ?? 0; // -1 or 0 ⇒ unlimited
  const aiCreditsRemaining = aiCreditsLimit > 0 ? Math.max(0, aiCreditsLimit - aiCreditsUsed) : '∞';

  const storageUsedGB = Math.round(((limits.media_storage_mb || 0) / 1024) * 100) / 100;
  const storageLimitGB = limits.max_media_storage_mb ? Math.round((limits.max_media_storage_mb / 1024) * 100) / 100 : 0;

  const usage = {
    postsCreated: limits.scheduled_posts || 0,
    maxPosts: limits.max_scheduled_posts || 0,
    aiCreditsUsed,
    aiCreditsLimit,
    aiCreditsRemaining,
    socialAccountsConnected: limits.linked_accounts || 0,
    maxSocialAccounts: limits.max_linked_accounts || 0,
    storageUsedGB,
    storageLimitGB,
  };

  const calcPercent = (used: number, limit: number): number => {
    if (!limit || limit <= 0) return 100;
    return Math.min(100, (used / limit) * 100);
  };

  const handleManageSubscription = () => {
    // Redirect to subscription management page
    window.location.href = '/account/subscription';
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUserProfile();
    } finally {
      setRefreshing(false);
    }
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

  const handleSendVerification = async () => {
    if (!auth.currentUser) {
      alert('No authenticated user found');
      return;
    }

    setSendingVerification(true);
    try {
      await sendEmailVerification(auth.currentUser);
      alert('Verification email sent! Please check your inbox and spam folder. Click "Refresh" to update your verification status after verifying.');
    } catch (error: any) {
      console.error('Failed to send verification email:', error);
      alert(error.message || 'Failed to send verification email. Please try again.');
    } finally {
      setSendingVerification(false);
    }
  };

  const handleReloadUser = async () => {
    if (!auth.currentUser) return;
    
    try {
      // Reload user and force token refresh
      await auth.currentUser.reload();
      await auth.currentUser.getIdToken(true); // Force token refresh
      
      // Get fresh token and show its contents
      const token = await auth.currentUser.getIdToken(true);
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      
      console.log('🔍 Full token payload:', tokenPayload);
      console.log('🔍 Email verified in token:', tokenPayload.email_verified);
      console.log('🔍 User object emailVerified:', auth.currentUser.emailVerified);
      
      // Force a re-render by updating state
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 100);
      
      // Show debug info
      const debugInfo = {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        emailVerified: auth.currentUser.emailVerified,
        tokenEmailVerified: tokenPayload.email_verified
      };
      
      console.log('🔍 Token debug after reload:', debugInfo);
      
      if (auth.currentUser.emailVerified && tokenPayload.email_verified) {
        alert('✅ Email verification confirmed in both user object and token! You can now upload files.');
      } else if (auth.currentUser.emailVerified && !tokenPayload.email_verified) {
        alert('⚠️ Email verified in user object but not in token. Please sign out and sign back in to get a fresh token.');
      } else {
        alert('⚠️ Email still showing as unverified. Please check if you clicked the verification link in your email.');
      }
    } catch (error) {
      console.error('Failed to reload user:', error);
      alert('Failed to refresh user status. You may need to sign out and sign back in.');
    }
  };

  const handleForceSignOut = async () => {
    if (confirm('This will sign you out to force a fresh token. Continue?')) {
      try {
        await logout();
        alert('Signed out. Please sign back in to get a fresh token with email verification.');
        window.location.href = '/auth/signin';
      } catch (error) {
        console.error('Sign out failed:', error);
      }
    }
  };

  // Format plan name for display
  const formatPlanName = (plan: string) => {
    if (plan === 'payg') return 'Pay-as-you-Go';
    if (plan === 'creator') return 'Creator';
    if (plan === 'growth') return 'Growth';
    if (plan === 'pro') return 'Pro';
    if (plan === 'free') return 'Free';
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  const displayPlan = formatPlanName(userProfile?.plan || 'Free');

  const planColors = {
    'Pay-as-you-Go': 'from-emerald-500 to-teal-500',
    'Creator': 'from-purple-500 to-pink-500',
    'Growth': 'from-blue-500 to-cyan-500',
    'Pro': 'from-yellow-500 to-orange-500',
    'Free': 'from-gray-500 to-gray-600'
  };

  const currentPlanColor = planColors[displayPlan as keyof typeof planColors] || planColors['Free'];

  const user = {
    name: userProfile?.displayName || (userProfile as any)?.firstName || 'Loading...',
    email: userProfile?.email || 'Loading...',
    plan: (userProfile as any)?.subscription_tier || (userProfile as any)?.plan || 'Free',
    joinDate: (userProfile as any)?.created_at || (userProfile as any)?.createdAt || new Date().toISOString(),
  };

  const handleSaveProfile = async () => {
    if (password && password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const authUser = auth.currentUser;
      if (!authUser) throw new Error('Not authenticated');

      // Update email in Firebase Auth if changed
      if (email && email !== authUser.email) {
        await updateEmail(authUser, email);
      }

      // Update password if provided
      if (password) {
        await updatePassword(authUser, password);
      }

      // Update Firestore user document
      const fullName = `${firstName} ${lastName}`.trim();
      await UserService.updateUser(authUser.uid, {
        fullName,
        email,
      });

      await refreshUserProfile();
      alert('Profile updated successfully');
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="min-h-screen darker-gradient-bg logo-bg-overlay">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 pt-20">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tech-heading">Account Settings</h1>
            <p className="text-gray-300 tech-body">Manage your profile, subscription, and usage</p>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 px-6 py-3 rounded-xl transition-all duration-300 vision-card tech-subheading disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 px-6 py-3 rounded-xl transition-all duration-300 vision-card tech-subheading"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
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
                  <label className="block text-sm font-medium text-purple-300 mb-3 tech-subheading">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600/50 rounded-xl text-white vision-card focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all tech-body"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-3 tech-subheading">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600/50 rounded-xl text-white vision-card focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all tech-body"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-3 tech-subheading">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600/50 rounded-xl text-white vision-card focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all tech-body"
                  />
                </div>
              </div>

              {/* Email Verification Status */}
              <div className="mt-6 p-4 rounded-xl bg-black/20 border border-gray-600/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {auth.currentUser?.emailVerified ? (
                      <>
                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="text-green-400 font-medium tech-subheading">Email Verified</p>
                          <p className="text-gray-400 text-sm tech-body">Your email address has been verified</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                        <div>
                          <p className="text-yellow-400 font-medium tech-subheading">Email Not Verified</p>
                          <p className="text-gray-400 text-sm tech-body">Please verify your email address to secure your account</p>
                        </div>
                      </>
                    )}
                  </div>
                                     <div className="flex items-center space-x-2">
                     {auth.currentUser?.emailVerified ? (
                       <button
                         onClick={handleReloadUser}
                         className="flex items-center space-x-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 hover:text-green-200 px-4 py-2 rounded-lg transition-all duration-300 tech-subheading"
                       >
                         <ArrowPathIcon className="h-4 w-4" />
                         <span>Refresh Status</span>
                       </button>
                     ) : (
                       <>
                         <button
                           onClick={handleSendVerification}
                           disabled={sendingVerification}
                           className="flex items-center space-x-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 hover:text-yellow-200 px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed tech-subheading"
                         >
                           <EnvelopeIcon className="h-4 w-4" />
                           <span>{sendingVerification ? 'Sending...' : 'Send Verification'}</span>
                         </button>
                         <button
                           onClick={handleReloadUser}
                           className="flex items-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 px-4 py-2 rounded-lg transition-all duration-300 tech-subheading"
                         >
                           <ArrowPathIcon className="h-4 w-4" />
                           <span>Check Status</span>
                         </button>
                       </>
                     )}
                   </div>
                </div>
              </div>

              {/* Password fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-3 tech-subheading">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600/50 rounded-xl text-white vision-card focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all tech-body"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-3 tech-subheading">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 bg-black/30 border border-gray-600/50 rounded-xl text-white vision-card focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all tech-body"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="vision-button px-6 py-3 rounded-xl text-white font-semibold tech-subheading disabled:opacity-50 disabled:pointer-events-none"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
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
                  {displayPlan} Plan
                </div>
              </div>
              
              <p className="text-gray-300 mb-6 tech-body">
                You are currently on the <strong className="text-white">{displayPlan}</strong> plan. 
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
                    <div className="text-xs text-gray-400">{aiCreditsLimit > 0 ? `of ${aiCreditsLimit}` : 'unlimited'}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UserCircleIcon className="h-5 w-5 text-cyan-400" />
                    <span className="text-gray-300 tech-body">Social Accounts</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold tech-subheading">{usage.socialAccountsConnected}</div>
                    <div className="text-xs text-gray-400">of {usage.maxSocialAccounts || '∞'}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CloudArrowUpIcon className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300 tech-body">Storage Used</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold tech-subheading">{usage.storageUsedGB} GB</div>
                    <div className="text-xs text-gray-400">{usage.storageLimitGB ? `of ${usage.storageLimitGB} GB` : 'unlimited'}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CogIcon className="h-5 w-5 text-yellow-400" />
                    <span className="text-gray-300 tech-body">Posts Created</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold tech-subheading">{usage.postsCreated}</div>
                    <div className="text-xs text-gray-400">of {usage.maxPosts || '∞'}</div>
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
                    <span className="text-gray-300 text-sm tech-body">{usage.aiCreditsUsed}/{aiCreditsLimit > 0 ? aiCreditsLimit : '∞'}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${calcPercent(usage.aiCreditsUsed, aiCreditsLimit)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300 text-sm tech-body">Storage</span>
                    <span className="text-gray-300 text-sm tech-body">{usage.storageUsedGB}/{usage.storageLimitGB || '∞'} GB</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${calcPercent(usage.storageUsedGB, usage.storageLimitGB)}%` }}
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