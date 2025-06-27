import { NextRequest, NextResponse } from 'next/server';
import { JWT } from 'google-auth-library';

interface HighlightSegment {
  startTime: number;
  endTime: number;
  score: number;
  confidence: number;
  description?: string;
}

interface AnalysisStage {
  name: string;
  cost: number;
  segments: HighlightSegment[];
}

interface HighlightRequest {
  media_ids: number[];
  duration: number;
  highlight_type: string;
  style: string;
  include_text: boolean;
  include_music: boolean;
  context_padding?: number;
  content_instructions?: string;
  cost_optimize?: boolean;
  max_cost?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: HighlightRequest = await request.json();
    const { 
      media_ids, 
      duration = 30, 
      highlight_type = 'dynamic', 
      style = 'cinematic',
      include_text = true,
      include_music = true,
      context_padding = 2.0,
      content_instructions = '',
      cost_optimize = true,
      max_cost = 1.0
    } = body;

    // Validate required fields
    if (!media_ids || !Array.isArray(media_ids) || media_ids.length === 0) {
      return NextResponse.json(
        { error: 'Media IDs are required' },
        { status: 400 }
      );
    }

    if (duration < 10 || duration > 900) {
      return NextResponse.json(
        { error: 'Duration must be between 10 and 900 seconds' },
        { status: 400 }
      );
    }

    // Get API key from environment  
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    console.log(`Starting highlight generation for ${media_ids.length} media files`);
    console.log(`Target duration: ${duration}s, Style: ${style}, Cost optimize: ${cost_optimize}`);

    // Mock video analysis since we don't have actual video files in this demo
    // In production, this would analyze actual video files
    const mockVideoData = {
      duration: Math.random() * 3600 + 1800, // 30min to 90min videos
      width: 1920,
      height: 1080,
      fps: 30,
      hasAudio: true
    };

    const startTime = Date.now();
    
    // Multi-stage highlight generation algorithm
    const result = await generateHighlightReel({
      mediaIds: media_ids,
      targetDuration: duration,
      highlightType: highlight_type,
      style,
      includeText: include_text,
      includeMusic: include_music,
      contextPadding: context_padding,
      contentInstructions: content_instructions,
      costOptimize: cost_optimize,
      maxCost: max_cost,
      apiKey,
      videoData: mockVideoData
    });

    const processingTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      highlight_url: result.outputPath,
      duration: result.actualDuration,
      segments: result.segments,
      generation_metadata: {
        processing_time_ms: processingTime,
        ai_calls_made: result.aiCallsMade,
        estimated_cost: result.estimatedCost,
        algorithm_stages: result.analysisStages,
        video_duration: mockVideoData.duration,
        compression_ratio: result.actualDuration / mockVideoData.duration,
        confidence_score: result.overallConfidence,
        style_applied: style,
        cost_optimized: cost_optimize,
        fallback_used: result.fallbackUsed
      }
    });

  } catch (error) {
    console.error('Error in highlight generation:', error);
    return NextResponse.json(
      { error: 'Internal server error during highlight generation' },
      { status: 500 }
    );
  }
}

