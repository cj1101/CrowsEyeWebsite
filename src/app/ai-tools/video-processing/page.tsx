'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, CogIcon } from '@heroicons/react/24/outline';

export default function VideoProcessingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
              className="border-gray-600 hover:bg-gray-800"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Video Processing Suite</h1>
              <p className="text-gray-400">Advanced video editing and processing tools</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CogIcon className="h-6 w-6 text-orange-400" />
              AI Video Processing Suite
            </CardTitle>
            <CardDescription className="text-gray-400">
              Comprehensive video processing tools powered by artificial intelligence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <CogIcon className="h-16 w-16 text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Video Processing Suite Coming Soon</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Advanced video processing capabilities will be available here. 
                Create highlights, apply effects, generate thumbnails, and optimize videos for social media.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Auto Highlights</h4>
                  <p className="text-sm text-gray-400">Generate video highlights automatically</p>
                </div>
                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Format Optimization</h4>
                  <p className="text-sm text-gray-400">Optimize for different platforms</p>
                </div>
                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Thumbnail Generation</h4>
                  <p className="text-sm text-gray-400">AI-generated custom thumbnails</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 