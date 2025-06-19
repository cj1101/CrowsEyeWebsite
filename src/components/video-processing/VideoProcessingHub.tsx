'use client';

import React, { useState, useCallback, useRef } from 'react';
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
  ClockIcon,
  CpuChipIcon,
  ArrowUpTrayIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { CrowsEyeAPI, VideoProcessingOptions, ProcessingJob } from '@/services/api';

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
  const [api] = useState(() => new CrowsEyeAPI());
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
  const [customPrompt, setCustomPrompt] = useState('');
  const [longFormDuration, setLongFormDuration] = useState(180);
  const [thumbnailCount, setThumbnailCount] = useState(5);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('highlights');
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const startProcessing = async (type: 'highlight' | 'story' | 'longform' | 'thumbnail') => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      let response;

      switch (type) {
        case 'highlight':
          response = await api.generateHighlights(selectedFile.file, processingOptions);
          break;
        case 'story':
          response = await api.createStoryClips(selectedFile.file, processingOptions.targetDuration);
          break;
        case 'longform':
          response = await api.processLongForm(selectedFile.file, longFormDuration, customPrompt);
          break;
        case 'thumbnail':
          response = await api.generateThumbnails(selectedFile.file, thumbnailCount);
          break;
      }

      const newJob: ProcessingJobWithFile = {
        id: response.data.jobId,
        type,
        status: 'queued',
        progress: 0,
        inputFile: selectedFile.file.name,
        createdAt: new Date().toISOString(),
        originalFile: selectedFile,
        estimatedCompletion: response.data.estimatedCompletion
      };

      setProcessingJobs(prev => [...prev, newJob]);
      
      // Start polling for job status
      pollJobStatus(newJob.id);
      
      setError(null);
    } catch (error) {
      console.error('Processing failed:', error);
      setError('Failed to start processing. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await api.getProcessingJob(jobId);
        const jobData = response.data;
        
        setProcessingJobs(prev => prev.map(job => 
          job.id === jobId 
            ? { ...job, ...jobData }
            : job
        ));

        if (jobData.status === 'completed' || jobData.status === 'failed') {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Failed to poll job status:', error);
        clearInterval(pollInterval);
      }
    }, 2000);
  };

  const cancelJob = async (jobId: string) => {
    try {
      await api.cancelProcessingJob(jobId);
      setProcessingJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Failed to cancel job:', error);
      setError('Failed to cancel processing job');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getJobTypeIcon = (type: ProcessingJob['type']) => {
    switch (type) {
      case 'highlight': return <SparklesIcon className="h-4 w-4" />;
      case 'story': return <FilmIcon className="h-4 w-4" />;
      case 'longform': return <ClockIcon className="h-4 w-4" />;
      case 'thumbnail': return <PhotoIcon className="h-4 w-4" />;
    }
  };

  const getJobTypeLabel = (type: ProcessingJob['type']) => {
    switch (type) {
      case 'highlight': return 'Highlight Reel';
      case 'story': return 'Story Clips';
      case 'longform': return 'Long-form Edit';
      case 'thumbnail': return 'Thumbnails';
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
      {selectedFile && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Processing Options</CardTitle>
            <CardDescription className="text-gray-400">
              Selected: {selectedFile.file.name} ({formatFileSize(selectedFile.size)})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 bg-gray-700/50">
                <TabsTrigger value="highlights" className="data-[state=active]:bg-purple-600">
                  Highlights
                </TabsTrigger>
                <TabsTrigger value="stories" className="data-[state=active]:bg-purple-600">
                  Stories
                </TabsTrigger>
                <TabsTrigger value="longform" className="data-[state=active]:bg-purple-600">
                  Long-form
                </TabsTrigger>
                <TabsTrigger value="thumbnails" className="data-[state=active]:bg-purple-600">
                  Thumbnails
                </TabsTrigger>
              </TabsList>

              <TabsContent value="highlights" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Target Duration (seconds)
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
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Style
                    </label>
                    <select
                      value={processingOptions.style}
                      onChange={(e) => setProcessingOptions(prev => ({
                        ...prev,
                        style: e.target.value as VideoProcessingOptions['style']
                      }))}
                      className="w-full h-10 px-3 rounded-md bg-gray-700 border border-gray-600 text-white"
                    >
                      <option value="dynamic">Dynamic</option>
                      <option value="calm">Calm</option>
                      <option value="energetic">Energetic</option>
                      <option value="cinematic">Cinematic</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={processingOptions.includeAudio}
                      onChange={(e) => setProcessingOptions(prev => ({
                        ...prev,
                        includeAudio: e.target.checked
                      }))}
                      className="rounded border-gray-600 bg-gray-700"
                    />
                    <span className="text-sm text-gray-300">Include Audio</span>
                  </label>
                </div>
                <Button 
                  onClick={() => startProcessing('highlight')}
                  disabled={uploading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {uploading ? 'Processing...' : 'Generate Highlights'}
                </Button>
              </TabsContent>

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
                  disabled={uploading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {uploading ? 'Processing...' : 'Create Story Clips'}
                </Button>
              </TabsContent>

              <TabsContent value="longform" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Duration (seconds)
                  </label>
                  <Input
                    type="number"
                    value={longFormDuration}
                    onChange={(e) => setLongFormDuration(parseInt(e.target.value) || 180)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Custom Prompt (Optional)
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Describe what you want to focus on in the edit..."
                    className="w-full h-20 px-3 py-2 rounded-md bg-gray-700 border border-gray-600 text-white resize-none"
                  />
                </div>
                <div className="flex items-center space-x-2 text-sm text-yellow-400">
                  <CurrencyDollarIcon className="h-4 w-4" />
                  <span>Estimated cost: $2.50</span>
                </div>
                <Button 
                  onClick={() => startProcessing('longform')}
                  disabled={uploading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {uploading ? 'Processing...' : 'Process Long-form'}
                </Button>
              </TabsContent>

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
                  disabled={uploading}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {uploading ? 'Processing...' : 'Generate Thumbnails'}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

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