'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { APIDebugger } from '@/components/ui/api-debugger';
import { API_CONFIG } from '@/lib/config';

export default function TestFunctionsPage() {
  const [activeTab, setActiveTab] = useState('debugger');

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🧪 Crow's Eye Test Suite</h1>
          <p className="text-gray-400">
            Comprehensive testing and debugging tools for development
          </p>
          <div className="mt-4 flex items-center gap-4">
            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
              Development Only
            </Badge>
            <span className="text-sm text-gray-500">
              Environment: {API_CONFIG.environment} | API: {API_CONFIG.baseURL}
            </span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="debugger">API Debugger</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="stripe">Stripe Config</TabsTrigger>
          </TabsList>

          <TabsContent value="debugger">
            <APIDebugger />
          </TabsContent>

          <TabsContent value="auth">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">🔐 Authentication Testing</h2>
              <p className="text-gray-400 mb-6">
                Test authentication flows and user management
              </p>
              <div className="space-y-4">
                <Button 
                  onClick={() => window.location.href = '/auth/signin'}
                  variant="outline"
                >
                  Go to Sign In
                </Button>
                <Button 
                  onClick={() => window.location.href = '/auth/signup'}
                  variant="outline"
                >
                  Go to Sign Up
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="stripe">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">💳 Stripe Configuration</h2>
              <p className="text-gray-400 mb-6">
                Verify Stripe integration and configuration
              </p>
              <div className="space-y-4">
                <Button 
                  onClick={() => window.location.href = '/pricing'}
                  variant="outline"
                >
                  View Pricing Page
                </Button>
                <Button 
                  onClick={() => window.location.href = '/payg-setup'}
                  variant="outline"
                >
                  PAYG Setup Flow
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 