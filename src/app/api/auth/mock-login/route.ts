import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Mock authentication endpoint called');
    
    const body = await request.json();
    const { email, password } = body;
    
    // Simple validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    console.log('📧 Login attempt for:', email);
    
    // Mock user data - in development, allow any email/password combination
    const mockUser = {
      id: '1',
      email: email,
      name: email.split('@')[0] || 'User',
      avatar_url: null,
      subscription_tier: 'pro', // Give pro access for testing
      subscription_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      email_verified: true,
      usage_limits: {
        linked_accounts: 5,
        max_linked_accounts: 10,
        ai_credits: 500,
        max_ai_credits: 1000,
        scheduled_posts: 50,
        max_scheduled_posts: 100,
        media_storage_mb: 500,
        max_media_storage_mb: 1000
      },
      plan_features: {
        basic_content_tools: true,
        media_library: true,
        smart_gallery: true,
        post_formatting: true,
        basic_video_tools: true,
        advanced_content: true,
        analytics: 'enhanced',
        team_collaboration: true,
        custom_branding: true,
        api_access: true,
        priority_support: true
      }
    };
    
    // Generate a mock JWT token
    const secret = process.env.JWT_SECRET || 'mock-secret-for-local-dev';
    const accessToken = jwt.sign(
      { 
        sub: email,
        user_id: mockUser.id,
        subscription_tier: mockUser.subscription_tier,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      },
      secret
    );
    
    const refreshToken = jwt.sign(
      { 
        sub: email,
        user_id: mockUser.id,
        subscription_tier: mockUser.subscription_tier,
        type: 'refresh',
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
      },
      secret
    );
    
    console.log('✅ Mock authentication successful for:', email);
    
    return NextResponse.json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: mockUser,
        expires_in: 7 * 24 * 60 * 60 // 7 days in seconds
      }
    });
    
  } catch (error) {
    console.error('❌ Mock authentication error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      },
      { status: 500 }
    );
  }
} 