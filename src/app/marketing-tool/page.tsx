'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import MarketingToolDashboard from '@/components/marketing-tool/MarketingToolDashboard';

export default function MarketingToolPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Remove authentication requirement - allow demo access
  // Users can access the marketing tool without signing in for demo purposes
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-300 mt-4">Loading Marketing Tool...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <MarketingToolDashboard />
    </div>
  );
} 