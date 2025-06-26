'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function PhotoGenerationPage() {
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
              <h1 className="text-3xl font-bold text-white">Photo Generation</h1>
              <p className="text-gray-400">Create stunning images with AI</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <SparklesIcon className="h-6 w-6 text-purple-400" />
              AI Photo Generation
            </CardTitle>
            <CardDescription className="text-gray-400">
              Generate high-quality images using advanced AI models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <SparklesIcon className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Photo Generation Coming Soon</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Advanced AI-powered photo generation tools will be available here. 
                Create stunning images from text descriptions, enhance existing photos, and more.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Text to Image</h4>
                  <p className="text-sm text-gray-400">Generate images from descriptions</p>
                </div>
                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Style Transfer</h4>
                  <p className="text-sm text-gray-400">Apply artistic styles to photos</p>
                </div>
                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Enhancement</h4>
                  <p className="text-sm text-gray-400">Upscale and improve quality</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 