async function generateHighlightReel(params: {
  mediaIds: number[];
  targetDuration: number;
  highlightType: string;
  style: string;
  includeText: boolean;
  includeMusic: boolean;
  contextPadding: number;
  contentInstructions: string;
  costOptimize: boolean;
  maxCost: number;
  apiKey: string;
  videoData: any;
}) {
  const {
    mediaIds,
    targetDuration,
    highlightType,
    style,
    contentInstructions,
    costOptimize,
    maxCost,
    apiKey,
    videoData
  } = params;

  console.log(`Analyzing ${videoData.duration}s video for ${targetDuration}s highlights`);

  const analysisStages: AnalysisStage[] = [];
  let totalCost = 0;
  let aiCallsMade = 0;

  // Stage 1: Technical Pre-filtering (FREE - no AI cost)
  console.log('Stage 1: Technical pre-filtering...');
  const motionSegments = await detectMotionSegments(videoData);
  const audioSegments = await detectAudioEnergySegments(videoData);
  const sceneSegments = await detectSceneChanges(videoData);
  
  // Merge and score segments
  const candidateSegments = mergeAndScoreSegments(
    motionSegments, 
    audioSegments, 
    sceneSegments, 
    targetDuration
  );

  analysisStages.push({
    name: 'Technical Pre-filtering',
    cost: 0,
    segments: candidateSegments.slice(0, 10) // Top 10 candidates
  });

  let finalSegments = candidateSegments;

  // Stage 2: AI Analysis (COST-OPTIMIZED)
  if (candidateSegments.length > 0 && totalCost < maxCost) {
    console.log('Stage 2: AI-powered content analysis...');
    
    // Smart sampling based on cost constraints
    const maxAiCalls = costOptimize ? Math.min(15, Math.floor(maxCost / 0.01)) : 30;
    const segmentsToAnalyze = candidateSegments.slice(0, maxAiCalls);
    
    console.log(`Analyzing ${segmentsToAnalyze.length} segments with AI (max cost: $${maxCost})`);

    const aiAnalyzedSegments = await analyzeSegmentsWithAI(
      segmentsToAnalyze,
      contentInstructions,
      highlightType,
      apiKey
    );

    aiCallsMade = segmentsToAnalyze.length;
    totalCost = aiCallsMade * 0.01; // Estimated cost per API call

    analysisStages.push({
      name: 'AI Content Analysis',
      cost: totalCost,
      segments: aiAnalyzedSegments
    });

    finalSegments = aiAnalyzedSegments;
  }

  // Stage 3: Emergency Fallback (NEVER FAIL)
  if (finalSegments.length === 0) {
    console.log('Stage 3: Emergency fallback highlights...');
    finalSegments = createEmergencyHighlights(videoData, targetDuration);
    
    analysisStages.push({
      name: 'Emergency Fallback',
      cost: 0,
      segments: finalSegments
    });
  }

  // Select and optimize final segments
  const selectedSegments = selectBestSegments(finalSegments, targetDuration);
  const optimizedSegments = optimizeSegmentTiming(selectedSegments, targetDuration);

  // Calculate final duration and confidence
  const actualDuration = optimizedSegments.reduce((sum, seg) => sum + (seg.endTime - seg.startTime), 0);
  const overallConfidence = optimizedSegments.reduce((sum, seg) => sum + seg.confidence, 0) / optimizedSegments.length;

  // Generate mock output path (in production, this would be the actual video file)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = `/highlights/highlight_${mediaIds[0]}_${timestamp}.mp4`;

  return {
    outputPath,
    actualDuration,
    segments: optimizedSegments,
    aiCallsMade,
    estimatedCost: totalCost,
    analysisStages,
    overallConfidence,
    fallbackUsed: analysisStages.some(stage => stage.name === 'Emergency Fallback')
  };
}

// Stage 1: Motion Detection (Computer Vision - FREE)
async function detectMotionSegments(videoData: any): Promise<HighlightSegment[]> {
  const segments: HighlightSegment[] = [];
  const windowSize = 10; // 10-second windows
  const totalDuration = videoData.duration;
  
  for (let time = 0; time < totalDuration - windowSize; time += windowSize / 2) {
    // Simulate motion detection algorithm
    const motionScore = Math.random() * 0.8 + 0.1; // 0.1 to 0.9
    
    // Higher motion score for middle sections (simulating action)
    const middleBias = 1 - Math.abs((time / totalDuration) - 0.5) * 2;
    const adjustedScore = motionScore * (0.7 + 0.3 * middleBias);
    
    if (adjustedScore > 0.3) { // Threshold for "interesting" motion
      segments.push({
        startTime: time,
        endTime: Math.min(time + windowSize, totalDuration),
        score: adjustedScore,
        confidence: adjustedScore * 0.6, // Motion detection is somewhat reliable
        description: `Motion segment (${adjustedScore.toFixed(2)} motion score)`
      });
    }
  }
  
  console.log(`Motion detection found ${segments.length} potential segments`);
  return segments;
}

