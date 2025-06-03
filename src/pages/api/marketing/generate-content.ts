import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { PythonBridge } from '@/lib/python-bridge';

// Middleware to verify JWT token
function verifyToken(req: NextApiRequest): { user_id: string; email: string; tier: string } | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Tier-based feature access control
const TIER_FEATURES = {
  'free': ['media_library', 'smart_galleries', 'story_formatting'],
  'creator': ['media_library', 'smart_galleries', 'story_formatting', 'highlight_reels', 'custom_audio'],
  'pro': ['media_library', 'smart_galleries', 'story_formatting', 'highlight_reels', 'custom_audio', 'analytics', 'exports'],
  'enterprise': ['all']
};

function hasFeatureAccess(userTier: string, feature: string): boolean {
  const tierFeatures = TIER_FEATURES[userTier as keyof typeof TIER_FEATURES] || [];
  return tierFeatures.includes('all') || tierFeatures.includes(feature);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify authentication
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { content_type, prompt, media_files, settings } = req.body;

    // Check feature access
    if (!hasFeatureAccess(user.tier, content_type)) {
      return res.status(403).json({ 
        message: 'Feature not available in your current tier',
        upgrade_required: true,
        current_tier: user.tier
      });
    }

    // Use Python bridge to generate content
    const pythonBridge = PythonBridge.getInstance();
    const generatedContent = await pythonBridge.generateMarketingContent({
      content_type,
      prompt,
      media_files,
      settings: {
        ...settings,
        user_id: user.user_id,
        user_tier: user.tier
      }
    });

    res.status(200).json({
      success: true,
      content: generatedContent,
      user_tier: user.tier,
      credits_used: 1
    });

  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({ 
      message: 'Content generation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 