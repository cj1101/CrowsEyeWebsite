import { useState, useEffect } from 'react';
import { crowsEyeAPI, HighlightReel as ApiHighlightReel } from '@/lib/api';

export interface HighlightReel {
  id: string;
  title: string;
  description: string;
  clips: string[];
  duration: number;
  createdAt: string;
  thumbnailUrl?: string;
}

function mapApiHighlightToHighlightReel(apiHighlight: ApiHighlightReel): HighlightReel {
  return {
    id: apiHighlight.id,
    title: apiHighlight.title,
    description: apiHighlight.description,
    clips: apiHighlight.media_items,
    duration: apiHighlight.duration,
    createdAt: apiHighlight.created_at,
    thumbnailUrl: apiHighlight.thumbnail_url
  };
}

export function useHighlightReel() {
  const [highlights, setHighlights] = useState<HighlightReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHighlights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await crowsEyeAPI.listHighlightReels(100, 0);
      
      if (response.error) {
        setError(response.error);
        // Fallback to mock data if API fails
        const mockHighlights: HighlightReel[] = [
          {
            id: '1',
            title: 'Best Moments 2024',
            description: 'A compilation of the best moments from 2024',
            clips: ['/videos/clip1.mp4', '/videos/clip2.mp4'],
            duration: 120,
            createdAt: '2024-01-15T10:30:00Z'
          }
        ];
        setHighlights(mockHighlights);
      } else if (response.data) {
        const mappedHighlights = response.data.highlight_reels.map(mapApiHighlightToHighlightReel);
        setHighlights(mappedHighlights);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch highlight reels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, []);

  const createHighlightReel = async (
    title: string,
    description: string,
    mediaSelectionCriteria: any,
    durationPreference?: string,
    stylePreferences?: any
  ): Promise<HighlightReel> => {
    try {
      const response = await crowsEyeAPI.createHighlightReel({
        title,
        description,
        media_selection_criteria: mediaSelectionCriteria,
        duration_preference: durationPreference,
        style_preferences: stylePreferences
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        const newHighlight = mapApiHighlightToHighlightReel(response.data);
        setHighlights(prev => [newHighlight, ...prev]);
        return newHighlight;
      }
      
      throw new Error('No data returned from highlight reel creation');
    } catch (err) {
      // Fallback to mock creation if API fails
      const newHighlight: HighlightReel = {
        id: Date.now().toString(),
        title,
        description,
        clips: [],
        duration: 60,
        createdAt: new Date().toISOString()
      };
      setHighlights(prev => [newHighlight, ...prev]);
      return newHighlight;
    }
  };

  const updateHighlightReel = async (highlightId: string, updates: Partial<HighlightReel>): Promise<HighlightReel> => {
    try {
      const response = await crowsEyeAPI.updateHighlightReel(highlightId, {
        title: updates.title,
        description: updates.description,
        media_items: updates.clips,
        duration: updates.duration
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        const updatedHighlight = mapApiHighlightToHighlightReel(response.data);
        setHighlights(prev => prev.map(highlight => highlight.id === highlightId ? updatedHighlight : highlight));
        return updatedHighlight;
      }
      
      throw new Error('No data returned from highlight reel update');
    } catch (err) {
      // Fallback to local update if API fails
      const highlight = highlights.find(h => h.id === highlightId);
      if (highlight) {
        const updatedHighlight = { ...highlight, ...updates };
        setHighlights(prev => prev.map(h => h.id === highlightId ? updatedHighlight : h));
        return updatedHighlight;
      }
      throw err;
    }
  };

  const deleteHighlightReel = async (highlightId: string): Promise<void> => {
    try {
      const response = await crowsEyeAPI.deleteHighlightReel(highlightId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setHighlights(prev => prev.filter(highlight => highlight.id !== highlightId));
    } catch (err) {
      // Fallback to local deletion if API fails
      setHighlights(prev => prev.filter(highlight => highlight.id !== highlightId));
      throw err;
    }
  };

  const renderHighlightReel = async (highlightId: string, options: any = {}): Promise<string> => {
    try {
      const response = await crowsEyeAPI.renderHighlightReel(highlightId, options);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        return response.data.render_job_id;
      }
      
      throw new Error('No render job ID returned');
    } catch (err) {
      throw err;
    }
  };

  const getRenderStatus = async (jobId: string) => {
    try {
      const response = await crowsEyeAPI.getHighlightRenderStatus(jobId);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  return { 
    highlights, 
    loading, 
    error,
    createHighlightReel,
    updateHighlightReel,
    deleteHighlightReel,
    renderHighlightReel,
    getRenderStatus,
    refetch: fetchHighlights
  };
} 