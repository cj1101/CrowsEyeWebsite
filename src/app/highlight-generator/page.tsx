/* New Highlight Generator Page without demo */
'use client';

import React from 'react';
import MediaUpload from '@/components/media/MediaUpload';
import HighlightGenerator from '@/components/ai/HighlightGenerator';

export default function HighlightGeneratorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
          AI Highlight Generator
        </h1>
        {/* Video Upload */}
        <MediaUpload acceptedTypes={["video/*"]} multiple={false} className="mb-8" />
        {/* Highlight Generator Component */}
        <HighlightGenerator />
      </div>
    </div>
  );
} 