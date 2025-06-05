import { NextRequest, NextResponse } from 'next/server';

interface Post {
  id: string;
  userId: string;
  content: string;
  platform: string;
  scheduledTime?: string;
  status: 'draft' | 'scheduled' | 'published';
  createdAt: string;
}

// In-memory storage for demo purposes - in production, use a proper database
const posts: Post[] = [];

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get the user ID from authentication
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'demo-user';

    const userPosts = posts.filter(post => post.userId === userId);
    
    return NextResponse.json({ posts: userPosts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content, platform, scheduledTime, userId = 'demo-user', status = 'draft' } = await request.json();

    if (!content || !platform) {
      return NextResponse.json(
        { error: 'Content and platform are required' },
        { status: 400 }
      );
    }

    const newPost: Post = {
      id: generateId(),
      userId,
      content,
      platform,
      scheduledTime,
      status,
      createdAt: new Date().toISOString(),
    };

    posts.push(newPost);

    return NextResponse.json({ post: newPost });
  } catch (error) {
    console.error('Error saving post:', error);
    return NextResponse.json(
      { error: 'Failed to save post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { postId, userId = 'demo-user' } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const postIndex = posts.findIndex(post => post.id === postId && post.userId === userId);
    
    if (postIndex === -1) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    posts.splice(postIndex, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
} 