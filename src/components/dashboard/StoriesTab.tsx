'use client';

import { useState } from 'react';
import { useStoryFormatter } from '@/hooks/api/useStoryFormatter';
import { DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function StoriesTab() {
  const { formatStory, loading, error } = useStoryFormatter();
  const [fileId, setFileId] = useState('');
  const [caption, setCaption] = useState('');
  const [formattedStory, setFormattedStory] = useState<any>(null);

  const handleFormatStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileId.trim() || !caption.trim()) return;

    try {
      const result = await formatStory(fileId.trim(), caption.trim());
      if (result.success && result.data) {
        setFormattedStory(result.data);
      }
    } catch (err) {
      console.error('Failed to format story:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium text-gray-900">Story Formatter</h2>
        <p className="mt-1 text-sm text-gray-500">
          Transform your media files into engaging stories with AI-powered formatting.
        </p>
      </div>

      {/* Story Generation Form */}
      <form onSubmit={handleFormatStory} className="space-y-4">
        <div>
          <label htmlFor="fileId" className="block text-sm font-medium text-gray-700">
            File ID
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="fileId"
              name="fileId"
              value={fileId}
              onChange={(e) => setFileId(e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter the media file ID"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="caption" className="block text-sm font-medium text-gray-700">
            Caption
          </label>
          <div className="mt-1">
            <textarea
              id="caption"
              name="caption"
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Provide a caption or description for your story"
              disabled={loading}
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading || !fileId.trim() || !caption.trim()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Formatting...
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4 mr-2" />
              Format Story
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

      {/* Formatted Story */}
      {formattedStory && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Formatted Story</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              formattedStory.status === 'completed' 
                ? 'bg-green-100 text-green-800'
                : formattedStory.status === 'processing'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {formattedStory.status}
            </span>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">File ID:</h4>
              <p className="text-sm text-gray-600">{formattedStory.fileId}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700">Original Caption:</h4>
              <p className="text-sm text-gray-600">{formattedStory.caption}</p>
            </div>
            
            {formattedStory.content && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Formatted Content:</h4>
                <div className="mt-2 p-4 bg-gray-50 rounded-md">
                  <div className="prose prose-sm max-w-none">
                    {formattedStory.content.split('\n').map((paragraph: string, index: number) => (
                      <p key={index} className="mb-2 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              Created: {new Date(formattedStory.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!formattedStory && !loading && (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No story formatted yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Enter a file ID and caption above to format your first story.
          </p>
        </div>
      )}
    </div>
  );
} 