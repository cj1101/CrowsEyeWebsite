'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDropzone } from 'react-dropzone';
import { 
  FilmIcon, 
  SparklesIcon, 
  PhotoIcon,
  CpuChipIcon,
  ArrowUpTrayIcon,
  PlayIcon,
  StopIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { VideoProcessingOptions, ProcessingJob } from '@/services/api';

interface VideoFile {
  file: File;
  preview: string;
  duration?: number;
  size: number;
}

interface ProcessingJobWithFile extends ProcessingJob {
  originalFile: VideoFile;
  downloadUrl?: string;
}

export default function VideoProcessingHub() {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<VideoFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<VideoFile | null>(null);
  const [processingJobs, setProcessingJobs] = useState<ProcessingJobWithFile[]>([]);
  const [processingOptions, setProcessingOptions] = useState<VideoProcessingOptions>({
    targetDuration: 60,
    style: 'dynamic',
    includeAudio: true,
    outputFormat: 'mp4',
    quality: 'high'
  });
  const [thumbnailCount, setThumbnailCount] = useState(5);
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('stories');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm']
    },
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB
    onDrop: useCallback((acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        size: file.size
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
      if (!selectedFile && newFiles.length > 0) {
        setSelectedFile(newFiles[0]);
      }
    }, [selectedFile]),
    onDropRejected: (fileRejections) => {
      const errors = fileRejections.map(rejection => 
        rejection.errors.map(error => error.message).join(', ')
      ).join('; ');
      setError(`File upload rejected: ${errors}`);
    }
  });

  const removeFile = (fileToRemove: VideoFile) => {
    setUploadedFiles(prev => prev.filter(f => f !== fileToRemove));
    URL.revokeObjectURL(fileToRemove.preview);
    if (selectedFile === fileToRemove) {
      setSelectedFile(uploadedFiles.find(f => f !== fileToRemove) || null);
    }
  };

  const startProcessing = async (type: 'story' | 'thumbnail' | 'format') => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      // Local stub - no cloud upload. Generate a mock job response
      const response = {
        data: {
          jobId: `${type}-job-${Date.now()}`,
          estimatedCompletion: new Date(Date.now() + 60000).toISOString()
        }
      } as any;

      const newJob: ProcessingJobWithFile = {
        id: response.data.jobId,
        type: type as any,
        status: 'queued',
        progress: 0,
        inputFile: selectedFile.file.name,
        createdAt: new Date().toISOString(),
        originalFile: selectedFile,
        estimatedCompletion: response.data.estimatedCompletion
      };

      setProcessingJobs(prev => [...prev, newJob]);
      
      // No polling needed for local stub – mark job as completed instantly
      setProcessingJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, status: 'completed', progress: 100 } : j));
      
      setError(null);
    } catch (error) {
      console.error('Processing failed:', error);
      setError('Failed to start processing. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const cancelJob = async (jobId: string) => {
    // Local stub – simply remove job from list
    setProcessingJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getJobTypeIcon = (type: string) => {
    switch (type) {
      case 'highlight': return <SparklesIcon className="h-4 w-4" />;
      case 'story': return <FilmIcon className="h-4 w-4" />;
      case 'thumbnail': return <PhotoIcon className="h-4 w-4" />;
      case 'format': return <CpuChipIcon className="h-4 w-4" />;
      default: return <CpuChipIcon className="h-4 w-4" />;
    }
  };

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case 'highlight': return 'Highlight Reel';
      case 'story': return 'Story Clips';
      case 'thumbnail': return 'Thumbnails';
      case 'format': return 'Format Optimization';
      default: return 'Processing';
    }
  };

  const getStatusColor = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'queued': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <CpuChipIcon className="h-6 w-6 text-purple-400" />
            AI Video Processing Hub
          </CardTitle>
          <CardDescription className="text-gray-400">
            Upload videos and transform them with AI-powered processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadedFiles.length === 0 ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <input {...getInputProps()} />
              <ArrowUpTrayIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-purple-400">Drop the video files here...</p>
              ) : (
                <div>
                  <p className="text-gray-300 mb-2">Drag & drop video files here, or click to select</p>
                  <p className="text-sm text-gray-500">
                    Supports MP4, MOV, AVI, MKV, WebM (max 2GB per file)
                  </p>
                </div>
              )}
            </div>
          ) : (
            selectedFile && (
              <video
                src={selectedFile.preview}
                className="w-full rounded-lg"
                autoPlay
                muted
                loop
                controls
              />
            )
          )}

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-white mb-3">Uploaded Files</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedFiles.map((file, index) => (
                  <div 
                    key={index}
                    className={`relative p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedFile === file 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedFile(file)}
                  >
                    <div className="aspect-video bg-gray-700 rounded mb-2 flex items-center justify-center overflow-hidden">
                      <video
                        src={file.preview}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <PlayIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="text-sm text-white truncate">{file.file.name}</div>
                    <div className="text-xs text-gray-400">{formatFileSize(file.size)}</div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file);
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                    >
                      <XMarkIcon className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Options */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Processing Options</CardTitle>
          <CardDescription className="text-gray-400">
            {selectedFile ? (
              <>Selected: {selectedFile.file.name} ({formatFileSize(selectedFile.size)})</>
            ) : (
              'Upload a video to enable processing actions'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-gray-700/50">
              <TabsTrigger value="stories" className="data-[state=active]:bg-purple-600">
                Stories
              </TabsTrigger>
              <TabsTrigger value="thumbnails" className="data-[state=active]:bg-purple-600">
                Thumbnails
              </TabsTrigger>
              <TabsTrigger value="format" className="data-[state=active]:bg-purple-600">
                Format
              </TabsTrigger>
            </TabsList>

            {/* AI Highlight Generator - Redirect to dedicated page */}
            <div className="mb-6 p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">AI Highlight Generator</h3>
                  <p className="text-sm text-gray-300">
                    Advanced multi-stage analysis with cost optimization and guaranteed results
                  </p>
                </div>
                <Button 
                  onClick={() => router.push('/demo/highlight-generator')}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white flex items-center gap-2"
                >
                  <SparklesIcon className="h-5 w-5" />
                  Open Generator
                </Button>
              </div>
            </div>

            {/* Stories */}
            <TabsContent value="stories" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Duration per Clip (seconds)
                </label>
                <Input
                  type="number"
                  value={processingOptions.targetDuration}
                  onChange={(e) => setProcessingOptions(prev => ({
                    ...prev,
                    targetDuration: parseInt(e.target.value) || 60
                  }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 15-60 seconds for social media
                </p>
              </div>
              <Button 
                onClick={() => startProcessing('story')}
                disabled={uploading || !selectedFile}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {uploading ? 'Processing...' : 'Create Story Clips'}
              </Button>
            </TabsContent>

            {/* Thumbnails */}
            <TabsContent value="thumbnails" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Number of Thumbnails
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={thumbnailCount}
                  onChange={(e) => setThumbnailCount(parseInt(e.target.value) || 5)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <Button 
                onClick={() => startProcessing('thumbnail')}
                disabled={uploading || !selectedFile}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {uploading ? 'Processing...' : 'Generate Thumbnails'}
              </Button>
            </TabsContent>

            {/* Format */}
            <TabsContent value="format" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Aspect Ratio
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-gray-700 border border-gray-600 text-white"
                  >
                    <option value="16:9">Horizontal (16:9)</option>
                    <option value="9:16">Vertical (9:16)</option>
                    <option value="1:1">Square (1:1)</option>
                    <option value="4:5">Portrait (4:5)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Output Format
                  </label>
                  <select
                    value={processingOptions.outputFormat}
                    onChange={(e) => setProcessingOptions(prev => ({
                      ...prev,
                      outputFormat: e.target.value as VideoProcessingOptions['outputFormat']
                    }))}
                    className="w-full h-10 px-3 rounded-md bg-gray-700 border border-gray-600 text-white"
                  >
                    <option value="mp4">MP4</option>
                    <option value="webm">WebM</option>
                    <option value="gif">GIF</option>
                  </select>
                </div>
              </div>
              <Button 
                onClick={() => startProcessing('format')}
                disabled={uploading || !selectedFile}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                {uploading ? 'Processing...' : 'Optimize Format'}
              </Button>
            </TabsContent>

            {/* Full Suite Button */}
            <div className="pt-4">
              <Button
                onClick={() => {
                  ['story', 'thumbnail', 'format'].forEach(type => startProcessing(type as any));
                }}
                disabled={uploading || !selectedFile}
                variant="outline"
                className="w-full border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
              >
                Run Full Suite
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Processing Jobs */}
      {processingJobs.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ChartBarIcon className="h-6 w-6 text-blue-400" />
              Processing Jobs
            </CardTitle>
            <CardDescription className="text-gray-400">
              Track your video processing tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processingJobs.map((job) => (
                <div key={job.id} className="p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getJobTypeIcon(job.type)}
                      <span className="font-medium text-white">
                        {getJobTypeLabel(job.type)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {job.inputFile}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(job.status)}`} />
                      <span className="text-sm text-gray-400 capitalize">
                        {job.status}
                      </span>
                      {job.status === 'processing' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => cancelJob(job.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <StopIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {job.status === 'processing' && (
                    <div className="mb-2">
                      <Progress value={job.progress} className="w-full" />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{job.progress}% complete</span>
                        {job.estimatedCompletion && (
                          <span>ETA: {new Date(job.estimatedCompletion).toLocaleTimeString()}</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {job.status === 'completed' && job.outputFile && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-green-400">
                        Output: {job.outputFile}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}
                  
                  {job.status === 'failed' && job.error && (
                    <div className="text-sm text-red-400 mt-2">
                      Error: {job.error}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-1">
                    Started: {new Date(job.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XMarkIcon className="h-5 w-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 