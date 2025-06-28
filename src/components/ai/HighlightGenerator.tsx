'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  PlayIcon,
  PauseIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  LightBulbIcon,
  VideoCameraIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';
import { useMediaStore } from '@/stores/mediaStore';
import { apiService } from '@/services/api';

interface HighlightGeneratorProps {
  mediaId?: string;
  onGenerated?: (highlight: HighlightData) => void;
}

interface HighlightData {
  id: string;
  videoUrl: string;
  duration: number;
  highlights: Array<{
    startTime: number;
    endTime: number;
    description: string;
    confidence: number;
    score: number;
  }>;
  metadata: {
    originalDuration?: number;
    compressionRatio?: number;
    keyMoments?: string[];
    processing_time_ms?: number;
    ai_calls_made?: number;
    estimated_cost?: number;
    compression_ratio?: number;
    confidence_score?: number;
    algorithm_stages?: Array<{
      name: string;
      cost: number;
      segments: any[];
    }>;
    fallback_used?: boolean;
    style_applied?: string;
    cost_optimized?: boolean;
  };
}

// Mad-lib style prompt examples to showcase the tool
const promptExamples = [
  "Find every time someone scores in the video",
  "Show me the most exciting moments",
  "Highlight when the action gets intense",
  "Capture all the funny scenes",
  "Find moments with high energy",
  "Show me when people are celebrating",
  "Highlight the best parts of the game",
  "Find every amazing reaction",
  "Show me when someone says something important",
  "Capture all the athletic movements",
  "Find the most emotional expressions",
  "Show me when the crowd cheers",
  "Highlight every skillful move",
  "Find moments of pure joy",
  "Show me the victory celebration",
  "Capture when things get dramatic",
  "Find every impressive technique",
  "Show me the standout performance",
  "Highlight moments of teamwork",
  "Find when someone laughs or smiles"
];

// Simple local file upload component
const LocalVideoUpload = ({ onFileSelect }: { onFileSelect: (file: File) => void }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
      <input
        type="file"
        accept="video/*,audio/*"
        onChange={handleFileChange}
        className="hidden"
        id="video-upload"
      />
      <label 
        htmlFor="video-upload"
        className="cursor-pointer flex flex-col items-center space-y-2"
      >
        <VideoCameraIcon className="h-12 w-12 text-gray-400" />
        <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Click to upload video
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Supports MP4, MOV, WebM and other video formats
        </span>
      </label>
    </div>
  );
};

