'use client';

import { useState } from 'react';
import { useGallery } from '@/hooks/api/useGallery';
import { RectangleGroupIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function GalleriesTab() {
  const { generateGallery, loading, error } = useGallery();
  const [prompt, setPrompt] = useState('');
  const [generatedGallery, setGeneratedGallery] = useState<any>(null);

  const handleGenerateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    try {
      const result = await generateGallery(prompt.trim());
      if (result.success && result.data) {
        setGeneratedGallery(result.data);
      }
    } catch (err) {
      console.error('Failed to generate gallery:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium text-gray-900">Gallery Generator</h2>
        <p className="mt-1 text-sm text-gray-500">
          Generate curated galleries from your media library using AI prompts.
        </p>
      </div>

      {/* Gallery Generation Form */}
      <form onSubmit={handleGenerateGallery} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
            Gallery Prompt
          </label>
          <div className="mt-1">
            <textarea
              id="prompt"
              name="prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Describe the type of gallery you want to create (e.g., 'sunset photos from last vacation', 'action shots from sports events')"
              disabled={loading}
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
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
              Generate Gallery
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

      {/* Generated Gallery */}
      {generatedGallery && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Generated Gallery</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              generatedGallery.status === 'completed' 
                ? 'bg-green-100 text-green-800'
                : generatedGallery.status === 'processing'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {generatedGallery.status}
            </span>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <strong>Prompt:</strong> {generatedGallery.prompt}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Created: {new Date(generatedGallery.createdAt).toLocaleString()}
            </p>
          </div>

          {generatedGallery.mediaItems && generatedGallery.mediaItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {generatedGallery.mediaItems.map((item: any, index: number) => (
                <div key={item.id || index} className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center">
                      <RectangleGroupIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <RectangleGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                {generatedGallery.status === 'processing' 
                  ? 'Gallery is being generated...'
                  : 'No media items found for this gallery.'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!generatedGallery && !loading && (
        <div className="text-center py-12">
          <RectangleGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No gallery generated yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Enter a prompt above to generate your first AI-curated gallery.
          </p>
        </div>
      )}
    </div>
  );
} 