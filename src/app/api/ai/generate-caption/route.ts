import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface CaptionRequest {
  context?: string;
  media: Array<{
    id: string;
    type: 'image' | 'video' | 'audio';
    data?: string; // base64 encoded data
    filename?: string;
    duration?: number;
  }>;
  branding?: {
    name?: string;
    tagline?: string;
    description?: string;
    tone?: string;
    values?: string[];
  };
  platform?: string;
  style?: 'professional' | 'casual' | 'funny' | 'engaging' | 'creative';
  includeHashtags?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: CaptionRequest = await request.json();
    const { 
      context = '', 
      media = [], 
      branding, 
      platform = 'general', 
      style = 'engaging',
      includeHashtags = true 
    } = body;

    // Validate required fields
    if (media.length === 0) {
      return NextResponse.json(
        { error: 'At least one media item is required' },
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

    console.log(`Generating caption for ${media.length} media items with context: "${context}"`);

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build the prompt
    let prompt = `You are an expert social media copywriter. Create an engaging ${style} caption for ${platform} based on the following:

CONTEXT INSTRUCTIONS: "${context || 'Create an engaging social media post'}"

MEDIA DETAILS:
${media.map((m, i) => `- ${m.type.toUpperCase()} ${i + 1}: ${m.filename || 'untitled'} ${m.duration ? `(${m.duration}s)` : ''}`).join('\n')}`;

    // Add branding information if provided
    if (branding) {
      prompt += `\n\nBRAND PROFILE:`;
      if (branding.name) prompt += `\n- Brand Name: ${branding.name}`;
      if (branding.tagline) prompt += `\n- Tagline: ${branding.tagline}`;
      if (branding.description) prompt += `\n- Description: ${branding.description}`;
      if (branding.tone) prompt += `\n- Brand Tone: ${branding.tone}`;
      if (branding.values?.length) prompt += `\n- Brand Values: ${branding.values.join(', ')}`;
    }

    prompt += `\n\nSTYLE REQUIREMENTS:
- Style: ${style}
- Platform: ${platform}
- Tone: ${getToneForStyle(style, context)}
- Length: ${getLengthForPlatform(platform)}`;

    if (includeHashtags) {
      prompt += `\n- Include 3-7 relevant hashtags at the end`;
    }

    prompt += `\n\nINSTRUCTIONS:
1. Analyze the media content and context carefully
2. ${getSpecificInstructions(context, style)}
3. Make it ${style} and appropriate for ${platform}
4. Keep it authentic and engaging
5. ${branding ? 'Incorporate the brand voice naturally' : 'Use a professional yet approachable tone'}
6. End with relevant hashtags if requested

Generate ONLY the caption text, nothing else.`;

    let result;

    // Handle image analysis if we have image data
    if (media.some(m => m.type === 'image' && m.data)) {
      const imageMedia = media.find(m => m.type === 'image' && m.data);
      if (imageMedia?.data) {
        // Ensure the base64 payload is non-empty after stripping header
        const base64Payload = imageMedia.data.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
        if (base64Payload && base64Payload.trim().length > 0) {
          try {
            const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const imagePart = {
              inlineData: {
                data: base64Payload,
                mimeType: getMimeTypeFromBase64(imageMedia.data)
              }
            };
            result = await visionModel.generateContent([prompt, imagePart]);
          } catch (imgErr) {
            console.warn('Vision model failed, falling back to text model:', imgErr);
            result = await model.generateContent(prompt);
          }
        } else {
          // Empty or invalid base64 – fall back
          result = await model.generateContent(prompt);
        }
      } else {
        // Fallback to text-only if image data is missing
        result = await model.generateContent(prompt);
      }
    } else {
      // For non-image content or no image data, use text-only model
      result = await model.generateContent(prompt);
    }

    const response = await result.response;
    const caption = response.text().trim();

    // Validate the generated caption
    if (!caption || caption.length < 10) {
      throw new Error('Generated caption is too short or empty');
    }

    console.log(`Generated caption: ${caption.substring(0, 100)}...`);

    // Extract hashtags if they're included
    const hashtagMatch = caption.match(/#\w+/g);
    const hashtags = hashtagMatch || [];
    const captionWithoutHashtags = caption.replace(/#\w+/g, '').trim();

    return NextResponse.json({
      success: true,
      caption: captionWithoutHashtags,
      hashtags: hashtags,
      fullCaption: caption,
      metadata: {
        style,
        platform,
        mediaCount: media.length,
        mediaTypes: media.map(m => m.type),
        hasBranding: !!branding,
        contextProvided: !!context,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating caption:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate caption',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getToneForStyle(style: string, context: string): string {
  if (context.toLowerCase().includes('funny') || context.toLowerCase().includes('humor')) {
    return 'humorous and playful';
  }
  
  switch (style) {
    case 'professional':
      return 'professional and authoritative';
    case 'casual':
      return 'friendly and conversational';
    case 'funny':
      return 'humorous and entertaining';
    case 'creative':
      return 'creative and inspiring';
    case 'engaging':
    default:
      return 'engaging and authentic';
  }
}

function getLengthForPlatform(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'twitter':
    case 'x':
      return 'concise (under 280 characters)';
    case 'instagram':
      return 'medium length (150-300 characters)';
    case 'facebook':
      return 'can be longer (up to 500 characters)';
    case 'linkedin':
      return 'professional length (200-400 characters)';
    case 'tiktok':
      return 'short and catchy (under 150 characters)';
    default:
      return 'medium length (150-300 characters)';
  }
}

function getSpecificInstructions(context: string, style: string): string {
  const contextLower = context.toLowerCase();
  
  if (contextLower.includes('funny') || contextLower.includes('humor') || style === 'funny') {
    return 'Create something genuinely funny and clever that will make people smile or laugh';
  }
  
  if (contextLower.includes('professional') || style === 'professional') {
    return 'Maintain a professional tone while being engaging';
  }
  
  if (contextLower.includes('creative') || style === 'creative') {
    return 'Be creative and unique in your approach';
  }
  
  return 'Create engaging content that resonates with the audience';
}

function getMimeTypeFromBase64(base64String: string): string {
  if (base64String.startsWith('data:image/jpeg')) return 'image/jpeg';
  if (base64String.startsWith('data:image/png')) return 'image/png';
  if (base64String.startsWith('data:image/gif')) return 'image/gif';
  if (base64String.startsWith('data:image/webp')) return 'image/webp';
  return 'image/jpeg'; // default
} 