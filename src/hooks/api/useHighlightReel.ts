import { useState, useEffect } from 'react';

export interface HighlightReel {
  id: string;
  title: string;
  clips: string[];
  duration: number;
  createdAt: string;
}

export function useHighlightReel() {
  const [highlights, setHighlights] = useState<HighlightReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const mockHighlights: HighlightReel[] = [
      {
        id: '1',
        title: 'Best Moments 2024',
        clips: ['/videos/clip1.mp4', '/videos/clip2.mp4'],
        duration: 120,
        createdAt: '2024-01-15T10:30:00Z'
      }
    ];

    setTimeout(() => {
      setHighlights(mockHighlights);
      setLoading(false);
    }, 300);
  }, []);

  return { highlights, loading, error };
} 