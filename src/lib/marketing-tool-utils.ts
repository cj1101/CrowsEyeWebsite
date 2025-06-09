import { DEFAULT_HASHTAGS, PLATFORM_INSTRUCTIONS } from './marketing-tool-constants';
import { PlatformType, ToneType } from '@/types/marketing-tool';

/**
 * Generate hashtags for a given topic
 */
export function generateHashtags(topic: string): string {
  if (!topic.trim()) return '';

  const topicLower = topic.toLowerCase();
  const hashtags = [`#${topic.toLowerCase().replace(/\s+/g, '')}`];

  // Add relevant hashtags based on topic
  if (topicLower.includes('business') || topicLower.includes('company')) {
    hashtags.push(...DEFAULT_HASHTAGS.business);
  } else if (topicLower.includes('tech') || topicLower.includes('software')) {
    hashtags.push(...DEFAULT_HASHTAGS.technology);
  } else if (topicLower.includes('life') || topicLower.includes('wellness')) {
    hashtags.push(...DEFAULT_HASHTAGS.lifestyle);
  } else if (topicLower.includes('learn') || topicLower.includes('education')) {
    hashtags.push(...DEFAULT_HASHTAGS.education);
  } else {
    hashtags.push(...DEFAULT_HASHTAGS.marketing);
  }

  return hashtags.slice(0, 8).join(' ');
}

/**
 * Get platform-specific content instructions
 */
export function getPlatformInstructions(platform: PlatformType): string {
  return PLATFORM_INSTRUCTIONS[platform] || "Create engaging social media content";
}

/**
 * Format content for a specific platform
 */
export function formatContentForPlatform(content: string, platform: PlatformType, maxLength?: number): string {
  const platformLimits = {
    instagram: 2200,
    facebook: 63206,
    bluesky: 300,
    snapchat: 80,
    pinterest: 500,
    tiktok: 2200,
    youtube: 5000,
  };

  const limit = maxLength || platformLimits[platform] || 2200;
  
  if (content.length <= limit) {
    return content;
  }

  // Truncate content while preserving word boundaries
  const truncated = content.substring(0, limit - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

/**
 * Validate post content
 */
export function validatePostContent(content: string, platforms: string[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!content.trim()) {
    errors.push('Content cannot be empty');
  }

  if (platforms.length === 0) {
    errors.push('At least one platform must be selected');
  }

  // Check platform-specific limits
  platforms.forEach(platform => {
    const formatted = formatContentForPlatform(content, platform as PlatformType);
    if (formatted.endsWith('...')) {
      errors.push(`Content exceeds character limit for ${platform}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Calculate engagement percentage
 */
export function calculateEngagementPercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

/**
 * Get status color class
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'draft': return 'bg-gray-600 text-gray-100';
    case 'scheduled': return 'bg-yellow-600 text-yellow-100';
    case 'published': return 'bg-green-600 text-green-100';
    case 'failed': return 'bg-red-600 text-red-100';
    default: return 'bg-gray-600 text-gray-100';
  }
}

/**
 * Get platform color class
 */
export function getPlatformColor(platform: string): string {
  const platformGradients = {
    instagram: 'from-purple-500 to-pink-500',
    facebook: 'from-blue-600 to-blue-800',
    tiktok: 'from-black to-red-600',
    youtube: 'from-red-500 to-red-700',
    bluesky: 'from-sky-400 to-blue-500',
    snapchat: 'from-yellow-400 to-yellow-600',
    pinterest: 'from-red-600 to-pink-600',
  };
  
  return platformGradients[platform as keyof typeof platformGradients] || 'from-gray-500 to-gray-600';
}

/**
 * Debounce function for search/input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if user has API keys configured
 */
export function hasApiKeysConfigured(apiKeys: { openai?: string; gemini?: string }): boolean {
  return !!(apiKeys.openai || apiKeys.gemini);
} 