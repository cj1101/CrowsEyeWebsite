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
import { MediaService } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import { getFirebaseDebugInfo, testUploadPermissions } from '@/utils/firebaseDebug';
import { logDetailedFirebaseInfo } from '@/utils/firebaseTest';

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
  acceptedTypes = ['image/*', 'image/heic', 'image/heif', 'video/*', 'audio/*'],
  maxSize = 100 * 1024 * 1024, // 100MB
  multiple = true,
  className = ''
}: MediaUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const { addFiles, setUploadProgress, setIsUploading, isUploading } = useMediaStore();

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
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
    const filesWithPreview = await Promise.all(acceptedFiles.map(async (file, index) => {
      let workingFile: File = file;
      const ext = file.name.split('.').pop()?.toLowerCase();

      // If HEIC/HEIF convert for preview & upload compatibility
      if (['heic', 'heif', 'heic-sequence', 'heif-sequence'].includes(ext || '')) {
        try {
          // @ts-ignore – heic2any has no types
          const heic2any = (await import('heic2any')).default as any;
          const convertedBlob: Blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
          workingFile = new File([convertedBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
        } catch (convErr) {
          console.warn('HEIC conversion failed in MediaUpload:', convErr);
        }
      }

      const fileWithPreview = Object.assign(workingFile, {
        preview: (workingFile.type.startsWith('image/') || workingFile.type.startsWith('video/'))
          ? URL.createObjectURL(workingFile)
          : undefined,
        id: `file-${Date.now()}-${index}`,
        progress: 0
      }) as FileWithPreview;
      
      return fileWithPreview;
    }));

    setFiles(prev => [...prev, ...filesWithPreview]);
    
    // Auto-trigger upload if onUpload callback is provided
    if (onUpload && filesWithPreview.length > 0) {
      // Convert FileWithPreview back to File instances (they already are)
      const processedFiles = filesWithPreview as File[];
      onUpload(processedFiles);
      // Clear the files from our local state since parent is handling the upload
      setFiles([]);
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

  const runDebugTest = async () => {
    console.log('🔍 Running Firebase debug test...');
    
    // First, log the basic config info
    logDetailedFirebaseInfo();
    
    try {
      const debugInfo = await getFirebaseDebugInfo();
      const bucketFromEnv = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      const expectedBucket = 'crows-eye-website.firebasestorage.app';
      
      alert(`Debug Test Results:\n\nSetup Success: ${debugInfo.setup.success}\nAuth: ${debugInfo.setup.info.auth.isAuthenticated ? 'Authenticated' : 'Not authenticated'}\nStorage: ${debugInfo.setup.info.storage.isInitialized ? 'Initialized' : 'Not initialized'}\n\nBucket Configuration:\n  Environment: ${bucketFromEnv}\n  Expected: ${expectedBucket}\n  Match: ${bucketFromEnv === expectedBucket}\n\n${debugInfo.upload ? `Upload Test: ${debugInfo.upload.success ? 'SUCCESS' : 'FAILED'}\nMessage: ${debugInfo.upload.message}` : 'Upload test skipped (authentication required)'}\n\nCheck browser console for detailed logs.`);
    } catch (error) {
      console.error('Debug test failed:', error);
      alert(`Debug test failed: ${error}`);
    }
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    console.log('🚀 Starting upload of', files.length, 'files');
    setIsUploading(true);
    
    try {
      // Extra diagnostic: how many Firebase apps are initialized?
      try {
        const { getApps } = await import('firebase/app');
        const apps = getApps();
        console.log(`🔍 Firebase apps count = ${apps.length} (should be 1)`, apps.map(a => a.name));
      } catch (diagErr) {
        console.warn('⚠️ Could not inspect Firebase apps:', diagErr);
      }

      // Check authentication before attempting upload
      const user = auth.currentUser;
      if (!user) {
        console.warn('🚫 No authenticated user found at upload time – aborting');
        setErrors(prev => [...prev, 'Please sign in before uploading files.']);
        setIsUploading(false);
        return;
      }
      console.log('🔑 User authenticated – UID:', user.uid, 'Proceeding with upload');
      
      for (const file of files) {
        console.log('📤 Uploading file:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
        
        try {
          // Use Firestore MediaService for upload
          const response = await MediaService.uploadMedia(user.uid, file, {
            caption: '',
            platforms: [],
            aiTags: [
              { tag: 'uploaded', confidence: 1.0 },
              { tag: 'media', confidence: 1.0 }
            ],
            status: 'draft',
          });
          
          console.log('✅ Upload successful for', file.name, ':', response);

          // Update progress for this file
          setFiles(prev => prev.map(f =>
            f.id === file.id ? { ...f, progress: 100 } : f
          ));
        } catch (uploadError: any) {
          console.error('❌ Upload error for', file.name, ':', uploadError);
          
          // Enhanced error handling with specific error types
          if (uploadError.code === 'permission-denied') {
            throw new Error(`Permission denied. Please check your authentication and try again.`);
          } else if (uploadError.code === 'storage/unauthorized') {
            throw new Error(`Unauthorized access to storage. Please sign in again.`);
          } else if (uploadError.code === 'storage/quota-exceeded') {
            throw new Error(`Storage quota exceeded. Please free up space or upgrade your plan.`);
          } else if (uploadError.code === 'storage/invalid-format') {
            throw new Error(`File "${file.name}" has an invalid format.`);
          } else if (uploadError.code === 'storage/object-not-found') {
            throw new Error(`Upload target not found. Please try again.`);
          } else {
            const errorMsg = uploadError.message || 'Unknown error';
            throw new Error(`Upload failed for "${file.name}": ${errorMsg}`);
          }
        }
      }

      // Call onUpload callback with all successfully uploaded files if provided
      if (onUpload && files.length > 0) {
        console.log('📞 Calling onUpload callback with', files.length, 'files');
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
      console.log('🎉 All uploads completed successfully');
      
    } catch (error: any) {
      console.error('❌ Upload process failed:', error);
      setErrors(prev => [...prev, error.message]);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!file.type) {
      if (['heic', 'heif', 'heic-sequence', 'heif-sequence'].includes(extension || '')) {
        return PhotoIcon;
      }
      return DocumentIcon;
    }
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

      {/* Always Visible Debug Button */}
      <div className="flex justify-center">
        <button
          onClick={runDebugTest}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          title="Test Firebase configuration and permissions"
        >
          🔍 Test Firebase Setup
        </button>
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
              <div className="flex gap-2">
                <button
                  onClick={runDebugTest}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  title="Test Firebase configuration and permissions"
                >
                  🔍 Debug
                </button>
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