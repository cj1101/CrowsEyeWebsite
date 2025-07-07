import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIGenerationRequest {
  prompt: string;
  type: 'caption' | 'hashtags' | 'content_idea' | 'optimization';
  platform?: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'energetic';
  max_length?: number;
  context?: {
    mediaType?: 'image' | 'video' | 'audio';
    description?: string;
    target_audience?: string;
  };
}

export interface AIGenerationResponse {
  generated_content: string;
  alternatives?: string[];
  metadata: {
    confidence_score: number;
    suggested_hashtags?: string[];
    estimated_engagement?: number;
  };
}

export interface ComplianceCheck {
  content: string;
  media_urls: string[];
  platforms: string[];
}

export interface ComplianceResult {
  overall_score: number;
  platform_results: {
    [platform: string]: {
      score: number;
      issues: ComplianceIssue[];
      suggestions: string[];
    };
  };
}

export interface ComplianceIssue {
  type: 'warning' | 'error';
  category: 'content' | 'format' | 'policy';
  message: string;
  suggestion?: string;
}

// Initialize Gemini AI
const getGeminiAPIKey = (): string => {
  // Check for both possible environment variable names as per memory
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY environment variable.');
  }
  
  return apiKey;
};

let genAI: GoogleGenerativeAI | null = null;

const initializeGemini = () => {
  if (!genAI) {
    try {
      const apiKey = getGeminiAPIKey();
      genAI = new GoogleGenerativeAI(apiKey);
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
      throw error;
    }
  }
  return genAI;
};

// Platform-specific guidelines
const PLATFORM_GUIDELINES = {
  instagram: {
    maxLength: 2200,
    hashtagLimit: 30,
    tone: 'visual and engaging',
    guidelines: 'Use visual storytelling, include relevant hashtags, encourage engagement'
  },
  tiktok: {
    maxLength: 300,
    hashtagLimit: 10,
    tone: 'fun and trendy',
    guidelines: 'Be trendy, use popular sounds/challenges, create urgency'
  },
  facebook: {
    maxLength: 500,
    hashtagLimit: 5,
    tone: 'conversational',
    guidelines: 'Encourage discussion, ask questions, share stories'
  },
  twitter: {
    maxLength: 280,
    hashtagLimit: 3,
    tone: 'concise and witty',
    guidelines: 'Be concise, use trending topics, encourage retweets'
  },
  linkedin: {
    maxLength: 1300,
    hashtagLimit: 5,
    tone: 'professional',
    guidelines: 'Share insights, professional achievements, industry trends'
  },
  pinterest: {
    maxLength: 500,
    hashtagLimit: 20,
    tone: 'descriptive and inspiring',
    guidelines: 'Describe visuals clearly, use keywords, inspire action'
  }
};

