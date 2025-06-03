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

function hasAnalyticsAccess(userTier: string): boolean {
  return ['pro', 'enterprise'].includes(userTier);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify authentication
  const user = verifyToken(req);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Check if user has analytics access
  if (!hasAnalyticsAccess(user.tier)) {
    return res.status(403).json({ 
      message: 'Analytics feature requires Pro or Enterprise tier',
      upgrade_required: true,
      current_tier: user.tier
    });
  }

  try {
    const { start_date, end_date } = req.query;

    const pythonBridge = PythonBridge.getInstance();
    const analytics = await pythonBridge.getAnalytics(user.user_id, {
      start: start_date as string,
      end: end_date as string
    });

    res.status(200).json({
      success: true,
      analytics,
      user_tier: user.tier
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      message: 'Failed to get analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 