import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import OpenAI from 'openai';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const { prompt, platform, tone, contentType, hashtags } = await request.json();

    if (!prompt || !platform) {
      return NextResponse.json({ error: 'Prompt and platform are required' }, { status: 400 });
    }

    const db = getFirestore();

    // Check user's AI credits
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const plan = userData?.plan || 'free';
    
    const planLimits = {
      free: 50,
      creator: 300,
      growth: 600,
      pro: 1000
    };

    const limit = planLimits[plan as keyof typeof planLimits] || planLimits.free;
    const used = userData?.aiCreditsUsed || 0;

    if (used >= limit) {
      return NextResponse.json({ error: 'AI credits exhausted for this month' }, { status: 400 });
    }

    // Platform-specific character limits and requirements
    const platformSpecs = {
      instagram: { maxLength: 2200, style: 'engaging and visual', hashtags: true },
      facebook: { maxLength: 63206, style: 'conversational and community-focused', hashtags: false },
      tiktok: { maxLength: 2200, style: 'trendy and energetic', hashtags: true },
      youtube: { maxLength: 5000, style: 'descriptive and informative', hashtags: true },
      pinterest: { maxLength: 500, style: 'descriptive and inspirational', hashtags: false },
      snapchat: { maxLength: 250, style: 'casual and immediate', hashtags: false },
      discord: { maxLength: 2000, style: 'community and conversational', hashtags: false },
      telegram: { maxLength: 4096, style: 'informative and direct', hashtags: false }
    };

    const spec = platformSpecs[platform as keyof typeof platformSpecs] || platformSpecs.instagram;

    // Build the AI prompt
    let systemPrompt = `You are an expert social media content creator specializing in ${platform}. Create engaging, ${tone} content that is ${spec.style}.`;
    
    if (contentType) {
      systemPrompt += ` The content should be for a ${contentType}.`;
    }

    let userPrompt = `Create ${platform} content for: "${prompt}"
    
Requirements:
- Maximum ${spec.maxLength} characters
- Tone: ${tone}
- Platform: ${platform}
- Style: ${spec.style}`;

    if (spec.hashtags && hashtags) {
      userPrompt += `\n- Include relevant hashtags`;
    }

    userPrompt += `\n\nReturn only the content text, no explanations or quotes.`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const generatedContent = completion.choices[0]?.message?.content || '';

      if (!generatedContent) {
        return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
      }

      // Update user's AI credits
      await db.collection('users').doc(userId).update({
        aiCreditsUsed: used + 1,
        lastActivity: new Date()
      });

      // Log the generation for analytics
      await db.collection('ai_generations').add({
        userId,
        prompt,
        platform,
        tone,
        contentType,
        generatedContent: generatedContent.substring(0, 500), // Store first 500 chars for analytics
        tokensUsed: completion.usage?.total_tokens || 0,
        model: 'gpt-4',
        createdAt: new Date()
      });

      return NextResponse.json({
        content: generatedContent,
        creditsRemaining: limit - (used + 1),
        tokensUsed: completion.usage?.total_tokens || 0
      });

    } catch (error: any) {
      console.error('OpenAI API error:', error);
      
      // If OpenAI fails, provide a fallback response
      const fallbackContent = generateFallbackContent(prompt, platform, tone);
      
      return NextResponse.json({
        content: fallbackContent,
        creditsRemaining: limit - used, // Don't charge for fallback
        fallback: true,
        error: 'AI service temporarily unavailable, using fallback content'
      });
    }

  } catch (error) {
    console.error('Error generating AI content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const db = getFirestore();

    // Get user's AI usage history
    const generationsSnapshot = await db.collection('ai_generations')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    const generations = generationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
    }));

    // Get current usage
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const plan = userData?.plan || 'free';
    
    const planLimits = {
      free: 50,
      creator: 300,
      growth: 600,
      pro: 1000
    };

    const limit = planLimits[plan as keyof typeof planLimits] || planLimits.free;
    const used = userData?.aiCreditsUsed || 0;

    return NextResponse.json({
      generations,
      usage: {
        used,
        limit,
        remaining: Math.max(0, limit - used),
        plan
      }
    });

  } catch (error) {
    console.error('Error fetching AI usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateFallbackContent(prompt: string, platform: string, tone: string): string {
  const templates = {
    instagram: {
      professional: `📈 ${prompt}\n\nKey insights:\n• [Add your main point]\n• [Add supporting detail]\n• [Add call to action]\n\n#business #${platform}`,
      casual: `Hey everyone! 👋\n\n${prompt}\n\nWhat do you think? Let me know in the comments! 💭\n\n#${platform} #community`,
      creative: `✨ ${prompt} ✨\n\nImagine the possibilities...\n🌟 [Your creative angle]\n🎯 [Your unique approach]\n\n#creativity #${platform}`,
      friendly: `Hi friends! 😊\n\n${prompt}\n\nHope this brightens your day! Share your thoughts below 👇\n\n#friends #${platform}`
    },
    facebook: {
      professional: `${prompt}\n\nThis is an important topic that affects many of us. Here are some key points to consider:\n\n• [Main insight]\n• [Supporting detail]\n• [Action step]\n\nWhat are your thoughts on this?`,
      casual: `${prompt}\n\nJust wanted to share this with you all! It really got me thinking. What's your take on this? Would love to hear your perspectives in the comments!`,
      creative: `${prompt}\n\n🎨 Here's my creative take on this:\n\nSometimes the most innovative solutions come from looking at things differently. What creative approaches have you tried?\n\nShare your ideas below!`,
      friendly: `${prompt}\n\nHope everyone is having a great day! This topic has been on my mind lately, and I'd love to connect with others who share similar interests. Let's chat!`
    },
    default: {
      professional: `${prompt}\n\nKey considerations:\n• [Important point]\n• [Supporting detail]\n• [Next steps]`,
      casual: `${prompt}\n\nWhat do you think about this? Would love to hear your thoughts!`,
      creative: `${prompt}\n\n✨ Let's explore new possibilities together!`,
      friendly: `${prompt}\n\nHope this is helpful! Let me know what you think! 😊`
    }
  };

  const platformTemplates = templates[platform as keyof typeof templates] || templates.default;
  const template = platformTemplates[tone as keyof typeof platformTemplates] || platformTemplates.casual;

  return template;
} 