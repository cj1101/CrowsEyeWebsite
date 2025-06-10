'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Instagram, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function InstagramAuthPage() {
  const [authState, setAuthState] = useState<'loading' | 'success' | 'error'>('loading');
  const [authData, setAuthData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      setAuthState('error');
      setError(errorDescription || error);
      return;
    }

    if (code) {
      // Handle the authorization code
      handleAuthCode(code, state);
    } else {
      // No code present, show instructions
      setAuthState('success');
      setAuthData({ 
        message: 'Ready to connect Instagram',
        instructions: true 
      });
    }
  }, [searchParams]);

  const handleAuthCode = async (code: string, state: string | null) => {
    try {
      setAuthState('loading');
      
      // Here you would typically exchange the code for an access token
      // For now, we'll just show success
      console.log('Instagram auth code received:', { code, state });
      
      // Simulate API call to exchange code for token
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAuthState('success');
      setAuthData({
        code,
        state,
        message: 'Instagram authorization successful!',
        nextSteps: [
          'Your Instagram account has been connected',
          'You can now set up webhook subscriptions',
          'Return to the Instagram Developer Console to complete setup'
        ]
      });
    } catch (err) {
      setAuthState('error');
      setError('Failed to process Instagram authorization');
      console.error('Instagram auth error:', err);
    }
  };

  const startInstagramAuth = () => {
    // Instagram OAuth URL - you'll need to replace with your actual app details
    const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID || 'YOUR_INSTAGRAM_CLIENT_ID';
    const redirectUri = encodeURIComponent(window.location.origin + '/auth/instagram');
    const scope = encodeURIComponent('instagram_basic,instagram_manage_comments,instagram_manage_messages');
    const state = Math.random().toString(36).substring(7);
    
    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=${state}`;
    
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto pt-16">
        <div className="mb-8">
          <Link href="/marketing-tool" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketing Tool
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Instagram Integration</h1>
          <p className="text-gray-600">Connect your Instagram Business account to enable webhook functionality</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="w-6 h-6 text-pink-600" />
              Instagram Authorization
            </CardTitle>
            <CardDescription>
              {authState === 'loading' && 'Processing Instagram authorization...'}
              {authState === 'success' && 'Instagram integration status'}
              {authState === 'error' && 'Authorization failed'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {authState === 'loading' && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                <span className="ml-2 text-lg">Processing...</span>
              </div>
            )}

            {authState === 'success' && (
              <div className="space-y-4">
                <div className="border border-green-200 bg-green-50 p-4 rounded-lg flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-green-800">
                    {authData?.message || 'Instagram integration ready'}
                  </span>
                </div>

                {authData?.instructions && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Setup Instructions</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><strong>Webhook URL:</strong></p>
                      <code className="block bg-white p-2 rounded border text-sm">
                        {window.location.origin}/api/webhooks/instagram
                      </code>
                      
                      <p className="mt-4"><strong>Redirect URI:</strong></p>
                      <code className="block bg-white p-2 rounded border text-sm">
                        {window.location.origin}/auth/instagram
                      </code>
                    </div>
                    
                    <button 
                      onClick={startInstagramAuth} 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Instagram className="w-4 h-4 mr-2" />
                      Connect Instagram Account
                    </button>
                  </div>
                )}

                {authData?.nextSteps && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Next Steps:</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {authData.nextSteps.map((step: string, index: number) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {authData?.code && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Authorization Details:</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Code:</strong> <code>{authData.code.substring(0, 20)}...</code></p>
                      {authData.state && <p><strong>State:</strong> <code>{authData.state}</code></p>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {authState === 'error' && (
              <div className="border border-red-200 bg-red-50 p-4 rounded-lg flex items-center">
                <XCircle className="w-4 h-4 text-red-600 mr-2" />
                <span className="text-red-800">
                  <strong>Error:</strong> {error}
                </span>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Developer Information</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Test Webhook:</strong> <a href="/api/webhooks/test" className="underline" target="_blank">/api/webhooks/test</a></p>
                <p><strong>Instagram Webhook:</strong> <a href="/api/webhooks/instagram" className="underline" target="_blank">/api/webhooks/instagram</a></p>
                <p><strong>Current URL:</strong> <code>{typeof window !== 'undefined' ? window.location.origin : ''}</code></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 