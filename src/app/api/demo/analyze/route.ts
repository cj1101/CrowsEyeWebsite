import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { mediaType, fileName } = await request.json()
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate realistic AI analysis based on media type
    const analyses = {
      image: [
        "This image showcases vibrant colors and excellent composition, perfect for social media engagement. The lighting creates a warm, inviting atmosphere that would resonate well with lifestyle and travel audiences.",
        "The visual elements in this image suggest a professional, modern aesthetic. The color palette and composition are ideal for brand storytelling and would perform well across multiple social platforms.",
        "This image captures authentic moments with natural lighting and compelling visual interest. The composition follows the rule of thirds and would generate strong engagement on visual-first platforms.",
        "The image demonstrates strong visual hierarchy and emotional appeal. The color grading and composition suggest this would be perfect for lifestyle, fashion, or travel content marketing.",
        "This photograph shows excellent technical quality with balanced exposure and appealing color saturation. The subject matter and composition are well-suited for social media marketing campaigns."
      ],
      video: [
        "This video content shows dynamic movement and engaging visual storytelling. The pacing and composition are well-suited for social media platforms, particularly for capturing and maintaining viewer attention.",
        "The video demonstrates strong narrative flow with compelling visual elements. The editing style and content structure are optimized for social media consumption and audience engagement.",
        "This video content features excellent production quality with smooth transitions and engaging visual elements. The format and style are perfect for modern social media marketing strategies.",
        "The video showcases professional-quality content with strong visual appeal. The pacing and composition are ideal for social media platforms and would likely generate high engagement rates.",
        "This video content demonstrates effective storytelling techniques with compelling visual elements. The production quality and style are well-suited for brand marketing and audience engagement."
      ]
    }
    
    const typeAnalyses = analyses[mediaType as keyof typeof analyses] || analyses.image
    const randomAnalysis = typeAnalyses[Math.floor(Math.random() * typeAnalyses.length)]
    
    return NextResponse.json({
      success: true,
      analysis: randomAnalysis,
      confidence: Math.floor(Math.random() * 20) + 80, // 80-99% confidence
      processingTime: Math.floor(Math.random() * 1000) + 1200 // 1.2-2.2 seconds
    })
    
  } catch (error) {
    console.error('Demo analysis error:', error)
    return NextResponse.json(
      { success: false, error: 'Analysis failed' },
      { status: 500 }
    )
  }
} 