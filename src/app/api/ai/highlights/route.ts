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
  example?: {
    start_time?: number;
    end_time?: number;
    description?: string;
  };
  scene_count?: number;
  video_duration?: number;
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
      max_cost = 1.0,
      example,
      scene_count,
      video_duration
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

    console.log(`Starting NLP-driven highlight generation for ${media_ids.length} media files`);
    console.log(`Target duration: ${duration}s, Instructions: "${content_instructions}"`);
    if (example?.start_time) {
      console.log(`Example time provided: ${example.start_time}s`);
    }

    // Mock video analysis since we don't have actual video files in this demo
    // In production, this would analyze actual video files
    const mockVideoData = {
      duration: video_duration || Math.random() * 3600 + 1800, // use provided duration if available
      width: 1920,
      height: 1080,
      fps: 30,
      hasAudio: true
    };

    const startTime = Date.now();
    
    // Enhanced NLP-driven highlight generation algorithm
    const result = await generateHighlightReel({
      mediaIds: media_ids,
      targetDuration: duration,
      highlightType: highlight_type,
      style,
      includeText: include_text,
      includeMusic: include_music,
      contextPadding: context_padding,
      contentInstructions: content_instructions,
      exampleTime: example?.start_time,
      costOptimize: cost_optimize,
      maxCost: max_cost,
      apiKey,
      videoData: mockVideoData,
      scene_count,
      video_duration
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
        fallback_used: result.fallbackUsed,
        nlp_instructions: content_instructions,
        example_time_used: example?.start_time
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
  exampleTime?: number;
  costOptimize: boolean;
  maxCost: number;
  apiKey: string;
  videoData: any;
  scene_count?: number;
  video_duration?: number;
}) {
  const {
    mediaIds,
    targetDuration,
    highlightType,
    style,
    contentInstructions,
    exampleTime,
    costOptimize,
    maxCost,
    apiKey,
    videoData,
    scene_count,
    video_duration
  } = params;

  console.log(`Analyzing ${videoData.duration}s video for ${targetDuration}s highlights`);
  console.log(`NLP Instructions: "${contentInstructions}"`);
  if (exampleTime) {
    console.log(`Example pattern at: ${exampleTime}s`);
  }

  const analysisStages: AnalysisStage[] = [];
  let totalCost = 0;
  let aiCallsMade = 0;

  // Stage 1: Enhanced Pattern Detection with Example Time
  console.log('Stage 1: NLP-driven pattern detection...');
  let candidateSegments: HighlightSegment[] = [];

  if (contentInstructions && exampleTime) {
    // Use example time to find similar patterns
    candidateSegments = await findSimilarPatterns(videoData, contentInstructions, exampleTime);
    console.log(`Found ${candidateSegments.length} segments matching example pattern`);
  } else if (contentInstructions) {
    // Use NLP instructions without example
    candidateSegments = await detectPatternsByInstructions(videoData, contentInstructions);
    console.log(`Found ${candidateSegments.length} segments matching instructions`);
  } else {
    // Fallback to traditional detection
    const motionSegments = await detectMotionSegments(videoData);
    const audioSegments = await detectAudioEnergySegments(videoData);
    const sceneSegments = await detectSceneChanges(videoData);
    candidateSegments = mergeAndScoreSegments(motionSegments, audioSegments, sceneSegments, targetDuration);
  }

  analysisStages.push({
    name: contentInstructions ? 'NLP Pattern Detection' : 'Technical Pre-filtering',
    cost: 0,
    segments: candidateSegments.slice(0, 10)
  });

  let finalSegments = candidateSegments;

  // Stage 2: AI Validation and Refinement
  if (candidateSegments.length > 0 && totalCost < maxCost) {
    console.log('Stage 2: AI validation of detected patterns...');
    
    const maxAiCalls = costOptimize ? Math.min(15, Math.floor(maxCost / 0.01)) : 30;
    const segmentsToAnalyze = candidateSegments.slice(0, maxAiCalls);
    
    console.log(`Validating ${segmentsToAnalyze.length} segments with AI`);

    const aiAnalyzedSegments = await analyzeSegmentsWithAI(
      segmentsToAnalyze,
      contentInstructions,
      highlightType,
      apiKey,
      exampleTime
    );

    aiCallsMade = segmentsToAnalyze.length;
    totalCost = aiCallsMade * 0.01;

    analysisStages.push({
      name: 'AI Pattern Validation',
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
  let selectedSegments = selectBestSegments(finalSegments, targetDuration, scene_count, exampleTime);

  // If we still have fewer segments than requested scene_count, generate filler emergency segments
  if (scene_count && selectedSegments.length < scene_count) {
    const needed = scene_count - selectedSegments.length;
    const fillerCandidates = createEmergencyHighlights(videoData, targetDuration).filter(f =>
      !selectedSegments.some(s => Math.abs(s.startTime - f.startTime) < 0.1)
    );
    selectedSegments = [...selectedSegments, ...fillerCandidates.slice(0, needed)];
  }

  let optimizedSegments = optimizeSegmentTiming(selectedSegments, targetDuration);

  // Final duration enforcement (±2s margin)
  optimizedSegments = enforceDurationLimit(optimizedSegments, targetDuration);

  // Calculate final duration and confidence
  const actualDuration = optimizedSegments.reduce((sum, seg) => sum + (seg.endTime - seg.startTime), 0);
  const overallConfidence = optimizedSegments.reduce((sum, seg) => sum + seg.confidence, 0) / optimizedSegments.length;

  // Generate mock output path
  // Use a real video file that exists in /public so the frontend can play it
  const outputPath = `/videos/placeholder-video.mp4`;

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
  apiKey: string,
  exampleTime?: number
): Promise<HighlightSegment[]> {
  const analyzedSegments: HighlightSegment[] = [];
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    
    try {
      // Simulate AI analysis call to Gemini
      const aiAnalysis = await callGeminiForSegmentAnalysis(segment, instructions, highlightType, apiKey, exampleTime);
      
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
  apiKey: string,
  exampleTime?: number
) {
  // Simulate AI analysis - in production, this would call actual Gemini API
  // with frame analysis from the video segment
  
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
  
  let relevanceScore = Math.random() * 0.6 + 0.4; // 0.4 to 1.0
  let confidence = Math.random() * 0.3 + 0.7; // 0.7 to 1.0
  
  // Enhanced scoring with example time and instructions
  if (instructions && instructions.length > 0) {
    // Boost score based on instruction relevance
    const instructionBoost = calculateInstructionRelevance(segment, instructions);
    relevanceScore *= (1 + instructionBoost * 0.5);
    confidence *= (1 + instructionBoost * 0.2);
  }
  
  // If example time provided, boost segments that are temporally similar
  if (exampleTime !== undefined) {
    const timeSimilarity = calculateTemporalSimilarity(segment.startTime, exampleTime);
    relevanceScore *= (1 + timeSimilarity * 0.3);
    confidence *= (1 + timeSimilarity * 0.1);
    
    console.log(`Segment at ${segment.startTime}s vs example at ${exampleTime}s: ${timeSimilarity.toFixed(2)} temporal similarity`);
  }
  
  // Boost score if segment matches highlight type
  const typeBoost = highlightType === 'dynamic' ? 1.2 : 
                   highlightType === 'action' ? 1.3 : 1.0;
  
  const finalScore = Math.min(1.0, relevanceScore * typeBoost);
  const isRelevant = finalScore > 0.5;
  
  let description = `AI: ${highlightType} content (${finalScore.toFixed(2)} relevance)`;
  if (instructions) {
    description += ` - matches "${instructions.substring(0, 30)}..."`;
  }
  if (exampleTime !== undefined) {
    description += ` - similar to ${exampleTime}s example`;
  }
  
  return {
    relevant: isRelevant,
    relevanceScore: finalScore,
    confidence: Math.min(1.0, confidence),
    description
  };
}

// Helper: Calculate instruction relevance for a segment
function calculateInstructionRelevance(segment: HighlightSegment, instructions: string): number {
  const keywords = extractKeywords(instructions);
  const actionType = determineActionType(instructions);
  
  let relevance = 0.0;
  
  // Base relevance from action type
  switch (actionType) {
    case 'sports_action':
      relevance += 0.3;
      break;
    case 'water_action':
      relevance += 0.25;
      break;
    case 'jump_action':
      relevance += 0.35;
      break;
    case 'speech_action':
      relevance += 0.2;
      break;
    default:
      relevance += 0.15;
  }
  
  // Add relevance based on keywords
  relevance += keywords.length * 0.05;
  
  // Add some randomness to simulate actual content analysis
  relevance += Math.random() * 0.3;
  
  return Math.min(1.0, relevance);
}

// Helper: Calculate temporal similarity between segments
function calculateTemporalSimilarity(segmentTime: number, exampleTime: number): number {
  const timeDiff = Math.abs(segmentTime - exampleTime);
  
  // Segments very close to example get high similarity
  if (timeDiff < 10) return 0.9;
  if (timeDiff < 30) return 0.7;
  if (timeDiff < 60) return 0.5;
  if (timeDiff < 120) return 0.3;
  
  // Distant segments get low similarity
  return 0.1;
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
function selectBestSegments(
  segments: HighlightSegment[],
  targetDuration: number,
  sceneCount?: number,
  exampleTime?: number
): HighlightSegment[] {
  if (segments.length === 0) return [];

  // Ensure any segment that covers exampleTime gets a strong boost so it is always picked.
  if (exampleTime !== undefined) {
    segments = segments.map((s) => {
      const coversExample = s.startTime <= exampleTime && s.endTime >= exampleTime;
      return coversExample ? { ...s, score: s.score + 1 } : s; // big boost
    });
  }

  // Sort by boosted score
  const sorted = [...segments].sort((a, b) => (b.score * b.confidence) - (a.score * a.confidence));

  const desiredScenes = sceneCount && sceneCount > 0 ? sceneCount : undefined;
  const selected: HighlightSegment[] = [];
  let usedDuration = 0;

  for (const seg of sorted) {
    // Skip if we already have enough scenes
    if (desiredScenes && selected.length >= desiredScenes) break;

    const segDur = seg.endTime - seg.startTime;

    // Skip segments that would push total over target
    if (usedDuration + segDur > targetDuration) continue;

    selected.push(seg);
    usedDuration += segDur;
  }

  // If we still don't have enough scenes, fill with best remaining segments even if total duration slightly exceeds
  if (desiredScenes && selected.length < desiredScenes) {
    for (const seg of sorted) {
      if (selected.includes(seg)) continue;
      selected.push(seg);
      if (selected.length >= desiredScenes) break;
    }
  }

  // Trim total duration if it still exceeds target
  if (selected.length > 0) {
    let totalDur = selected.reduce((sum, s) => sum + (s.endTime - s.startTime), 0);
    if (totalDur > targetDuration) {
      const scale = targetDuration / totalDur;
      selected.forEach((s) => {
        const mid = (s.startTime + s.endTime) / 2;
        const newHalfDur = ((s.endTime - s.startTime) * scale) / 2;
        s.startTime = Math.max(0, mid - newHalfDur);
        s.endTime = mid + newHalfDur;
      });
    }
  }

  console.log(`Selected ${selected.length} segments for final highlight reel (sceneCount target: ${sceneCount || 'auto'})`);
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

// NEW: NLP-driven pattern detection with example time
async function findSimilarPatterns(
  videoData: any, 
  instructions: string, 
  exampleTime: number
): Promise<HighlightSegment[]> {
  const segments: HighlightSegment[] = [];
  const totalDuration = videoData.duration;
  const windowSize = 8; // 8-second analysis windows
  
  console.log(`Looking for patterns similar to example at ${exampleTime}s`);
  console.log(`Instructions: "${instructions}"`);
  
  // Analyze the example time area to understand the pattern
  const exampleStart = Math.max(0, exampleTime - 4);
  const exampleEnd = Math.min(totalDuration, exampleTime + 4);
  
  // Extract features from example segment (simulated)
  const exampleFeatures = analyzeSegmentFeatures(exampleStart, exampleEnd, videoData);
  
  // Scan through video looking for similar patterns
  for (let time = 0; time < totalDuration - windowSize; time += windowSize / 2) {
    const segmentFeatures = analyzeSegmentFeatures(time, time + windowSize, videoData);
    
    // Calculate similarity to example
    let similarity = calculatePatternSimilarity(exampleFeatures, segmentFeatures, instructions);

    // Extra weight if this segment actually covers the example time.
    if (time <= exampleTime && (time + windowSize) >= exampleTime) {
      similarity += 0.3;
    }
    
    if (similarity > 0.6) { // High similarity threshold
      segments.push({
        startTime: time,
        endTime: Math.min(time + windowSize, totalDuration),
        score: similarity,
        confidence: similarity * 0.9, // High confidence for pattern matching
        description: `Pattern match: ${similarity.toFixed(2)} similarity to example at ${exampleTime}s`
      });
    }
  }
  
  // Sort by similarity score
  segments.sort((a, b) => b.score - a.score);
  
  console.log(`Found ${segments.length} segments matching example pattern`);
  return segments.slice(0, 20); // Top 20 matches
}

// NEW: NLP-driven pattern detection without example
async function detectPatternsByInstructions(
  videoData: any, 
  instructions: string
): Promise<HighlightSegment[]> {
  const segments: HighlightSegment[] = [];
  const totalDuration = videoData.duration;
  const windowSize = 10;
  
  console.log(`Detecting patterns based on instructions: "${instructions}"`);
  
  // Parse instructions to understand what to look for
  const keywords = extractKeywords(instructions);
  const actionType = determineActionType(instructions);
  
  for (let time = 0; time < totalDuration - windowSize; time += windowSize / 3) {
    // Simulate pattern detection based on instructions
    const patternScore = simulateInstructionMatching(time, windowSize, keywords, actionType, videoData);
    
    if (patternScore > 0.5) {
      segments.push({
        startTime: time,
        endTime: Math.min(time + windowSize, totalDuration),
        score: patternScore,
        confidence: patternScore * 0.8,
        description: `Instruction match: "${instructions.substring(0, 50)}..."`
      });
    }
  }
  
  segments.sort((a, b) => b.score - a.score);
  console.log(`Found ${segments.length} segments matching instructions`);
  return segments.slice(0, 25); // Top 25 matches
}

// Helper: Analyze segment features for pattern matching
function analyzeSegmentFeatures(startTime: number, endTime: number, videoData: any) {
  const duration = endTime - startTime;
  const position = startTime / videoData.duration;
  
  // Simulate feature extraction (motion, audio, visual complexity)
  return {
    motionLevel: Math.random() * 0.8 + 0.1,
    audioEnergy: Math.random() * 0.9 + 0.1,
    visualComplexity: Math.random() * 0.7 + 0.2,
    sceneChanges: Math.floor(Math.random() * 3),
    duration,
    position,
    timestamp: startTime
  };
}

// Helper: Calculate similarity between patterns
function calculatePatternSimilarity(
  exampleFeatures: any, 
  segmentFeatures: any, 
  instructions: string
): number {
  // Weight different features based on instructions
  const motionWeight = instructions.toLowerCase().includes('motion') || 
                      instructions.toLowerCase().includes('action') || 
                      instructions.toLowerCase().includes('movement') ? 0.4 : 0.2;
  
  const audioWeight = instructions.toLowerCase().includes('sound') || 
                     instructions.toLowerCase().includes('music') || 
                     instructions.toLowerCase().includes('audio') ? 0.4 : 0.2;
  
  const visualWeight = 1.0 - motionWeight - audioWeight;
  
  // Calculate feature similarities
  const motionSim = 1 - Math.abs(exampleFeatures.motionLevel - segmentFeatures.motionLevel);
  const audioSim = 1 - Math.abs(exampleFeatures.audioEnergy - segmentFeatures.audioEnergy);
  const visualSim = 1 - Math.abs(exampleFeatures.visualComplexity - segmentFeatures.visualComplexity);
  
  // Weighted similarity score
  const similarity = (motionSim * motionWeight) + (audioSim * audioWeight) + (visualSim * visualWeight);
  
  return Math.min(1.0, similarity);
}

// Helper: Extract keywords from instructions
function extractKeywords(instructions: string): string[] {
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  return instructions
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 10); // Top 10 keywords
}

// Helper: Determine action type from instructions
function determineActionType(instructions: string): string {
  const lower = instructions.toLowerCase();
  
  if (lower.includes('basket') || lower.includes('score') || lower.includes('goal')) return 'sports_action';
  if (lower.includes('fall') || lower.includes('water') || lower.includes('splash')) return 'water_action';
  if (lower.includes('jump') || lower.includes('leap') || lower.includes('hop')) return 'jump_action';
  if (lower.includes('run') || lower.includes('sprint') || lower.includes('race')) return 'running_action';
  if (lower.includes('dance') || lower.includes('move') || lower.includes('rhythm')) return 'dance_action';
  if (lower.includes('speak') || lower.includes('talk') || lower.includes('say')) return 'speech_action';
  
  return 'general_action';
}

// Helper: Simulate instruction-based pattern matching
function simulateInstructionMatching(
  time: number, 
  windowSize: number, 
  keywords: string[], 
  actionType: string, 
  videoData: any
): number {
  let score = 0.3; // Base score
  
  // Boost score based on action type
  switch (actionType) {
    case 'sports_action':
      score += Math.random() * 0.4; // Sports actions are often high-motion
      break;
    case 'water_action':
      score += Math.random() * 0.3; // Water actions have distinct audio/visual
      break;
    case 'jump_action':
      score += Math.random() * 0.35; // Jump actions are brief but distinct
      break;
    case 'speech_action':
      score += Math.random() * 0.25; // Speech has distinct audio patterns
      break;
    default:
      score += Math.random() * 0.2;
  }
  
  // Boost score for keywords presence (simulated)
  score += keywords.length * 0.05;
  
  // Add some temporal variation
  const timePosition = time / videoData.duration;
  if (timePosition > 0.2 && timePosition < 0.8) {
    score *= 1.1; // Boost middle sections
  }
  
  return Math.min(1.0, score);
}

// Ensure the combined duration does not exceed targetDuration by more than 2s.
function enforceDurationLimit(segments: HighlightSegment[], targetDuration: number): HighlightSegment[] {
  const MAX_OVERSHOOT = 2; // seconds
  let total = segments.reduce((sum, s) => sum + (s.endTime - s.startTime), 0);

  if (total <= targetDuration + MAX_OVERSHOOT) return segments;

  const scale = (targetDuration + MAX_OVERSHOOT) / total;

  return segments.map((s) => {
    const mid = (s.startTime + s.endTime) / 2;
    const newHalf = ((s.endTime - s.startTime) * scale) / 2;
    return {
      ...s,
      startTime: Math.max(0, mid - newHalf),
      endTime: mid + newHalf,
    };
  });
} 