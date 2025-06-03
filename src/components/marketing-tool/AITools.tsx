'use client';

import React, { useState } from 'react';
import { SparklesIcon, PhotoIcon, DocumentTextIcon, MicrophoneIcon } from '@heroicons/react/24/outline';

export default function AITools() {
  const [activeTab, setActiveTab] = useState('content');

  const tabs = [
    { id: 'content', name: 'Content Generation', icon: DocumentTextIcon },
    { id: 'image', name: 'Image Enhancement', icon: PhotoIcon },
    { id: 'voice', name: 'Voice & Audio', icon: MicrophoneIcon },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">AI Tools</h2>
      
      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white border-b-2 border-primary-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Content Generation */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="bg-gray-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">AI Content Generator</h3>
            <div className="space-y-4">
              <textarea
                placeholder="Describe what kind of content you want to generate..."
                className="w-full h-32 bg-gray-800 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
              <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors">
                <SparklesIcon className="h-5 w-5" />
                <span>Generate Content</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700/50 rounded-lg p-6">
              <h4 className="text-white font-semibold mb-3">Caption Templates</h4>
              <div className="space-y-2">
                {['Product Launch', 'Behind the Scenes', 'Motivational Quote', 'Tutorial'].map((template) => (
                  <button
                    key={template}
                    className="w-full text-left p-3 bg-gray-600/50 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-6">
              <h4 className="text-white font-semibold mb-3">Hashtag Generator</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter your topic..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors">
                  Generate Hashtags
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Enhancement */}
      {activeTab === 'image' && (
        <div className="space-y-6">
          <div className="bg-gray-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">AI Image Enhancement</h3>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Upload an image to enhance with AI</p>
              <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors">
                Upload Image
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Background Removal', 'Color Enhancement', 'Style Transfer'].map((feature) => (
              <div key={feature} className="bg-gray-700/50 rounded-lg p-6 text-center">
                <PhotoIcon className="h-12 w-12 text-primary-500 mx-auto mb-3" />
                <h4 className="text-white font-semibold mb-2">{feature}</h4>
                <p className="text-gray-400 text-sm">Coming soon</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voice & Audio */}
      {activeTab === 'voice' && (
        <div className="space-y-6">
          <div className="bg-gray-700/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Voice & Audio Tools</h3>
            <div className="text-center py-8 text-gray-400">
              <MicrophoneIcon className="h-16 w-16 mx-auto mb-4" />
              <p>Voice and audio tools coming soon!</p>
              <p className="text-sm mt-2">Generate voiceovers and audio content for your posts</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 