import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { prompt, platform = 'instagram', tone = 'professional', apiKeys } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Platform-specific instructions
    const platformInstructions = {
      instagram: "Create an engaging Instagram post with relevant hashtags. Keep it visual and inspiring.",
      facebook: "Create a Facebook post that encourages engagement and community interaction.",
      twitter: "Create a concise Twitter/X post that's under 280 characters and includes relevant hashtags.",
      linkedin: "Create a professional LinkedIn post that adds value and demonstrates expertise.",
      tiktok: "Create a TikTok caption that's trendy, engaging, and includes popular hashtags.",
      youtube: "Create a compelling YouTube video description with SEO-friendly keywords."
    };

    const enhancedPrompt = `
    Platform: ${platform}
    Tone: ${tone}
    Instructions: ${platformInstructions[platform as keyof typeof platformInstructions] || "Create engaging social media content"}
    
    User Request: ${prompt}
    
    Please create compelling social media content that fits the platform and tone specified.
    `;

    let generatedContent = '';

    // Try OpenAI first if API key is provided
    if (apiKeys?.openai) {
      try {
        const openai = new OpenAI({
          apiKey: apiKeys.openai,
        });

        const response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a professional social media content creator and marketing expert.' },
            { role: 'user', content: enhancedPrompt }
          ],
          max_tokens: 500,
          temperature: 0.7,
        });

        generatedContent = response.choices[0]?.message?.content?.trim() || '';
      } catch (error) {
        console.error('OpenAI API error:', error);
      }
    }

    // Try Gemini as fallback if OpenAI failed and Gemini key is available
    if (!generatedContent && apiKeys?.gemini) {
      try {
        const genAI = new GoogleGenerativeAI(apiKeys.gemini);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        
        const result = await model.generateContent(enhancedPrompt);
        const response = await result.response;
        generatedContent = response.text().trim();
      } catch (error) {
        console.error('Gemini API error:', error);
      }
    }

    // Fallback to template-based generation if AI APIs are unavailable
    if (!generatedContent) {
      generatedContent = generateTemplateContent(prompt, platform, tone);
    }

    return NextResponse.json({ content: generatedContent });
  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

function generateTemplateContent(prompt: string, platform: string, _tone: string): string {
  const templates = {
    instagram: [
      `🌟 ${prompt} ✨\n\n#inspiration #motivation #success #growth #mindset`,
      `✨ Ready to transform your ${prompt}? Let's dive in! 💫\n\n#transformation #growth #success`,
      `💡 ${prompt} - because every great journey starts with a single step! 🚀\n\n#journey #progress #goals`
    ],
    facebook: [
      `Exciting news about ${prompt}! 🎉\n\nWhat are your thoughts on this? Share your experiences in the comments below! 👇`,
      `Let's talk about ${prompt}! 💬\n\nI'd love to hear your perspective on this topic. Comment below and let's start a conversation!`,
      `🌟 ${prompt} 🌟\n\nTag a friend who needs to see this! Share your thoughts and let's discuss.`
    ],
    twitter: [
      `🚀 ${prompt} #innovation #tech #growth`,
      `💡 ${prompt} - what's your take? #discussion #insights`,
      `✨ ${prompt} 🌟 #inspiration #motivation`
    ],
    linkedin: [
      `Professional insight: ${prompt}\n\nIn today's rapidly evolving business landscape, this topic deserves our attention. What has been your experience with this?\n\n#professional #business #growth #leadership`,
      `Industry perspective on ${prompt}:\n\nAs professionals, we must stay informed about developments in our field. I'd be interested to hear your thoughts on this matter.\n\n#industry #insights #professional #networking`,
      `Thought leadership: ${prompt}\n\nThis is a critical consideration for anyone in our industry. How do you approach this challenge in your organization?\n\n#thoughtleadership #business #strategy`
    ]
  };

  const templateList = templates[platform as keyof typeof templates] || templates.instagram;
  const randomIndex = Math.floor(Math.random() * templateList.length);
  return templateList[randomIndex];
} 