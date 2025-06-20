import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '../config/database';
import { env } from '../config/environment';
import { authenticateToken } from '../middleware/auth';
import { LoginRequest, SignupRequest, AuthResponse, AuthenticatedRequest, UserPlan } from '../types';
import { logger } from '../config/logger';

const router = Router();

// Validation rules
const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
];

const signupValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('displayName').trim().isLength({ min: 2 })
];

// Generate JWT tokens
const generateTokens = (userId: string, email: string, plan: string) => {
  const accessToken = jwt.sign(
    { userId, email, plan },
    env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  const refreshToken = jwt.sign(
    { userId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
};

// Helper function to format user data for frontend
const formatUserResponse = (user: any) => {
  return {
    id: user.id,
    email: user.email,
    name: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    displayName: user.displayName,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    avatar: user.avatar,
    avatar_url: user.avatar,
    subscription_tier: user.plan.toLowerCase() as 'free' | 'creator' | 'growth' | 'pro' | 'payg',
    subscription_status: user.subscriptionStatus || 'inactive',
    stripe_customer_id: user.stripeCustomerId,
    subscription_expires: user.subscriptionExpires?.toISOString(),
    created_at: user.createdAt.toISOString(),
    updated_at: user.updatedAt?.toISOString() || user.createdAt.toISOString(),
    last_login: user.lastLoginAt?.toISOString(),
    email_verified: user.emailVerified || false,
    usage_limits: {
      linked_accounts: 0,
      max_linked_accounts: user.plan === 'PAYG' ? 5 : user.plan === 'CREATOR' ? 3 : user.plan === 'GROWTH' ? 7 : user.plan === 'PRO' ? 10 : 1,
      ai_credits: 0,
      max_ai_credits: user.plan === 'PAYG' ? -1 : user.plan === 'CREATOR' ? 150 : user.plan === 'GROWTH' ? 400 : user.plan === 'PRO' ? 750 : 50,
      scheduled_posts: 0,
      max_scheduled_posts: user.plan === 'PAYG' ? -1 : user.plan === 'CREATOR' ? 100 : user.plan === 'GROWTH' ? 300 : user.plan === 'PRO' ? -1 : 10,
      media_storage_mb: 0,
      max_media_storage_mb: user.plan === 'PAYG' ? -1 : user.plan === 'CREATOR' ? 5120 : user.plan === 'GROWTH' ? 15360 : user.plan === 'PRO' ? 51200 : 1024
    },
    plan_features: {
      basic_content_tools: true,
      media_library: true,
      smart_gallery: true,
      post_formatting: true,
      basic_video_tools: true,
      advanced_content: user.plan !== 'FREE' && user.plan !== 'CREATOR',
      analytics: user.plan === 'FREE' ? 'none' : user.plan === 'CREATOR' ? 'enhanced' : 'advanced',
      team_collaboration: user.plan === 'PRO',
      custom_branding: user.plan === 'GROWTH' || user.plan === 'PRO',
      api_access: user.plan === 'PAYG' || user.plan === 'PRO',
      priority_support: user.plan === 'GROWTH' || user.plan === 'PRO'
    }
  };
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginValidation, async (req: Request<{}, AuthResponse, LoginRequest>, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.plan);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Return response in expected format
    res.json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: formatUserResponse(user),
        expires_in: 24 * 60 * 60 // 24 hours in seconds
      }
    });

    logger.info(`User logged in: ${user.email}`);
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               displayName:
 *                 type: string
 *                 minLength: 2
 *               subscription_tier:
 *                 type: string
 *                 enum: [free, creator, growth, pro, payg]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: User already exists
 */
router.post('/signup', signupValidation, async (req: Request<{}, AuthResponse, SignupRequest>, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        details: errors.array()
      });
    }

    const { email, password, displayName, subscription_tier } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Determine plan from subscription_tier
    let plan: UserPlan = 'FREE';
    if (subscription_tier) {
      plan = subscription_tier.toUpperCase() as UserPlan;
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        displayName,
        plan
      }
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.plan);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    // Return response in expected format
    res.status(201).json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: formatUserResponse(user),
        expires_in: 24 * 60 * 60 // 24 hours in seconds
      }
    });

    logger.info(`New user registered: ${user.email}`);
  } catch (error) {
    logger.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User ID not found in token'
      });
    }

    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: formatUserResponse(user)
    });

  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user data'
    });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // In a real app, you might want to invalidate the refresh token
    // For now, we'll just return success (client should remove token)
    res.json({
      success: true
    });

    logger.info(`User logged out: ${req.user?.email}`);
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

export default router; 