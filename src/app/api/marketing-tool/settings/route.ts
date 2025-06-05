import { NextRequest, NextResponse } from 'next/server';

interface UserSettings {
  userId: string;
  apiKeys: {
    openai?: string;
    gemini?: string;
  };
  preferences: {
    defaultPlatform?: string;
    defaultTone?: string;
  };
}

// In-memory storage for demo purposes - in production, use a proper database
const userSettings: UserSettings[] = [];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'demo-user';

    let settings = userSettings.find(s => s.userId === userId);
    
    if (!settings) {
      settings = {
        userId,
        apiKeys: {},
        preferences: {
          defaultPlatform: 'instagram',
          defaultTone: 'professional'
        }
      };
      userSettings.push(settings);
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId = 'demo-user', apiKeys, preferences } = await request.json();

    let settings = userSettings.find(s => s.userId === userId);
    
    if (!settings) {
      settings = {
        userId,
        apiKeys: {},
        preferences: {}
      };
      userSettings.push(settings);
    }

    if (apiKeys) {
      settings.apiKeys = { ...settings.apiKeys, ...apiKeys };
    }

    if (preferences) {
      settings.preferences = { ...settings.preferences, ...preferences };
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
} 