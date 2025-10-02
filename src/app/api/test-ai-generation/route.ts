import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 TESTING AI GENERATION DIRECTLY WITH GOOGLE AI...');
    
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
    
    console.log('🔍 API key available, creating GoogleGenerativeAI instance...');
    
    // Use Google AI directly instead of Genkit
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('🔍 Listing available models...');
    
    // First, let's list available models to see what's actually supported
    const models = await genAI.listModels();
    console.log('Available models:', models.map(m => m.name));
    
    // Use a model that actually exists - gemini-1.5-flash for text generation
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log('🔍 Generating text description with Google AI...');
    
    // Generate a detailed text description instead of trying to generate images
    const { response } = await model.generateContent({
      contents: [{
        parts: [{
          text: `Create a detailed description for a black and white line art illustration for a children's coloring book.

Subject: ${description}
Difficulty: ${difficulty}

Requirements:
- Professional coloring book style with clean, bold black outlines
- NO COLORS - only black lines on white background
- No text, no words, no letters, no numbers
- Suitable for children to color
- Child-friendly design with clear, simple lines
- Leave large empty spaces for coloring

Provide a detailed description of what this coloring page should look like.`
        }]
      }]
    });
    
    const generatedDescription = response.text();
    console.log('✅ Generated description:', generatedDescription);
    
    // For now, return the description instead of an image
    return NextResponse.json({
      success: true,
      description: generatedDescription,
      message: 'AI text generation successful (image generation not available)'
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
