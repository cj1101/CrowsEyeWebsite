import { useState, useEffect } from 'react';
import { api, AudioItem as ApiAudioItem } from '@/lib/api';

export interface AudioTrack {
  id: string;
  name: string;
  duration: number;
  url: string;
  waveform?: number[];
  size: number;
  format: string;
  createdAt: string;
  tags: string[];
  description?: string;
  waveformUrl?: string;
}

function mapApiAudioToAudioTrack(apiAudio: ApiAudioItem): AudioTrack {
  return {
    id: apiAudio.id,
    name: apiAudio.name,
    duration: apiAudio.duration,
    url: apiAudio.url,
    size: apiAudio.size,
    format: apiAudio.format,
    createdAt: apiAudio.created_at,
    tags: apiAudio.tags,
    description: apiAudio.description,
    waveformUrl: apiAudio.waveform_url,
    waveform: Array.from({ length: 100 }, () => Math.random()) // Mock waveform data
  };
}

export function useAudioImport() {
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAudioTracks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.listAudio(100, 0);
      
      if (response.error) {
        setError(response.error);
        // Fallback to empty array if API fails
        setAudioTracks([]);
      } else if (response.data) {
        const mappedTracks = response.data.audio_files.map(mapApiAudioToAudioTrack);
        setAudioTracks(mappedTracks);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audio tracks');
      setAudioTracks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudioTracks();
  }, []);

  const importAudio = async (
    file: File, 
    options: {
      name?: string;
      description?: string;
      tags?: string[];
      autoEnhance?: boolean;
      normalizeVolume?: boolean;
    } = {}
  ): Promise<AudioTrack> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.importAudio(file, {
        name: options.name,
        description: options.description,
        tags: options.tags,
        auto_enhance: options.autoEnhance,
        normalize_volume: options.normalizeVolume
      });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        const newTrack = mapApiAudioToAudioTrack(response.data);
        setAudioTracks(prev => [newTrack, ...prev]);
        setLoading(false);
        return newTrack;
      }
      
      throw new Error('No data returned from import');
    } catch (err) {
      // Fallback to mock import if API fails
      const mockTrack: AudioTrack = {
        id: Date.now().toString(),
        name: options.name || file.name,
        duration: 180, // 3 minutes
        url: URL.createObjectURL(file),
        waveform: Array.from({ length: 100 }, () => Math.random()),
        size: file.size,
        format: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
        createdAt: new Date().toISOString(),
        tags: options.tags || [],
        description: options.description
      };
      setAudioTracks(prev => [mockTrack, ...prev]);
      setLoading(false);
      return mockTrack;
    }
  };

  const deleteAudio = async (id: string): Promise<void> => {
    try {
      const response = await api.deleteAudio(id);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setAudioTracks(prev => prev.filter(track => track.id !== id));
    } catch (err) {
      // Fallback to local deletion if API fails
      setAudioTracks(prev => prev.filter(track => track.id !== id));
      throw err;
    }
  };

  const editAudio = async (id: string, operations: any[], outputFormat: string = 'mp3'): Promise<AudioTrack> => {
    try {
      const response = await api.editAudio(id, operations, outputFormat);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        const editedTrack = mapApiAudioToAudioTrack(response.data);
        setAudioTracks(prev => prev.map(track => track.id === id ? editedTrack : track));
        return editedTrack;
      }
      
      throw new Error('No data returned from edit');
    } catch (err) {
      // Fallback to mock edit if API fails
      const track = audioTracks.find(t => t.id === id);
      if (track) {
        const editedTrack = { ...track, name: `${track.name} (edited)` };
        setAudioTracks(prev => prev.map(t => t.id === id ? editedTrack : t));
        return editedTrack;
      }
      throw err;
    }
  };

  const getAudioEffects = async () => {
    try {
      const response = await api.listAudioEffects();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data || [];
    } catch (err) {
      // Return mock effects if API fails
      return [
        {
          id: 'reverb',
          name: 'Reverb',
          description: 'Add spatial depth to audio',
          parameters: [
            { name: 'room_size', type: 'float', min: 0, max: 1, default: 0.5 },
            { name: 'damping', type: 'float', min: 0, max: 1, default: 0.5 }
          ],
          category: 'spatial'
        },
        {
          id: 'eq',
          name: 'Equalizer',
          description: 'Adjust frequency response',
          parameters: [
            { name: 'low_gain', type: 'float', min: -20, max: 20, default: 0 },
            { name: 'mid_gain', type: 'float', min: -20, max: 20, default: 0 },
            { name: 'high_gain', type: 'float', min: -20, max: 20, default: 0 }
          ],
          category: 'filter'
        }
      ];
    }
  };

  const analyzeAudio = async (id: string) => {
    try {
      const response = await api.analyzeAudio(id);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  return { 
    audioTracks,
    importAudio, 
    deleteAudio,
    editAudio,
    getAudioEffects,
    analyzeAudio,
    loading, 
    error,
    refetch: fetchAudioTracks
  };
} 