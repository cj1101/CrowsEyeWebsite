'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ShieldCheckIcon, 
  KeyIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function SecurityPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  const handleToggle2FA = async () => {
    setSaveStatus('saving');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTwoFactorEnabled(!twoFactorEnabled);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleSaveApiKey = async () => {
    setSaveStatus('saving');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleSignOutAllDevices = async () => {
    setSaveStatus('saving');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
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

  const activeSessions = [
    {
      id: 1,
      device: 'Chrome on Windows',
      location: 'Austin, TX',
      lastActive: '2 minutes ago',
      current: true,
      icon: ComputerDesktopIcon
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      location: 'Austin, TX',
      lastActive: '1 hour ago',
      current: false,
      icon: DevicePhoneMobileIcon
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/account" 
            className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Account
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">Security Settings</h1>
          <p className="text-xl text-gray-300">Manage your account security and privacy settings</p>
        </div>

        {/* Status Message */}
        {saveStatus === 'saved' && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-400 mr-3" />
              <div>
                <h3 className="text-green-400 font-semibold">Settings Updated!</h3>
                <p className="text-green-300 text-sm">Your security settings have been successfully updated.</p>
              </div>
            </div>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400 mr-3" />
              <div>
                <h3 className="text-red-400 font-semibold">Error Updating Settings</h3>
                <p className="text-red-300 text-sm">Please try again or contact support if the problem persists.</p>
              </div>
            </div>
          </div>
        )}

        {/* Two-Factor Authentication */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-green-600/20 rounded-full p-3">
                <ShieldCheckIcon className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Two-Factor Authentication</h2>
                <p className="text-gray-300">Add an extra layer of security to your account</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={handleToggle2FA}
                disabled={saveStatus === 'saving'}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {twoFactorEnabled ? (
            <div className="bg-green-900/20 rounded-lg p-4 border border-green-600/30">
              <p className="text-green-300 text-sm">
                ✅ Two-factor authentication is enabled. Your account is protected with an additional security layer.
              </p>
            </div>
          ) : (
            <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-600/30">
              <p className="text-yellow-300 text-sm">
                ⚠️ Two-factor authentication is disabled. Enable it to better protect your account.
              </p>
            </div>
          )}
        </div>

        {/* API Key Management */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-blue-600/20 rounded-full p-3">
              <KeyIcon className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">API Key Management</h2>
                              <p className="text-gray-300">Manage your custom AI API keys</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                OpenAI API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="sk-..."
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showApiKey ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                                  Your API key is encrypted and stored securely.
              </p>
            </div>

            <button
              onClick={handleSaveApiKey}
              disabled={saveStatus === 'saving'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Save API Key'}
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Active Sessions</h2>
              <p className="text-gray-300">Manage devices that are currently signed in to your account</p>
            </div>
            <button
              onClick={handleSignOutAllDevices}
              disabled={saveStatus === 'saving'}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
            >
              {saveStatus === 'saving' ? 'Signing Out...' : 'Sign Out All'}
            </button>
          </div>

          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div key={session.id} className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-700 rounded-full p-2">
                    <session.icon className="h-6 w-6 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{session.device}</h3>
                    <p className="text-gray-400 text-sm">{session.location} • {session.lastActive}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {session.current && (
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium">
                      Current
                    </span>
                  )}
                  {!session.current && (
                    <button className="text-red-400 hover:text-red-300 text-sm font-medium">
                      Sign Out
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Password Security */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-purple-600/20 rounded-full p-3">
              <KeyIcon className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Password Security</h2>
              <p className="text-gray-300">Manage your password and security preferences</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Change Password</h3>
              <p className="text-gray-300 text-sm mb-4">
                Update your password to keep your account secure.
              </p>
              <Link
                href="/account/settings"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors inline-block"
              >
                Change Password
              </Link>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Login Alerts</h3>
              <p className="text-gray-300 text-sm mb-4">
                Get notified when someone signs in to your account.
              </p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 