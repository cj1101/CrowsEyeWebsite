import { useState, useEffect } from 'react';

export interface Story {
  id: string;
  title: string;
  content: string;
  media: string[];
  createdAt: string;
}

export function useStoryFormatter() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockStories: Story[] = [
      {
        id: '1',
        title: 'Product Launch Story',
        content: 'Exciting new product launch coming soon!',
        media: ['/images/story1.jpg'],
        createdAt: '2024-01-15T10:30:00Z'
      }
    ];

    setTimeout(() => {
      setStories(mockStories);
      setLoading(false);
    }, 350);
  }, []);

  return { stories, loading };
} 