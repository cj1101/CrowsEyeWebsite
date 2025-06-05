import { Platform, ToneType, ContentTemplate } from '@/types/marketing-tool';

// Platform configurations
export const PLATFORMS: Platform[] = [
  { id: 'instagram', name: 'Instagram', enabled: true, maxLength: 2200 },
  { id: 'facebook', name: 'Facebook', enabled: false, maxLength: 63206 },
  { id: 'twitter', name: 'Twitter/X', enabled: false, maxLength: 280 },
  { id: 'linkedin', name: 'LinkedIn', enabled: false, maxLength: 3000 },
  { id: 'tiktok', name: 'TikTok', enabled: false, maxLength: 2200 },
  { id: 'youtube', name: 'YouTube', enabled: false, maxLength: 5000 },
];

// Available tones for content generation
export const TONES: ToneType[] = [
  'professional',
  'casual',
  'friendly',
  'formal',
  'humorous',
  'inspiring'
];

// Platform-specific instructions for AI generation
export const PLATFORM_INSTRUCTIONS = {
  instagram: "Create an engaging Instagram post with relevant hashtags. Keep it visual and inspiring.",
  facebook: "Create a Facebook post that encourages engagement and community interaction.",
  twitter: "Create a concise Twitter/X post that's under 280 characters and includes relevant hashtags.",
  linkedin: "Create a professional LinkedIn post that adds value and demonstrates expertise.",
  tiktok: "Create a TikTok caption that's trendy, engaging, and includes popular hashtags.",
  youtube: "Create a compelling YouTube video description with SEO-friendly keywords."
};

// Content templates
export const CONTENT_TEMPLATES: ContentTemplate[] = [
  {
    name: 'Product Launch',
    template: '🚀 Exciting news! We\'re thrilled to announce {product}! \n\n✨ Key features:\n• Feature 1\n• Feature 2\n• Feature 3\n\nReady to get started? Check it out! 👇\n\n#productlaunch #innovation #excited',
    category: 'business'
  },
  {
    name: 'Behind the Scenes',
    template: '👀 Behind the scenes at {company}! \n\nHere\'s a sneak peek at how we {process}. It\'s amazing to see the dedication and creativity that goes into every {output}!\n\n#behindthescenes #teamwork #process #passion',
    category: 'engagement'
  },
  {
    name: 'Motivational Quote',
    template: '💪 "{quote}" \n\nThis quote perfectly captures the spirit of {topic}. What motivates you to keep pushing forward?\n\n#motivation #inspiration #success #mindset #growth',
    category: 'inspiration'
  },
  {
    name: 'Tutorial/Tips',
    template: '📚 Pro Tip: {tip_title}\n\nHere\'s how to {action}:\n\n1️⃣ Step 1\n2️⃣ Step 2  \n3️⃣ Step 3\n\nTry this out and let us know how it works for you! 💬\n\n#tips #tutorial #howto #learning',
    category: 'educational'
  }
];

// Platform colors for UI
export const PLATFORM_COLORS = {
  instagram: 'from-pink-600 to-purple-600',
  facebook: 'from-blue-600 to-blue-700',
  twitter: 'from-sky-500 to-blue-600',
  linkedin: 'from-blue-700 to-indigo-700',
  tiktok: 'from-black to-gray-800',
  youtube: 'from-red-600 to-red-700'
};

// Default hashtags for different topics
export const DEFAULT_HASHTAGS = {
  marketing: ['#marketing', '#socialmedia', '#content', '#business', '#growth'],
  technology: ['#tech', '#innovation', '#digital', '#startup', '#future'],
  lifestyle: ['#lifestyle', '#inspiration', '#motivation', '#wellness', '#life'],
  business: ['#business', '#entrepreneur', '#success', '#leadership', '#strategy'],
  education: ['#education', '#learning', '#tips', '#knowledge', '#skills']
};

// API endpoints
export const API_ENDPOINTS = {
  GENERATE_CONTENT: '/api/marketing-tool/generate-content',
  POSTS: '/api/marketing-tool/posts',
  SETTINGS: '/api/marketing-tool/settings',
  ANALYTICS: '/api/marketing-tool/analytics'
};

// Default user settings
export const DEFAULT_USER_SETTINGS = {
  apiKeys: {},
  preferences: {
    defaultPlatform: 'instagram',
    defaultTone: 'professional'
  }
}; 