// Stage 1: Audio Energy Detection (FREE)
async function detectAudioEnergySegments(videoData: any): Promise<HighlightSegment[]> {
  const segments: HighlightSegment[] = [];
  
  if (!videoData.hasAudio) return segments;
  
  const windowSize = 8; // 8-second windows for audio
  const totalDuration = videoData.duration;
  
  for (let time = 0; time < totalDuration - windowSize; time += windowSize / 3) {
    // Simulate audio energy detection
    const audioEnergy = Math.random() * 0.9 + 0.1;
    
    // Simulate peaks at natural speech/music moments
    const peakProbability = Math.sin(time / 60) * 0.3 + 0.5;
    const adjustedEnergy = audioEnergy * peakProbability;
    
    if (adjustedEnergy > 0.4) {
      segments.push({
        startTime: time,
        endTime: Math.min(time + windowSize, totalDuration),
        score: adjustedEnergy,
        confidence: adjustedEnergy * 0.7,
        description: `High audio energy (${adjustedEnergy.toFixed(2)} energy)`
      });
    }
  }
  
  console.log(`Audio analysis found ${segments.length} high-energy segments`);
  return segments;
}

// Stage 1: Scene Change Detection (FREE)
async function detectSceneChanges(videoData: any): Promise<HighlightSegment[]> {
  const segments: HighlightSegment[] = [];
  const totalDuration = videoData.duration;
  
  // Simulate scene changes every 20-60 seconds
  const sceneChangeInterval = 30 + Math.random() * 30;
  
  for (let time = sceneChangeInterval; time < totalDuration; time += sceneChangeInterval + Math.random() * 20) {
    const sceneScore = 0.6 + Math.random() * 0.4; // Scene changes are generally important
    
    segments.push({
      startTime: Math.max(0, time - 5),
      endTime: Math.min(time + 10, totalDuration),
      score: sceneScore,
      confidence: sceneScore * 0.8,
      description: `Scene transition at ${time.toFixed(1)}s`
    });
  }
  
  console.log(`Scene detection found ${segments.length} scene changes`);
  return segments;
}

// Merge overlapping segments and boost scores
function mergeAndScoreSegments(
  motionSegments: HighlightSegment[], 
  audioSegments: HighlightSegment[], 
  sceneSegments: HighlightSegment[],
  targetDuration: number
): HighlightSegment[] {
  const allSegments = [...motionSegments, ...audioSegments, ...sceneSegments];
  
  // Sort by start time
  allSegments.sort((a, b) => a.startTime - b.startTime);
  
  // Merge overlapping segments
  const merged: HighlightSegment[] = [];
  
  for (const segment of allSegments) {
    const lastMerged = merged[merged.length - 1];
    
    if (lastMerged && segment.startTime <= lastMerged.endTime + 5) {
      // Merge overlapping or close segments
      lastMerged.endTime = Math.max(lastMerged.endTime, segment.endTime);
      lastMerged.score = Math.max(lastMerged.score, segment.score);
      lastMerged.confidence = (lastMerged.confidence + segment.confidence) / 2;
      lastMerged.description = `Combined: ${lastMerged.description} + ${segment.description}`;
    } else {
      merged.push({ ...segment });
    }
  }
  
  // Score boost for optimal duration segments
  for (const segment of merged) {
    const duration = segment.endTime - segment.startTime;
    const optimalDuration = Math.min(targetDuration / 3, 15); // Target 1/3 of final duration per segment
    
    if (duration >= optimalDuration * 0.5 && duration <= optimalDuration * 2) {
      segment.score *= 1.3; // Boost score for good duration
      segment.confidence *= 1.2;
    }
  }
  
  // Sort by combined score
  merged.sort((a, b) => b.score - a.score);
  
  console.log(`Merged into ${merged.length} candidate segments`);
  return merged.slice(0, Math.min(50, merged.length)); // Top 50 candidates
}

// Stage 2: AI Analysis (COST-OPTIMIZED)
async function analyzeSegmentsWithAI(
  segments: HighlightSegment[],
  instructions: string,
  highlightType: string,
  apiKey: string
): Promise<HighlightSegment[]> {
  const analyzedSegments: HighlightSegment[] = [];
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    
    try {
      // Simulate AI analysis call to Gemini
      const aiAnalysis = await callGeminiForSegmentAnalysis(segment, instructions, highlightType, apiKey);
      
      if (aiAnalysis.relevant) {
        analyzedSegments.push({
          ...segment,
          score: aiAnalysis.relevanceScore,
          confidence: aiAnalysis.confidence,
          description: aiAnalysis.description
        });
      }
      
      console.log(`AI analyzed segment ${i + 1}/${segments.length}: ${aiAnalysis.relevant ? 'RELEVANT' : 'SKIP'}`);
      
    } catch (error) {
      console.warn(`AI analysis failed for segment ${i + 1}, keeping original:`, error);
      analyzedSegments.push(segment);
    }
  }
  
  // Sort by AI relevance score
  analyzedSegments.sort((a, b) => b.score - a.score);
  
  console.log(`AI analysis completed: ${analyzedSegments.length}/${segments.length} segments deemed relevant`);
  return analyzedSegments;
}