export default function HighlightGenerator({ mediaId, onGenerated }: HighlightGeneratorProps) {
  const { files, addFiles } = useMediaStore();
  const [selectedMedia, setSelectedMedia] = useState<string>(mediaId || '');
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHighlight, setGeneratedHighlight] = useState<HighlightData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState({
    duration: 30,
    includeCaptions: true,
    prompt: '',
    exampleTime: '',
    autoSceneCount: true,
    sceneCount: 6
  });
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const availableMedia = files.filter(file => 
    file.type === 'video' || file.type === 'audio'
  );

  const selectedFile = availableMedia.find(file => file.id === selectedMedia);

  const generateHighlight = async () => {
    if (!selectedMedia) return;
    if (!sourceFile) {
      alert('Please upload a video first.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Prepare payload for internal highlight generation API (local route)
      const payload = {
        media_ids: [1], // Dummy ID
        duration: settings.duration,
        video_duration: videoDuration || undefined,
        highlight_type: 'dynamic',
        style: 'cinematic',
        include_text: settings.includeCaptions,
        include_music: false,
        content_instructions: settings.prompt,
        scene_count: settings.autoSceneCount ? undefined : settings.sceneCount,
        example: settings.exampleTime ? { start_time: Number(settings.exampleTime) } : undefined,
        cost_optimize: true,
        max_cost: 1.0,
      } as any;

      const res = await fetch('/api/ai/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Highlight API returned status ${res.status}`);
      const data = await res.json();

      if (!data || !data.success) throw new Error('Invalid response from highlight API');

      const highlightData: HighlightData = {
        id: `highlight-${Date.now()}`,
        videoUrl: data.highlight_url || selectedFile?.url || selectedFile?.preview || '',
        duration: data.duration,
        highlights: (data.segments || []).map((seg: any) => ({
          startTime: seg.startTime,
          endTime: seg.endTime,
          description: seg.description || 'Detected highlight',
          confidence: seg.confidence ?? 0.8,
          score: seg.score ?? 0.8,
        })),
        metadata: data.generation_metadata || {},
      };

      // Show placeholder highlight immediately and begin FFmpeg processing in the background.
      setGeneratedHighlight(highlightData);

      // Build the actual highlight video client-side with FFmpeg using returned segments
      (async () => {
        try {
          setIsProcessingVideo(true);
          // Dynamically import FFmpeg WASM (v0.12+) and build reel in-browser
          // @ts-ignore – No type defs shipped yet
          const { FFmpeg } = await import('@ffmpeg/ffmpeg');

          const ffmpeg = new FFmpeg();
          // Let the library/bundler handle worker & core URLs automatically.
          // This avoids CORS entirely because webpack/SWC will inline the worker
          // as a same-origin blob during the build.
          await ffmpeg.load();

          // Write the full source video into the virtual FS
          const srcBuffer = new Uint8Array(await sourceFile.arrayBuffer());
          await ffmpeg.writeFile('input.mp4', srcBuffer);

          const segmentFiles: string[] = [];
          for (let i = 0; i < highlightData.highlights.length; i++) {
            const seg = highlightData.highlights[i];
            const outName = `seg_${i}.mp4`;
            const segStart = seg.startTime.toString();
            const segDuration = (seg.endTime - seg.startTime).toString();

            // Execute ffmpeg to trim the segment (copy codec to keep it fast)
            await ffmpeg.exec(['-ss', segStart, '-i', 'input.mp4', '-t', segDuration, '-c', 'copy', outName]);
            segmentFiles.push(outName);
          }

          // Build concat list
          const listFileContent = segmentFiles.map(f => `file '${f}'`).join('\n');
          await ffmpeg.writeFile('list.txt', new TextEncoder().encode(listFileContent));

          // Concatenate all segments into final output
          await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'output.mp4']);

          const outputData = (await ffmpeg.readFile('output.mp4')) as Uint8Array;
          const highlightBlob = new Blob([outputData], { type: 'video/mp4' });
          highlightData.videoUrl = URL.createObjectURL(highlightBlob);
        } catch (ffErr) {
          console.error('FFmpeg highlight build failed:', ffErr);
        } finally {
          setIsProcessingVideo(false);
          // ensure re-render with updated highlight if videoUrl got replaced
          setGeneratedHighlight(prev => prev ? { ...prev } : null);
        }
      })();

      setIsPlaying(true);
      if (onGenerated) onGenerated(highlightData);
      console.log('🎬 Highlight generated successfully');
    } catch (error: any) {
      console.error('Failed to generate highlight:', error);
      alert('Failed to generate highlight reel. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate mock segments based on user prompt and settings
  const generateMockSegments = (prompt: string, duration: number, sceneCount: number) => {
    const numberOfSegments = settings.autoSceneCount ? Math.floor(Math.random() * 5) + 3 : sceneCount;
    const segments = [];
    
    // Analyze prompt to create contextual descriptions
    const promptLower = prompt.toLowerCase();
    const segmentDuration = Math.floor(duration / numberOfSegments);
    
    for (let i = 0; i < numberOfSegments; i++) {
      const startTime = i * segmentDuration + Math.floor(Math.random() * 5);
      const endTime = Math.min(startTime + segmentDuration - Math.floor(Math.random() * 3), duration);
      
      let description = '';
      if (promptLower.includes('score') || promptLower.includes('goal')) {
        description = `Scoring opportunity at ${startTime}s - high energy moment detected`;
      } else if (promptLower.includes('exciting') || promptLower.includes('intense')) {
        description = `Peak excitement detected - elevated motion and engagement`;
      } else if (promptLower.includes('funny') || promptLower.includes('laugh')) {
        description = `Humorous moment identified - positive emotional response likely`;
      } else if (promptLower.includes('celebration') || promptLower.includes('victory')) {
        description = `Celebration sequence - group excitement and movement`;
      } else if (promptLower.includes('reaction') || promptLower.includes('expression')) {
        description = `Strong emotional reaction - facial expression analysis`;
      } else if (promptLower.includes('skill') || promptLower.includes('technique')) {
        description = `Technical skill demonstration - precision movement detected`;
      } else if (promptLower.includes('action') || promptLower.includes('movement')) {
        description = `High-action sequence - dynamic motion patterns`;
      } else {
        description = `Engaging content segment - multi-factor interest score`;
      }
      
      segments.push({
        startTime,
        endTime,
        description,
        confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
        score: Math.random() * 0.4 + 0.6 // 60-100% score
      });
    }
    
    return segments;
  };

  const downloadHighlight = () => {
    if (generatedHighlight) {
      const link = document.createElement('a');
      link.href = generatedHighlight.videoUrl;
      link.download = `highlight-${generatedHighlight.id}.mp4`;
      link.click();
    }
  };

  // Upload generated highlight to the user's cloud library
  const addToLibrary = async () => {
    if (!generatedHighlight) return;

    try {
      setIsProcessingVideo(true);

      // Fetch the blob behind the object URL (it might already be a CDN URL)
      const response = await fetch(generatedHighlight.videoUrl);
      const blob = await response.blob();
      const file = new File([blob], `highlight-${generatedHighlight.id}.mp4`, { type: 'video/mp4' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('tags', JSON.stringify(['highlight_reel']));

      await apiService.uploadMedia(formData);

      alert('Highlight added to your library!');
    } catch (err) {
      console.error('Failed to add highlight to library', err);
      alert('Failed to add highlight to library. Please try again.');
    } finally {
      setIsProcessingVideo(false);
    }
  };

  /* Automatically select the only available media (if any) or newest upload */
  useEffect(() => {
    if (!selectedMedia && availableMedia.length === 1) {
      setSelectedMedia(availableMedia[0].id);
    } else if (availableMedia.length > 0 && !selectedMedia) {
      // Select the most recently uploaded file
      const newestFile = availableMedia.reduce((latest, current) => 
        (current.uploadedAt && latest.uploadedAt && current.uploadedAt > latest.uploadedAt) ? current : latest
      );
      setSelectedMedia(newestFile.id);
    }
  }, [availableMedia, selectedMedia]);

  // Helper converters for mm:ss
  const secondsToMMSS = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const mmssToSeconds = (val: string): number | null => {
    const parts = val.split(':');
    if (parts.length !== 2) return null;
    const m = parseInt(parts[0]);
    const s = parseInt(parts[1]);
    if (isNaN(m) || isNaN(s) || s > 59 || s < 0) return null;
    return m * 60 + s;
  };

  return (
    <div className="space-y-6">
      {/* Video Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Upload Video
        </h3>
        <LocalVideoUpload 
          onFileSelect={(file: File) => {
            const fileId = `local-${Date.now()}`;
            const previewUrl = URL.createObjectURL(file);
            
            // Add to media store locally without API call
            addFiles([{
              id: fileId,
              name: file.name,
              type: file.type.startsWith('video/') ? 'video' : 'audio',
              url: previewUrl,
              preview: previewUrl,
              size: file.size,
              uploadedAt: new Date(),
              tags: ['local'],
              aiGenerated: false,
              description: `Local file: ${file.name}`
            }]);
            
            // Attempt to upload to backend so we have a permanent media ID (non-blocking)
            (async () => {
              // Store the raw File locally so we can build the highlight later
              setSourceFile(file);

              // Attempt to upload to backend so we have a permanent media ID (non-blocking)
              try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('tags', JSON.stringify(['highlight_upload']));
                const uploadRes: any = await apiService.uploadMedia(formData);
                const mediaIdFromBackend = uploadRes?.data?.id || uploadRes?.data?.media_id;
                if (mediaIdFromBackend) {
                  // Replace dummy id so the highlight API can reference the uploaded media
                  setSelectedMedia(mediaIdFromBackend.toString());
                } else {
                  setSelectedMedia(fileId); // fallback
                }
              } catch (uploadErr) {
                console.warn('Media upload failed, continuing with local file only', uploadErr);
                setSelectedMedia(fileId);
              }
            })();
          }}
        />
      </div>

      {/* Media Selection and Preview */}
      {availableMedia.length > 0 && (
        <>
          {/* Media Selection Dropdown */}
          {availableMedia.length > 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Video
              </label>
              <select
                value={selectedMedia}
                onChange={(e) => setSelectedMedia(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Choose a video...</option>
                {availableMedia.map((file) => (
                  <option key={file.id} value={file.id}>
                    {file.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Selected media preview */}
          {selectedFile && (
            <div className="rounded-lg overflow-hidden bg-black aspect-video w-full">
              <video
                src={selectedFile.url || selectedFile.preview || ''}
                autoPlay
                muted
                controls
                onLoadedMetadata={(e) => {
                  const dur = (e.currentTarget as HTMLVideoElement).duration;
                  if (!isNaN(dur)) setVideoDuration(Math.floor(dur));
                }}
                className="w-full h-full object-contain"
                playsInline
              />
            </div>
          )}

          {/* Prompt Examples Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-2 mb-4">
              <LightBulbIcon className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Try These Ideas
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Click any example below to see what our AI can find in your video:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {promptExamples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setSettings(prev => ({ ...prev, prompt: example }))}
                  className="text-left p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm transition-all duration-200 text-sm"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Settings Panel - Always Visible */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Highlight Settings
        </h3>

        {availableMedia.length === 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Upload a video above to configure highlight settings
            </p>
          </div>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${availableMedia.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Highlight Duration (mm:ss)
            </label>
            <input
              type="range"
              min="10"
              max="1800"
              value={settings.duration}
              onChange={(e) => setSettings(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>{secondsToMMSS(10)}</span>
              <span>{secondsToMMSS(settings.duration)}</span>
              <span>{secondsToMMSS(1800)}</span>
            </div>
            <input
              type="text"
              value={secondsToMMSS(settings.duration)}
              onChange={(e) => {
                const secs = mmssToSeconds(e.target.value);
                if (secs !== null && secs >= 10 && secs <= 1800) {
                  setSettings(prev => ({ ...prev, duration: secs }));
                }
              }}
              placeholder="mm:ss"
              className="mt-2 w-24 p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-center"
            />
          </div>

          <div className="flex items-center space-x-2 md:col-span-2">
            <input
              type="checkbox"
              id="captions"
              checked={settings.includeCaptions}
              onChange={(e) => setSettings(prev => ({ ...prev, includeCaptions: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="captions" className="text-sm text-gray-700 dark:text-gray-300">
              Include captions (auto-generated)
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What should we look for in the video?
            </label>
            <textarea
              value={settings.prompt}
              onChange={(e) => setSettings(prev => ({ ...prev, prompt: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder='e.g., "Show me every time someone scores" or "Find the most exciting moments"'
              rows={3}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Example time when this happens (in seconds)
            </label>
            <input
              type="number"
              min="0"
              value={settings.exampleTime}
              onChange={(e) => setSettings(prev => ({ ...prev, exampleTime: e.target.value }))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="e.g., 42"
            />
          </div>

          {/* Scene count selector */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of scenes
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                id="autoSceneCount"
                checked={settings.autoSceneCount}
                onChange={(e) => setSettings(prev => ({ ...prev, autoSceneCount: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="autoSceneCount" className="text-sm text-gray-700 dark:text-gray-300">
                Auto-select
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={settings.sceneCount}
                onChange={(e) => setSettings(prev => ({ ...prev, sceneCount: parseInt(e.target.value) }))}
                className="flex-1"
                disabled={settings.autoSceneCount}
              />
              <span className="w-8 text-center text-gray-600 dark:text-gray-400">
                {settings.sceneCount}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={generateHighlight}
            disabled={!selectedMedia || isGenerating}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating Highlight...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5" />
                <span>Generate AI Highlight</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Generated Highlight Preview */}
      <AnimatePresence>
        {generatedHighlight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Generated Highlight
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                </button>
                <button
                  onClick={downloadHighlight}
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={addToLibrary}
                  className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <PlusCircleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="aspect-video bg-black rounded-lg mb-4 flex items-center justify-center">
              <video
                src={generatedHighlight.videoUrl}
                controls
                className="w-full h-full rounded-lg"
                ref={videoRef}
                autoPlay={isPlaying}
                muted
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <ClockIcon className="h-4 w-4" />
                <span>Duration: {generatedHighlight.duration}s</span>
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Compression: {((generatedHighlight.metadata.compression_ratio || generatedHighlight.metadata.compressionRatio || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Highlights: {generatedHighlight.highlights.length} segments
              </div>
            </div>

            {/* Simplified Results - Just show the segments */}
            {generatedHighlight.highlights.length > 0 && (
              <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Detected Segments</h4>
                <div className="space-y-2">
                  {generatedHighlight.highlights.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between text-sm border-b border-gray-200 dark:border-gray-600 pb-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          Segment {index + 1}: {segment.startTime}s - {segment.endTime}s
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                          {segment.description}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Score: {(segment.score * 100).toFixed(0)}%
                        </span>
                        <div className={`w-2 h-2 rounded-full ${
                          segment.confidence > 0.8 ? 'bg-green-500' :
                          segment.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isProcessingVideo && (
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                <span>Processing video...</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 