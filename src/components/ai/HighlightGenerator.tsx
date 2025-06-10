'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  PlayIcon,
  PauseIcon,
  ArrowDownTrayIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useMediaStore } from '@/stores/mediaStore';
import { apiService } from '@/services/api';

interface HighlightGeneratorProps {
  mediaId?: string;
  onGenerated?: (highlight: HighlightData) => void;
}

interface HighlightData {
  id: string;
  videoUrl: string;
  duration: number;
  highlights: Array<{
    startTime: number;
    endTime: number;
    description: string;
    confidence: number;
  }>;
  metadata: {
    originalDuration: number;
    compressionRatio: number;
    keyMoments: string[];
  };
}

export default function HighlightGenerator({ mediaId, onGenerated }: HighlightGeneratorProps) {
  const { files, selectedFiles } = useMediaStore();
  const [selectedMedia, setSelectedMedia] = useState<string>(mediaId || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHighlight, setGeneratedHighlight] = useState<HighlightData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState({
    duration: 30,
    style: 'dynamic',
    includeCaptions: true,
    musicTrack: 'auto',
    transitionStyle: 'smooth'
  });
  const [showSettings, setShowSettings] = useState(false);

  const availableMedia = files.filter(file => 
    file.type === 'video' || file.type === 'audio'
  );

  const selectedFile = availableMedia.find(file => file.id === selectedMedia);

  const generateHighlight = async () => {
    if (!selectedMedia) return;

    setIsGenerating(true);
    try {
      // Updated to match backend API exactly
      const response = await apiService.generateHighlights({
        media_ids: [parseInt(selectedMedia)],
        duration: settings.duration,
        highlight_type: settings.style,
        style: settings.style,
        include_text: settings.includeCaptions,
        include_music: settings.musicTrack !== 'none',
        context_padding: 2.0,
        content_instructions: 'Create an engaging highlight reel'
      });
      
      const highlightData = response.data;
      setGeneratedHighlight({
        id: highlightData.highlight_url,
        videoUrl: highlightData.highlight_url,
        duration: highlightData.duration,
        highlights: [],
        metadata: highlightData.generation_metadata || {}
      });
      
      if (onGenerated) {
        onGenerated({
          id: highlightData.highlight_url,
          videoUrl: highlightData.highlight_url,
          duration: highlightData.duration,
          highlights: [],
          metadata: highlightData.generation_metadata || {}
        });
      }
    } catch (error: any) {
      console.error('Failed to generate highlight:', error);
      
      // Handle specific error cases for long videos in beta
      const errorMessage = error.response?.data?.detail;
      let userMessage = 'Failed to generate highlight reel. Please try again.';
      
      if (typeof errorMessage === 'string') {
        if (errorMessage.includes('video duration') || errorMessage.includes('too long')) {
          userMessage = 'Long video processing is currently in beta. Please try with a shorter video or contact support for assistance.';
        } else if (errorMessage.includes('beta') || errorMessage.includes('experimental')) {
          userMessage = 'This feature is currently in beta. Some limitations may apply.';
        } else {
          userMessage = errorMessage;
        }
      } else if (Array.isArray(errorMessage)) {
        userMessage = errorMessage.map(err => err.msg || err.message || 'Validation error').join(', ');
      }
      
      alert(userMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadHighlight = () => {
    if (generatedHighlight) {
      const link = document.createElement('a');
      link.href = generatedHighlight.videoUrl;
      link.download = `highlight-${generatedHighlight.id}.mp4`;
      link.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Media Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Select Media for Highlight Generation
        </h3>
        
        {availableMedia.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <SparklesIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No video or audio files available</p>
            <p className="text-sm">Upload media files to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableMedia.map((file) => (
              <div
                key={file.id}
                onClick={() => setSelectedMedia(file.id)}
                className={`
                  relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200
                  ${selectedMedia === file.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <PlayIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {file.type} • {(file.size / (1024 * 1024)).toFixed(1)}MB
                    </p>
                  </div>
                </div>
                {selectedMedia === file.id && (
                  <div className="absolute top-2 right-2">
                    <div className="h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="h-2 w-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Highlight Settings
              </h3>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
              </button>
            </div>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Highlight Duration (seconds)
                    </label>
                    <input
                      type="range"
                      min="15"
                      max="120"
                      value={settings.duration}
                      onChange={(e) => setSettings(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>15s</span>
                      <span>{settings.duration}s</span>
                      <span>120s</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Style
                    </label>
                    <select
                      value={settings.style}
                      onChange={(e) => setSettings(prev => ({ ...prev, style: e.target.value }))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="dynamic">Dynamic</option>
                      <option value="smooth">Smooth</option>
                      <option value="energetic">Energetic</option>
                      <option value="calm">Calm</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Music Track
                    </label>
                    <select
                      value={settings.musicTrack}
                      onChange={(e) => setSettings(prev => ({ ...prev, musicTrack: e.target.value }))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="auto">Auto Select</option>
                      <option value="none">No Music</option>
                      <option value="upbeat">Upbeat</option>
                      <option value="ambient">Ambient</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="captions"
                      checked={settings.includeCaptions}
                      onChange={(e) => setSettings(prev => ({ ...prev, includeCaptions: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="captions" className="text-sm text-gray-700 dark:text-gray-300">
                      Include captions
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 flex justify-center">
              <button
                onClick={generateHighlight}
                disabled={!selectedMedia || isGenerating}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating Highlight...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5" />
                    <span>Generate AI Highlight</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Highlight Preview */}
      <AnimatePresence>
        {generatedHighlight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Generated Highlight
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                </button>
                <button
                  onClick={downloadHighlight}
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="aspect-video bg-black rounded-lg mb-4 flex items-center justify-center">
              <video
                src={generatedHighlight.videoUrl}
                controls
                className="w-full h-full rounded-lg"
                autoPlay={isPlaying}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <ClockIcon className="h-4 w-4" />
                <span>Duration: {generatedHighlight.duration}s</span>
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Compression: {(generatedHighlight.metadata.compressionRatio * 100).toFixed(1)}%
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Highlights: {generatedHighlight.highlights.length} segments
              </div>
            </div>

            {generatedHighlight.metadata.keyMoments.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Key Moments:</h4>
                <div className="flex flex-wrap gap-2">
                  {generatedHighlight.metadata.keyMoments.map((moment, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                    >
                      {moment}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 