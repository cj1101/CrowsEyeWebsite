'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BrandIcon } from '@/components/ui/brand-icons';
import { 
  Link as LinkIcon, 
  Unlink, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Settings,
  Eye,
  Users,
  Calendar,
  TrendingUp,
  Shield,
  Info,
  ExternalLink
} from 'lucide-react';

interface PlatformConnection {
  id: string;
  platform: string;
  name: string;
  color: string;
  connected: boolean;
  username?: string;
  profileUrl?: string;
  connectedAt?: string;
  lastSync?: string;
  status: 'active' | 'error' | 'warning' | 'disconnected' | 'pending';
  permissions: string[];
  statistics?: {
    followers: number;
    posts: number;
    engagement: number;
  };
  features: {
    posting: boolean;
    scheduling: boolean;
    analytics: boolean;
    directMessages: boolean;
  };
  errors?: string[];
  oauthUrl?: string;
  requiresVerification?: boolean;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  description?: string;
  subPlatforms?: string[];
}

const platformsData: PlatformConnection[] = [
  {
    id: 'instagram',
    platform: 'Instagram',
    name: 'Instagram Business',
    color: 'from-purple-500 to-pink-500',
    connected: false,
    status: 'disconnected',
    permissions: ['instagram_basic', 'instagram_content_publish', 'instagram_manage_insights'],
    features: {
      posting: true,
      scheduling: true,
      analytics: true,
      directMessages: false
    },
    oauthUrl: '/api/auth/instagram/start',
    requiresVerification: true,
    verificationStatus: 'pending'
  },
  {
    id: 'facebook',
    platform: 'Facebook',
    name: 'Facebook Pages',
    color: 'from-blue-600 to-blue-700',
    connected: false,
    status: 'disconnected',
    permissions: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'],
    features: {
      posting: true,
      scheduling: true,
      analytics: true,
      directMessages: true
    },
    oauthUrl: '/api/auth/facebook/start',
    requiresVerification: true,
    verificationStatus: 'pending'
  },
  {
    id: 'tiktok',
    platform: 'TikTok',
    name: 'TikTok for Business',
    color: 'from-pink-500 to-red-500',
    connected: false,
    status: 'disconnected',
    permissions: ['video.upload', 'user.info.basic', 'video.publish'],
    features: {
      posting: true,
      scheduling: false,
      analytics: true,
      directMessages: false
    },
    oauthUrl: '/api/auth/tiktok/start',
    requiresVerification: true,
    verificationStatus: 'pending'
  },
  {
    id: 'pinterest',
    platform: 'Pinterest',
    name: 'Pinterest Business',
    color: 'from-red-500 to-red-600',
    connected: false,
    status: 'disconnected',
    permissions: ['boards:read', 'pins:write', 'user_accounts:read'],
    features: {
      posting: true,
      scheduling: true,
      analytics: true,
      directMessages: false
    },
    oauthUrl: '/api/auth/pinterest/start',
    requiresVerification: true,
    verificationStatus: 'pending'
  },
  {
    id: 'google',
    platform: 'Google Platforms',
    name: 'YouTube & Google My Business',
    color: 'from-red-600 to-yellow-500',
    connected: false,
    status: 'disconnected',
    permissions: ['youtube.upload', 'youtube.readonly', 'youtube.force-ssl', 'business.manage'],
    features: {
      posting: true,
      scheduling: true,
      analytics: true,
      directMessages: false
    },
    oauthUrl: '/api/auth/google/start',
    requiresVerification: true,
    verificationStatus: 'pending',
    description: 'Connect to YouTube for video uploads and Google My Business for local business posts',
    subPlatforms: ['YouTube', 'Google My Business']
  },
  {
    id: 'snapchat',
    platform: 'Snapchat',
    name: 'Snapchat Ads',
    color: 'from-yellow-400 to-yellow-500',
    connected: false,
    status: 'disconnected',
    permissions: ['snapchat-marketing-api'],
    features: {
      posting: true,
      scheduling: false,
      analytics: true,
      directMessages: false
    },
    oauthUrl: '/api/auth/snapchat/start',
    requiresVerification: true,
    verificationStatus: 'pending'
  }
];

