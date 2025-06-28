import { create } from 'zustand';

export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  preview?: string;
  size: number;
  uploadedAt: Date;
  tags: string[];
  aiGenerated?: boolean;
  description?: string;
}

interface MediaStore {
  files: MediaFile[];
  selectedFiles: string[];
  uploadProgress: Record<string, number>;
  isUploading: boolean;
  
  // Actions
  addFiles: (files: MediaFile[]) => void;
  removeFile: (id: string) => void;
  selectFile: (id: string) => void;
  deselectFile: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  setUploadProgress: (id: string, progress: number) => void;
  setIsUploading: (uploading: boolean) => void;
  updateFileMetadata: (id: string, metadata: Partial<MediaFile>) => void;
}

export const useMediaStore = create<MediaStore>((set, get) => ({
  files: [],
  selectedFiles: [],
  uploadProgress: {},
  isUploading: false,

  addFiles: (files) => set((state) => ({
    files: [...state.files, ...files]
  })),

  removeFile: (id) => set((state) => ({
    files: state.files.filter(file => file.id !== id),
    selectedFiles: state.selectedFiles.filter(fileId => fileId !== id)
  })),

  selectFile: (id) => set((state) => ({
    selectedFiles: [...state.selectedFiles, id]
  })),

  deselectFile: (id) => set((state) => ({
    selectedFiles: state.selectedFiles.filter(fileId => fileId !== id)
  })),

  selectAll: () => set((state) => ({
    selectedFiles: state.files.map(file => file.id)
  })),

  deselectAll: () => set({ selectedFiles: [] }),

  setUploadProgress: (id, progress) => set((state) => ({
    uploadProgress: { ...state.uploadProgress, [id]: progress }
  })),

  setIsUploading: (uploading) => set({ isUploading: uploading }),

  updateFileMetadata: (id, metadata) => set((state) => ({
    files: state.files.map(file => 
      file.id === id ? { ...file, ...metadata } : file
    )
  }))
})); 