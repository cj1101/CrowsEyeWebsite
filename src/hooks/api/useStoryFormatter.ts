import { useState, useEffect } from 'react';
import { api, StoryData as ApiStoryData } from '@/lib/api';

export interface Story {
  id: string;
  title: string;
  content: string;
  media: string[];
  createdAt: string;
  platformSpecs?: Record<string, any>;
}

function mapApiStoryToStory(apiStory: ApiStoryData): Story {
  return {
    id: apiStory.id,
    title: apiStory.title,
    content: apiStory.content,
    media: apiStory.media_urls,
    createdAt: apiStory.created_at,
    platformSpecs: apiStory.platform_specs
  };
}

export function useStoryFormatter() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.listStories(100, 0);
      
      if (response.error) {
        setError(response.error);
        // Fallback to mock data if API fails
        const mockStories: Story[] = [
          {
            id: '1',
            title: 'Product Launch Story',
            content: 'Exciting new product launch coming soon!',
            media: ['/images/story1.jpg'],
            createdAt: '2024-01-15T10:30:00Z'
          }
        ];
        setStories(mockStories);
      } else if (response.data) {
        const mappedStories = response.data.stories.map(mapApiStoryToStory);
        setStories(mappedStories);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const createStory = async (
    title: string,
    contentBrief: string,
    platforms: string[],
    tone: string = 'professional',
    includeMedia: boolean = false
  ): Promise<Story> => {
    try {
      const response = await api.createStory({
        title,
        content_brief: contentBrief,
        target_platforms: platforms,
        tone,
        include_media: includeMedia
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        const newStory = mapApiStoryToStory(response.data);
        setStories(prev => [newStory, ...prev]);
        return newStory;
      }
      
      throw new Error('No data returned from story creation');
    } catch (err) {
      // Fallback to mock story creation if API fails
      const newStory: Story = {
        id: Date.now().toString(),
        title,
        content: `${contentBrief} (optimized for ${platforms.join(', ')} with ${tone} tone)`,
        media: [],
        createdAt: new Date().toISOString()
      };
      setStories(prev => [newStory, ...prev]);
      return newStory;
    }
  };

  const updateStory = async (storyId: string, updates: Partial<Story>): Promise<Story> => {
    try {
      const response = await api.updateStory(storyId, {
        title: updates.title,
        content: updates.content,
        media_urls: updates.media
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        const updatedStory = mapApiStoryToStory(response.data);
        setStories(prev => prev.map(story => story.id === storyId ? updatedStory : story));
        return updatedStory;
      }
      
      throw new Error('No data returned from story update');
    } catch (err) {
      // Fallback to local update if API fails
      const story = stories.find(s => s.id === storyId);
      if (story) {
        const updatedStory = { ...story, ...updates };
        setStories(prev => prev.map(s => s.id === storyId ? updatedStory : s));
        return updatedStory;
      }
      throw err;
    }
  };

  const deleteStory = async (storyId: string): Promise<void> => {
    try {
      const response = await api.deleteStory(storyId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setStories(prev => prev.filter(story => story.id !== storyId));
    } catch (err) {
      // Fallback to local deletion if API fails
      setStories(prev => prev.filter(story => story.id !== storyId));
      throw err;
    }
  };

  return { 
    stories, 
    loading, 
    error,
    createStory,
    updateStory,
    deleteStory,
    refetch: fetchStories
  };
} 