export default function ConnectionsTab() {
  const [platforms, setPlatforms] = useState<PlatformConnection[]>(platformsData);
  const [loading, setLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformConnection | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Load connection status from localStorage on mount
  useEffect(() => {
    loadConnectionStatus();
  }, []);

  const loadConnectionStatus = () => {
    const updatedPlatforms = platforms.map(platform => {
      const stored = localStorage.getItem(`platform_${platform.id}_connected`);
      const storedData = stored ? JSON.parse(stored) : null;
      
      if (storedData) {
        return {
          ...platform,
          connected: true,
          status: 'active' as const,
          username: storedData.username || platform.username,
          connectedAt: storedData.connectedAt || new Date().toISOString(),
          lastSync: storedData.lastSync || new Date().toISOString()
        };
      }
      
      return platform;
    });
    
    setPlatforms(updatedPlatforms);
  };

  const handleConnect = async (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;

    try {
      setLoading(true);
      
      if (platform.oauthUrl) {
        // Open OAuth flow in popup
        const popup = window.open(
          platform.oauthUrl,
          `${platformId}_oauth`,
          'width=600,height=600,scrollbars=yes,resizable=yes'
        );
        
        // Listen for OAuth completion
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            // Recheck connection status
            loadConnectionStatus();
          }
        }, 1000);
      } else {
        // For platforms without OAuth endpoints yet, show info
        alert(`${platform.name} integration is not yet configured. OAuth endpoints are being prepared for app verification.`);
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert(`Failed to connect to ${platform.name}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;

    const confirmed = confirm(`Are you sure you want to disconnect ${platform.name}?`);
    if (!confirmed) return;

    try {
      setLoading(true);
      
      // Remove from localStorage
      localStorage.removeItem(`platform_${platformId}_connected`);
      
      // Update platform status
      setPlatforms(prev => prev.map(p => 
        p.id === platformId 
          ? { 
              ...p, 
              connected: false, 
              status: 'disconnected' as const,
              username: undefined,
              connectedAt: undefined,
              lastSync: undefined,
              statistics: undefined
            }
          : p
      ));
      
      console.log(`Disconnected from ${platform.name}`);
    } catch (error) {
      console.error('Disconnect error:', error);
      alert(`Failed to disconnect from ${platform.name}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;

    try {
      setLoading(true);
      
      // Update last sync time
      setPlatforms(prev => prev.map(p => 
        p.id === platformId 
          ? { ...p, lastSync: new Date().toISOString() }
          : p
      ));
      
      // Update localStorage
      const storedData = localStorage.getItem(`platform_${platformId}_connected`);
      if (storedData) {
        const data = JSON.parse(storedData);
        data.lastSync = new Date().toISOString();
        localStorage.setItem(`platform_${platformId}_connected`, JSON.stringify(data));
      }
      
      console.log(`Synced ${platform.name} data`);
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-blue-400" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const connectedPlatforms = platforms.filter(p => p.connected);
  const totalFollowers = connectedPlatforms.reduce((sum, p) => sum + (p.statistics?.followers || 0), 0);
  const totalPosts = connectedPlatforms.reduce((sum, p) => sum + (p.statistics?.posts || 0), 0);
  const avgEngagement = connectedPlatforms.length > 0 
    ? connectedPlatforms.reduce((sum, p) => sum + (p.statistics?.engagement || 0), 0) / connectedPlatforms.length 
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Connections</h1>
          <p className="text-gray-400">Connect and manage your social media accounts</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <LinkIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Connected</p>
                <p className="text-xl font-bold text-white">{connectedPlatforms.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Users className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Followers</p>
                <p className="text-xl font-bold text-white">{totalFollowers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Posts</p>
                <p className="text-xl font-bold text-white">{totalPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Avg Engagement</p>
                <p className="text-xl font-bold text-white">{avgEngagement.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform) => (
          <Card 
            key={platform.id} 
            className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all duration-200"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${platform.color} bg-opacity-20`}>
                    <BrandIcon 
                      platform={platform.platform.toLowerCase()} 
                      size={24} 
                      className="text-white"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{platform.platform}</CardTitle>
                    <CardDescription className="text-gray-400">{platform.name}</CardDescription>
                    {platform.subPlatforms && (
                      <div className="text-xs text-gray-500 mt-1">
                        Includes: {platform.subPlatforms.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(platform.status)}
                  <Badge className={getStatusColor(platform.status)}>
                    {platform.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {platform.connected ? (
                <>
                  {/* Connected Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Username:</span>
                      <span className="text-sm text-white font-medium">{platform.username}</span>
                    </div>
                    
                    {platform.connectedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Connected:</span>
                        <span className="text-sm text-white">{formatDate(platform.connectedAt)}</span>
                      </div>
                    )}
                    
                    {platform.lastSync && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Last Sync:</span>
                        <span className="text-sm text-white">{formatDate(platform.lastSync)}</span>
                      </div>
                    )}
                  </div>

                  {/* Statistics */}
                  {platform.statistics && (
                    <div className="grid grid-cols-3 gap-2 p-3 bg-gray-700/30 rounded-lg">
                      <div className="text-center">
                        <div className="text-sm font-medium text-white">{platform.statistics.followers.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-white">{platform.statistics.posts}</div>
                        <div className="text-xs text-gray-400">Posts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-white">{platform.statistics.engagement.toFixed(1)}%</div>
                        <div className="text-xs text-gray-400">Engagement</div>
                      </div>
                    </div>
                  )}

                  {/* Description for special platforms */}
                  {platform.description && (
                    <div className="text-xs text-gray-400 bg-gray-700/30 p-2 rounded">
                      {platform.description}
                    </div>
                  )}

                  {/* Features */}
                  <div className="space-y-2">
                    <div className="text-sm text-gray-400">Available Features:</div>
                    <div className="flex flex-wrap gap-1">
                      {platform.features.posting && <Badge variant="secondary" className="text-xs">Posting</Badge>}
                      {platform.features.scheduling && <Badge variant="secondary" className="text-xs">Scheduling</Badge>}
                      {platform.features.analytics && <Badge variant="secondary" className="text-xs">Analytics</Badge>}
                      {platform.features.directMessages && <Badge variant="secondary" className="text-xs">DMs</Badge>}
                    </div>
                  </div>

                  {/* Errors */}
                  {platform.errors && platform.errors.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm text-red-400">Issues:</div>
                      {platform.errors.map((error, index) => (
                        <div key={index} className="text-xs text-red-300 bg-red-500/10 p-2 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(platform.id)}
                      disabled={loading}
                      className="flex-1 border-gray-600 hover:border-blue-500"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sync
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPlatform(platform);
                        setShowDetails(true);
                      }}
                      className="border-gray-600 hover:border-gray-500"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(platform.id)}
                      className="border-red-600 hover:border-red-500 text-red-400"
                    >
                      <Unlink className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Not Connected */}
                  <div className="space-y-3">
                    <div className="text-sm text-gray-400">
                      Connect your {platform.platform} account to start posting and managing content.
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Features Available:</div>
                      <div className="flex flex-wrap gap-1">
                        {platform.features.posting && <Badge variant="outline" className="text-xs border-gray-600">Posting</Badge>}
                        {platform.features.scheduling && <Badge variant="outline" className="text-xs border-gray-600">Scheduling</Badge>}
                        {platform.features.analytics && <Badge variant="outline" className="text-xs border-gray-600">Analytics</Badge>}
                        {platform.features.directMessages && <Badge variant="outline" className="text-xs border-gray-600">DMs</Badge>}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleConnect(platform.id)}
                      disabled={loading}
                      className={`w-full bg-gradient-to-r ${platform.color} hover:opacity-90`}
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Connect {platform.platform}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help Section */}
      <Card className="bg-gray-800/30 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Info className="h-5 w-5 text-blue-400 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Getting Started with Platform Connections</h3>
              <div className="text-gray-300 space-y-2 text-sm">
                <p>• <strong>Instagram & Facebook:</strong> Requires a business account and Facebook Page connection</p>
                <p>• <strong>TikTok:</strong> TikTok for Business account needed for API access</p>
                <p>• <strong>Pinterest:</strong> Business account recommended for enhanced features</p>
                <p>• <strong>YouTube:</strong> Channel ownership verification required</p>
                <p>• <strong>Snapchat:</strong> Snapchat Ads Manager account required for publishing</p>
                <p className="text-yellow-400">⚠️ <strong>Note:</strong> All platforms require app verification before OAuth endpoints become active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 