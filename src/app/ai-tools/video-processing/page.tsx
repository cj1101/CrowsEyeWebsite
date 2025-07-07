'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Dynamically import the heavy VideoProcessingHub to reduce initial bundle size
const VideoProcessingHub = dynamic(() => import('@/components/video-processing/VideoProcessingHub'), {
  ssr: false,
  loading: () => <div className="text-center text-gray-400 py-20">Loading Video Processing Suite...</div>
});

export default function VideoProcessingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="sm"
            className="border-gray-600 hover:bg-gray-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">AI Video Processing Suite</h1>
        </div>

        {/* Main Content */}
        <VideoProcessingHub />
      </div>
    </div>
  );
} 