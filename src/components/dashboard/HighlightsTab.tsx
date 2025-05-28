'use client';

import { useState } from 'react';
import { useHighlightReel } from '@/hooks/api/useHighlightReel';
import { VideoCameraIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function HighlightsTab() {
  const { generateHighlightReel, loading, error } = useHighlightReel();
  const [videoId, setVideoId] = useState('');
  const [options, setOptions] = useState({
    duration: 30,
    style: 'dynamic',
    includeAudio: true,
  });
  const [generatedReel, setGeneratedReel] = useState<any>(null);

  const handleGenerateReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoId.trim()) return;

    try {
      const result = await generateHighlightReel(videoId.trim(), options);
      if (result.success && result.data) {
        setGeneratedReel(result.data);
      }
    } catch (err) {
      console.error('Failed to generate highlight reel:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium text-gray-900">Highlight Reel Generator</h2>
        <p className="mt-1 text-sm text-gray-500">
          Create engaging highlight reels from your video content using AI.
        </p>
        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Creator+ Feature
        </div>
      </div>

      {/* Highlight Generation Form */}
      <form onSubmit={handleGenerateReel} className="space-y-4">
        <div>
          <label htmlFor="videoId" className="block text-sm font-medium text-gray-700">
            Video ID
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="videoId"
              name="videoId"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter the video file ID"
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
              Duration (seconds)
            </label>
            <div className="mt-1">
              <select
                id="duration"
                name="duration"
                value={options.duration}
                onChange={(e) => setOptions({ ...options, duration: parseInt(e.target.value) })}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                disabled={loading}
              >
                <option value={15}>15 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={60}>1 minute</option>
                <option value={120}>2 minutes</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="style" className="block text-sm font-medium text-gray-700">
              Style
            </label>
            <div className="mt-1">
              <select
                id="style"
                name="style"
                value={options.style}
                onChange={(e) => setOptions({ ...options, style: e.target.value })}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                disabled={loading}
              >
                <option value="dynamic">Dynamic</option>
                <option value="smooth">Smooth</option>
                <option value="energetic">Energetic</option>
                <option value="cinematic">Cinematic</option>
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <div className="flex items-center h-5">
              <input
                id="includeAudio"
                name="includeAudio"
                type="checkbox"
                checked={options.includeAudio}
                onChange={(e) => setOptions({ ...options, includeAudio: e.target.checked })}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                disabled={loading}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="includeAudio" className="font-medium text-gray-700">
                Include Audio
              </label>
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading || !videoId.trim()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4 mr-2" />
              Generate Highlight Reel
            </>
          )}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">Error: {error}</p>
        </div>
      )}

      {/* Generated Highlight Reel */}
      {generatedReel && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Generated Highlight Reel</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              generatedReel.status === 'completed' 
                ? 'bg-green-100 text-green-800'
                : generatedReel.status === 'processing'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {generatedReel.status}
            </span>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Video ID:</h4>
              <p className="text-sm text-gray-600">{generatedReel.videoId}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700">Options:</h4>
              <div className="text-sm text-gray-600">
                <p>Duration: {generatedReel.options.duration} seconds</p>
                <p>Style: {generatedReel.options.style}</p>
                <p>Audio: {generatedReel.options.includeAudio ? 'Included' : 'Excluded'}</p>
              </div>
            </div>
            
            {generatedReel.outputUrl && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Output:</h4>
                <div className="mt-2">
                  <video
                    controls
                    className="w-full max-w-md rounded-lg"
                    src={generatedReel.outputUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="mt-2">
                    <a
                      href={generatedReel.outputUrl}
                      download
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Download Highlight Reel
                    </a>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              Created: {new Date(generatedReel.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!generatedReel && !loading && (
        <div className="text-center py-12">
          <VideoCameraIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No highlight reel generated yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Enter a video ID and configure options above to generate your first highlight reel.
          </p>
        </div>
      )}
    </div>
  );
} 