// AI Analysis Helper
async function callGeminiForSegmentAnalysis(
  segment: HighlightSegment, 
  instructions: string, 
  highlightType: string, 
  apiKey: string
) {
  // Simulate AI analysis - in production, this would call actual Gemini API
  // with frame analysis from the video segment
  
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
  
  const relevanceScore = Math.random() * 0.6 + 0.4; // 0.4 to 1.0
  const confidence = Math.random() * 0.3 + 0.7; // 0.7 to 1.0
  
  // Boost score if segment matches highlight type
  const typeBoost = highlightType === 'dynamic' ? 1.2 : 
                   highlightType === 'action' ? 1.3 : 1.0;
  
  const finalScore = Math.min(1.0, relevanceScore * typeBoost);
  const isRelevant = finalScore > 0.5;
  
  return {
    relevant: isRelevant,
    relevanceScore: finalScore,
    confidence: confidence,
    description: `AI: ${highlightType} content (${finalScore.toFixed(2)} relevance)`
  };
}

// Stage 3: Emergency Fallback (NEVER FAIL)
function createEmergencyHighlights(videoData: any, targetDuration: number): HighlightSegment[] {
  console.log('Creating emergency fallback highlights - NEVER FAIL mode');
  
  const segments: HighlightSegment[] = [];
  const totalDuration = videoData.duration;
  const segmentDuration = Math.min(targetDuration / 3, 15); // 3 segments max
  
  // Distribute segments across the video
  const positions = [0.2, 0.5, 0.8]; // 20%, 50%, 80% through video
  
  for (let i = 0; i < positions.length; i++) {
    const startTime = totalDuration * positions[i];
    const endTime = Math.min(startTime + segmentDuration, totalDuration);
    
    if (endTime - startTime >= 3) { // Minimum 3 seconds
      segments.push({
        startTime,
        endTime,
        score: 0.6 + i * 0.1, // Slightly increasing scores
        confidence: 0.5, // Medium confidence for emergency highlights
        description: `Emergency highlight ${i + 1} (${positions[i] * 100}% through video)`
      });
    }
  }
  
  console.log(`Emergency fallback created ${segments.length} segments`);
  return segments;
}

// Final Selection and Optimization
function selectBestSegments(segments: HighlightSegment[], targetDuration: number): HighlightSegment[] {
  if (segments.length === 0) return [];
  
  // Greedy selection to fill target duration
  const selected: HighlightSegment[] = [];
  let remainingDuration = targetDuration;
  
  // Sort by score/confidence combination
  const sortedSegments = segments.sort((a, b) => (b.score * b.confidence) - (a.score * a.confidence));
  
  for (const segment of sortedSegments) {
    const segmentDuration = segment.endTime - segment.startTime;
    
    if (segmentDuration <= remainingDuration && segmentDuration >= 2) {
      selected.push(segment);
      remainingDuration -= segmentDuration;
      
      if (remainingDuration <= 0) break;
    }
  }
  
  console.log(`Selected ${selected.length} segments for final highlight reel`);
  return selected;
}

function optimizeSegmentTiming(segments: HighlightSegment[], targetDuration: number): HighlightSegment[] {
  if (segments.length === 0) return segments;
  
  // Sort by timeline position
  segments.sort((a, b) => a.startTime - b.startTime);
  
  // Add smooth transitions
  const optimized = segments.map((segment, index) => ({
    ...segment,
    startTime: segment.startTime,
    endTime: segment.endTime,
    description: `${segment.description} [Segment ${index + 1}]`
  }));
  
  console.log(`Optimized ${optimized.length} segments for smooth playback`);
  return optimized;
} 