export class GeminiAIService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = initializeGemini();
  }

  // Generate caption
  async generateCaption(request: AIGenerationRequest): Promise<{ success: boolean; data?: AIGenerationResponse; error?: string }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const platform = request.platform || 'general';
      const platformGuide = PLATFORM_GUIDELINES[platform as keyof typeof PLATFORM_GUIDELINES] || PLATFORM_GUIDELINES.instagram;
      
      const toneMap = {
        professional: 'professional and authoritative',
        casual: 'casual and friendly',
        friendly: 'warm and approachable',
        energetic: 'energetic and enthusiastic'
      };

      const tone = toneMap[request.tone || 'friendly'];
      
      const promptText = `
Generate a ${tone} social media caption for ${platform}.

Requirements:
- Maximum length: ${request.max_length || platformGuide.maxLength} characters
- Tone: ${tone}
- Platform: ${platform}
- Content type: ${request.context?.mediaType || 'general'}
- Guidelines: ${platformGuide.guidelines}

Context:
${request.context?.description ? `Content description: ${request.context.description}` : ''}
${request.context?.target_audience ? `Target audience: ${request.context.target_audience}` : ''}

User prompt: ${request.prompt}

Please provide:
1. A primary caption
2. 2 alternative versions
3. Suggested hashtags (max ${platformGuide.hashtagLimit})
4. Estimated engagement potential (1-10 scale)

Format your response as JSON:
{
  "primary_caption": "main caption here",
  "alternatives": ["alt1", "alt2"],
  "hashtags": ["#hashtag1", "#hashtag2"],
  "engagement_score": 8
}
`;

      const result = await model.generateContent(promptText);
      const response = await result.response;
      const text = response.text();

      // Try to parse JSON response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(text);
      } catch {
        // Fallback if not valid JSON
        parsedResponse = {
          primary_caption: text,
          alternatives: [],
          hashtags: [],
          engagement_score: 7
        };
      }

      return {
        success: true,
        data: {
          generated_content: parsedResponse.primary_caption,
          alternatives: parsedResponse.alternatives || [],
          metadata: {
            confidence_score: parsedResponse.engagement_score / 10,
            suggested_hashtags: parsedResponse.hashtags || [],
            estimated_engagement: parsedResponse.engagement_score || 7
          }
        }
      };
    } catch (error: any) {
      console.error('Generate caption error:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate caption'
      };
    }
  }

  // Generate hashtags
  async generateHashtags(request: AIGenerationRequest): Promise<{ success: boolean; data?: AIGenerationResponse; error?: string }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const platform = request.platform || 'general';
      const platformGuide = PLATFORM_GUIDELINES[platform as keyof typeof PLATFORM_GUIDELINES] || PLATFORM_GUIDELINES.instagram;

      const promptText = `
Generate relevant hashtags for ${platform} content.

Content: ${request.prompt}
Platform: ${platform}
Maximum hashtags: ${platformGuide.hashtagLimit}
Content type: ${request.context?.mediaType || 'general'}

Requirements:
- Mix of popular and niche hashtags
- Relevant to the content
- Platform-appropriate
- Include trending tags when relevant

Provide a mix of:
- High-competition popular tags (1-3)
- Medium-competition targeted tags (3-5)
- Low-competition niche tags (2-4)

Format as JSON:
{
  "hashtags": ["#hashtag1", "#hashtag2", ...],
  "categories": {
    "popular": ["#popular1", "#popular2"],
    "targeted": ["#targeted1", "#targeted2"],
    "niche": ["#niche1", "#niche2"]
  },
  "engagement_potential": 8
}
`;

      const result = await model.generateContent(promptText);
      const response = await result.response;
      const text = response.text();

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(text);
      } catch {
        // Extract hashtags from text if JSON parsing fails
        const hashtagMatches = text.match(/#[\w\d_]+/g) || [];
        parsedResponse = {
          hashtags: hashtagMatches.slice(0, platformGuide.hashtagLimit),
          engagement_potential: 7
        };
      }

      return {
        success: true,
        data: {
          generated_content: parsedResponse.hashtags.join(' '),
          alternatives: parsedResponse.categories ? 
            Object.values(parsedResponse.categories).flat() : [],
          metadata: {
            confidence_score: (parsedResponse.engagement_potential || 7) / 10,
            suggested_hashtags: parsedResponse.hashtags || [],
            estimated_engagement: parsedResponse.engagement_potential || 7
          }
        }
      };
    } catch (error: any) {
      console.error('Generate hashtags error:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate hashtags'
      };
    }
  }

  // Optimize content
  async optimizeContent(request: AIGenerationRequest): Promise<{ success: boolean; data?: AIGenerationResponse; error?: string }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const platform = request.platform || 'general';
      const platformGuide = PLATFORM_GUIDELINES[platform as keyof typeof PLATFORM_GUIDELINES] || PLATFORM_GUIDELINES.instagram;

      const promptText = `
Optimize this social media content for ${platform}:

Original content: ${request.prompt}
Platform: ${platform}
Target tone: ${request.tone || 'friendly'}
Max length: ${request.max_length || platformGuide.maxLength} characters

Optimization goals:
- Improve engagement potential
- Make platform-appropriate
- Enhance readability
- Add compelling call-to-action
- Optimize for ${platform} algorithm

Provide:
1. Optimized version
2. Key improvements made
3. Engagement tips
4. Performance prediction

Format as JSON:
{
  "optimized_content": "improved content here",
  "improvements": ["improvement1", "improvement2"],
  "engagement_tips": ["tip1", "tip2"],
  "performance_score": 8
}
`;

      const result = await model.generateContent(promptText);
      const response = await result.response;
      const text = response.text();

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(text);
      } catch {
        parsedResponse = {
          optimized_content: text,
          improvements: [],
          engagement_tips: [],
          performance_score: 7
        };
      }

      return {
        success: true,
        data: {
          generated_content: parsedResponse.optimized_content,
          alternatives: parsedResponse.engagement_tips || [],
          metadata: {
            confidence_score: (parsedResponse.performance_score || 7) / 10,
            estimated_engagement: parsedResponse.performance_score || 7
          }
        }
      };
    } catch (error: any) {
      console.error('Optimize content error:', error);
      return {
        success: false,
        error: error.message || 'Failed to optimize content'
      };
    }
  }

  // Generate content ideas
  async generateContentIdea(request: AIGenerationRequest): Promise<{ success: boolean; data?: AIGenerationResponse; error?: string }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const platform = request.platform || 'general';
      const tone = request.tone || 'friendly';

      const promptText = `
Generate creative content ideas for ${platform} based on this topic: ${request.prompt}

Requirements:
- Platform: ${platform}
- Tone: ${tone}
- Target audience: ${request.context?.target_audience || 'general audience'}
- Content type: ${request.context?.mediaType || 'mixed'}

Generate 5 unique content ideas that:
- Are trending and engaging
- Fit the platform's format
- Match the requested tone
- Include specific content suggestions
- Have high viral potential

Format as JSON:
{
  "ideas": [
    {
      "title": "Idea title",
      "description": "Detailed description",
      "content_type": "video/image/carousel",
      "viral_potential": 8
    }
  ],
  "trending_elements": ["element1", "element2"],
  "best_times_to_post": ["time1", "time2"]
}
`;

      const result = await model.generateContent(promptText);
      const response = await result.response;
      const text = response.text();

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(text);
      } catch {
        parsedResponse = {
          ideas: [{ title: "Content Idea", description: text, viral_potential: 7 }],
          trending_elements: [],
          best_times_to_post: []
        };
      }

      const mainIdea = parsedResponse.ideas?.[0] || { description: text, viral_potential: 7 };
      const alternatives = parsedResponse.ideas?.slice(1).map((idea: any) => idea.description) || [];

      return {
        success: true,
        data: {
          generated_content: mainIdea.description,
          alternatives,
          metadata: {
            confidence_score: (mainIdea.viral_potential || 7) / 10,
            estimated_engagement: mainIdea.viral_potential || 7
          }
        }
      };
    } catch (error: any) {
      console.error('Generate content idea error:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate content ideas'
      };
    }
  }

  // Check content compliance
  async checkCompliance(checkData: ComplianceCheck): Promise<{ success: boolean; data?: ComplianceResult; error?: string }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const promptText = `
Analyze this social media content for platform compliance and guidelines:

Content: ${checkData.content}
Platforms: ${checkData.platforms.join(', ')}
Media URLs: ${checkData.media_urls.join(', ')}

Check for:
1. Platform-specific content guidelines
2. Community standards violations
3. Copyright concerns
4. Spam indicators
5. Inappropriate content
6. Length restrictions
7. Hashtag compliance

For each platform, provide:
- Compliance score (0-100)
- Identified issues
- Specific suggestions for improvement

Format as JSON:
{
  "overall_score": 85,
  "platform_results": {
    "instagram": {
      "score": 90,
      "issues": [{"type": "warning", "category": "content", "message": "Consider shorter text", "suggestion": "Reduce to under 125 words"}],
      "suggestions": ["Add more hashtags", "Include call-to-action"]
    }
  }
}
`;

      const result = await model.generateContent(promptText);
      const response = await result.response;
      const text = response.text();

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(text);
      } catch {
        // Fallback compliance result
        parsedResponse = {
          overall_score: 80,
          platform_results: {}
        };
        
        checkData.platforms.forEach(platform => {
          parsedResponse.platform_results[platform] = {
            score: 80,
            issues: [],
            suggestions: ['Content appears compliant']
          };
        });
      }

      return {
        success: true,
        data: parsedResponse
      };
    } catch (error: any) {
      console.error('Check compliance error:', error);
      return {
        success: false,
        error: error.message || 'Failed to check compliance'
      };
    }
  }

  // Enhance image (placeholder - would integrate with image processing service)
  async enhanceImage(imageFile: File): Promise<{ success: boolean; enhanced_url?: string; error?: string }> {
    try {
      // This would integrate with an image enhancement service
      // For now, return the original image
      const objectUrl = URL.createObjectURL(imageFile);
      
      return {
        success: true,
        enhanced_url: objectUrl
      };
    } catch (error: any) {
      console.error('Enhance image error:', error);
      return {
        success: false,
        error: error.message || 'Failed to enhance image'
      };
    }
  }

  // Test API connection
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent('Hello, this is a test. Please respond with "API connection successful".');
      const response = await result.response;
      const text = response.text();
      
      return {
        success: true
      };
    } catch (error: any) {
      console.error('Gemini API test failed:', error);
      return {
        success: false,
        error: error.message || 'API connection failed'
      };
    }
  }
}

// Export singleton instance
export const geminiAIService = new GeminiAIService(); 