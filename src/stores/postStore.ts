import { create } from 'zustand';

export interface SocialPost {
  id: string;
  title: string;
  content: string;
  mediaIds: string[];
  platforms: string[];
  scheduledFor?: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  aiGenerated?: boolean;
}

interface PostStore {
  posts: SocialPost[];
  selectedPosts: string[];
  isCreating: boolean;
  isScheduling: boolean;
  
  // Actions
  addPost: (post: SocialPost) => void;
  updatePost: (id: string, updates: Partial<SocialPost>) => void;
  removePost: (id: string) => void;
  selectPost: (id: string) => void;
  deselectPost: (id: string) => void;
  selectAllPosts: () => void;
  deselectAllPosts: () => void;
  setIsCreating: (creating: boolean) => void;
  setIsScheduling: (scheduling: boolean) => void;
  bulkUpdatePosts: (ids: string[], updates: Partial<SocialPost>) => void;
}

export const usePostStore = create<PostStore>((set, get) => ({
  posts: [],
  selectedPosts: [],
  isCreating: false,
  isScheduling: false,

  addPost: (post) => set((state) => ({
    posts: [...state.posts, post]
  })),

  updatePost: (id, updates) => set((state) => ({
    posts: state.posts.map(post => 
      post.id === id ? { ...post, ...updates, updatedAt: new Date() } : post
    )
  })),

  removePost: (id) => set((state) => ({
    posts: state.posts.filter(post => post.id !== id),
    selectedPosts: state.selectedPosts.filter(postId => postId !== id)
  })),

  selectPost: (id) => set((state) => ({
    selectedPosts: [...state.selectedPosts, id]
  })),

  deselectPost: (id) => set((state) => ({
    selectedPosts: state.selectedPosts.filter(postId => postId !== id)
  })),

  selectAllPosts: () => set((state) => ({
    selectedPosts: state.posts.map(post => post.id)
  })),

  deselectAllPosts: () => set({ selectedPosts: [] }),

  setIsCreating: (creating) => set({ isCreating: creating }),

  setIsScheduling: (scheduling) => set({ isScheduling: scheduling }),

  bulkUpdatePosts: (ids, updates) => set((state) => ({
    posts: state.posts.map(post => 
      ids.includes(post.id) ? { ...post, ...updates, updatedAt: new Date() } : post
    )
  }))
})); 