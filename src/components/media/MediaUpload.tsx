'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudArrowUpIcon, 
  XMarkIcon, 
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { useMediaStore } from '@/stores/mediaStore';
import { apiService } from '@/services/api';

interface MediaUploadProps {
  onUpload?: (files: File[]) => void;
  acceptedTypes?: string[];
  maxSize?: number;
  multiple?: boolean;
  className?: string;
}

interface FileWithPreview extends File {
  preview?: string;
  id: string;
  progress: number;
}

export default function MediaUpload({ 
  onUpload,
  acceptedTypes = ['image/*', 'video/*', 'audio/*'],
  maxSize = 100 * 1024 * 1024, // 100MB
  multiple = true,
  className = ''
}: MediaUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const { addFiles, setUploadProgress, setIsUploading, isUploading } = useMediaStore();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    const newErrors: string[] = [];
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        if (error.code === 'file-too-large') {
          newErrors.push(`File ${file.name} is too large (max ${maxSize / (1024 * 1024)}MB)`);
        } else if (error.code === 'file-invalid-type') {
          newErrors.push(`File ${file.name} has invalid type`);
        }
      });
    });
    setErrors(newErrors);

    // Process accepted files
    const filesWithPreview = acceptedFiles.map((file, index) => {
      const fileWithPreview = Object.assign(file, {
        preview: (file.type.startsWith('image/') || file.type.startsWith('video/'))
          ? URL.createObjectURL(file)
          : undefined,
        id: `file-${Date.now()}-${index}`,
        progress: 0
      }) as FileWithPreview;
      
      return fileWithPreview;
    });

    setFiles(prev => [...prev, ...filesWithPreview]);
    
    // Auto-trigger upload if onUpload callback is provided
    if (onUpload && acceptedFiles.length > 0) {
      // Call the parent's upload handler immediately for seamless experience
      setTimeout(() => {
        onUpload(acceptedFiles);
        // Clear the files from our local state since parent is handling the upload
        setFiles([]);
      }, 100);
    }
  }, [maxSize, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Add additional metadata that the backend expects
        formData.append('title', file.name);
        formData.append('description', `Uploaded ${file.name}`);
        formData.append('tags', JSON.stringify(['uploaded', 'media']));

        try {
          const response: any = await apiService.uploadMedia(formData, (progress: number) => {
            setFiles(prev => prev.map(f =>
              f.id === file.id ? { ...f, progress } : f
            ));
          });
          
          console.log('Upload successful:', response);

          // Add uploaded media to global media store so other components can access it
          try {
            const data = response.data;
            const mediaId = data?.id || data?.media_id || `media-${Date.now()}`;
            // Determine media type based on file mime type
            let mediaType: 'image' | 'video' | 'audio' = 'image';
            if (file.type.startsWith('video/')) {
              mediaType = 'video';
            } else if (file.type.startsWith('audio/')) {
              mediaType = 'audio';
            }

            addFiles([
              {
                id: mediaId.toString(),
                name: file.name,
                type: mediaType,
                url: data?.url || data?.fileUrl || data?.downloadUrl || '',
                size: file.size,
                uploadedAt: new Date(),
                tags: data?.tags || [],
                aiGenerated: false,
                description: data?.description || undefined,
                preview: (file.type.startsWith('image/') || file.type.startsWith('video/'))
                  ? URL.createObjectURL(file)
                  : undefined,
              }
            ]);
          } catch (storeErr) {
            console.error('Failed to add uploaded media to store:', storeErr);
          }
        } catch (uploadError: any) {
          console.error('Upload error:', uploadError);
          
          // Check if it's an authentication error
          if (uploadError.response?.status === 401) {
            setErrors([`Authentication required. Please sign in to upload media.`]);
            // Don't redirect to login, just show the error
            return;
          } else if (uploadError.response?.status === 422) {
            const errorDetail = uploadError.response?.data?.detail;
            const errorMessage = Array.isArray(errorDetail) 
              ? errorDetail.map(err => err.msg || err.message || 'Validation error').join(', ')
              : typeof errorDetail === 'string' 
                ? errorDetail 
                : 'Upload validation failed';
            setErrors([`Upload validation error: ${errorMessage}`]);
            return;
          } else {
            setErrors([`Upload failed for ${file.name}: ${uploadError.message}`]);
          }
        }
      }

      // Call onUpload callback with all successfully uploaded files if provided
      if (onUpload && files.length > 0) {
        // Convert FileWithPreview back to File array
        const fileArray = files.map(f => {
          const { preview, id, progress, ...fileProps } = f;
          return new File([f], f.name, { type: f.type, lastModified: f.lastModified });
        });
        onUpload(fileArray);
      }
      
      // Clear files after successful upload
      setFiles([]);
      setErrors([]);
    } catch (error: any) {
      console.error('General upload error:', error);
      setErrors([`Upload failed: ${error.message || 'Unknown error'}`]);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (!file.type) return DocumentIcon;
    if (file.type.startsWith('image/')) return PhotoIcon;
    if (file.type.startsWith('video/')) return VideoCameraIcon;
    if (file.type.startsWith('audio/')) return MusicalNoteIcon;
    return DocumentIcon;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /* Auto-upload when only a single file is allowed */
  useEffect(() => {
    if (!multiple && files.length > 0 && !isUploading) {
      uploadFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }
        `}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={{ scale: isDragActive ? 1.05 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {isDragActive ? 'Drop files here' : 'Upload media files'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Drag and drop files here, or click to select
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Supports images, videos, and audio files up to {maxSize / (1024 * 1024)}MB
          </div>
        </motion.div>
      </div>

      {/* Errors */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <div className="text-red-800 dark:text-red-400 text-sm space-y-1">
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Preview */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Files to Upload ({files.length})
              </h3>
              {multiple && (
                <button
                  onClick={uploadFiles}
                  disabled={files.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Upload All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => {
                const FileIcon = getFileIcon(file);
                
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                  >
                    <button
                      onClick={() => removeFile(file.id)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>

                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="h-12 w-12 object-cover rounded"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                            <FileIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {file.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)}
                        </div>
                        
                        {file.progress > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                              <span>Uploading...</span>
                              <span>{file.progress}%</span>
                            </div>
                            <div className="mt-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                              <div
                                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 