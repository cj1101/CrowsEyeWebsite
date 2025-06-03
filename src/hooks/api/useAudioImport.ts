import { useState } from 'react';

export interface AudioTrack {
  id: string;
  name: string;
  duration: number;
  url: string;
  waveform?: number[];
}

export function useAudioImport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importAudio = async (file: File): Promise<AudioTrack> => {
    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      setTimeout(() => {
        const mockTrack: AudioTrack = {
          id: Date.now().toString(),
          name: file.name,
          duration: 180, // 3 minutes
          url: URL.createObjectURL(file),
          waveform: Array.from({ length: 100 }, () => Math.random())
        };
        setLoading(false);
        resolve(mockTrack);
      }, 1000);
    });
  };

  return { importAudio, loading, error };
} 