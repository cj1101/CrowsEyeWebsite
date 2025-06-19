'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyticsDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          📊 Analytics Dashboard
        </h1>
        
        <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
          <CardHeader>
            <CardTitle>Analytics Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Comprehensive analytics dashboard coming soon!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 