'use client';

import React from 'react';
import { SparklesIcon, PhotoIcon, VideoCameraIcon, PaintBrushIcon } from '@heroicons/react/24/outline';

export default function AITools() {
  const tools = [
    {
      id: 'veo-generator',
      name: 'Veo Video Generator',
      description: 'Generate high-quality videos using Google Veo AI',
      icon: VideoCameraIcon,
      color: 'from-purple-600 to-purple-500'
    },
    {
      id: 'image-editor',
      name: 'AI Image Editor',
      description: 'Edit and enhance images with AI-powered tools',
      icon: PhotoIcon,
      color: 'from-blue-600 to-blue-500'
    },
    {
      id: 'gallery-generator',
      name: 'Smart Gallery Generator',
      description: 'Create stunning galleries with natural language prompts',
      icon: PaintBrushIcon,
      color: 'from-green-600 to-green-500'
    },
    {
      id: 'caption-generator',
      name: 'Caption Generator',
      description: 'Generate engaging captions for your posts',
      icon: SparklesIcon,
      color: 'from-orange-600 to-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">AI Tools</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map(tool => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              className="bg-gray-700/50 rounded-lg p-6 hover:bg-gray-700/70 transition-colors cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tool.color} flex items-center justify-center mb-4`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{tool.name}</h3>
              <p className="text-gray-400">{tool.description}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Recent AI Generations</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-600/50 rounded-lg">
            <SparklesIcon className="h-5 w-5 text-purple-500" />
            <span className="text-gray-300">Generated caption for "Summer Collection"</span>
            <span className="text-gray-500 text-sm ml-auto">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-600/50 rounded-lg">
            <VideoCameraIcon className="h-5 w-5 text-blue-500" />
            <span className="text-gray-300">Created video "Product Demo"</span>
            <span className="text-gray-500 text-sm ml-auto">4 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-600/50 rounded-lg">
            <PhotoIcon className="h-5 w-5 text-green-500" />
            <span className="text-gray-300">Enhanced image "Brand Logo"</span>
            <span className="text-gray-500 text-sm ml-auto">6 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
} 