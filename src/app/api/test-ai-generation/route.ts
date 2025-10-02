import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 TESTING AI GENERATION WITH GENKIT (ORIGINAL APPROACH)...');
    
    const { description, difficulty } = await request.json();
    
    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    console.log('🔍 Testing AI generation with:', { description, difficulty });
    
    // Check if we have API key
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.STORY_TEXT_KEY;
    if (!apiKey) {
      throw new Error('No API key available');
    }
    
    console.log('🔍 API key available, using Genkit for AI generation...');
    
    // Use Genkit with the original approach that was working
    console.log('🔍 Generating image with Genkit using imagen-4.0-generate-preview-06-06...');
    
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-generate-preview-06-06',
      prompt: `Create a detailed black and white line art illustration for a children's coloring book.

Subject: ${description}
Difficulty: ${difficulty}

Requirements:
- Professional coloring book style with clean, bold black outlines
- NO COLORS - only black lines on white background
- No text, no words, no letters, no numbers
- Suitable for children to color
- Child-friendly design with clear, simple lines
- Leave large empty spaces for coloring`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    
    if (!media?.url) {
      throw new Error("AI image generation failed to return a valid URL");
    }
    
    console.log('✅ AI image generation successful:', media.url);
    
    return NextResponse.json({
      success: true,
      imageUrl: media.url,
      message: 'AI image generation successful with Genkit'
    });
    
  } catch (error) {
    console.error('❌ AI generation test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
