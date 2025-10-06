/**
 * AI-based coloring page converter that uses AI to understand and convert images
 * Not just filters - actual AI analysis and generation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Convert image to coloring page using AI analysis and generation
 */
export async function convertToColoringPageWithAI(imageDataUri: string): Promise<string> {
  console.log('🤖 Converting to coloring page using AI analysis...');
  
  const apiKey = process.env.IMAGE_TO_LINE_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('AI API key required for coloring page conversion');
  }

  try {
    // Step 1: AI analyzes the image and creates detailed description
    const imageAnalysis = await analyzeImageForColoringPage(imageDataUri, apiKey);
    console.log('📝 AI Image Analysis:', imageAnalysis);
    
    // Step 2: AI generates coloring page instructions
    const coloringInstructions = await generateColoringPageInstructions(imageAnalysis, apiKey);
    console.log('📋 AI Coloring Instructions:', coloringInstructions);
    
    // Step 3: Use AI to create the actual coloring page
    const coloringPage = await generateColoringPageWithAI(imageAnalysis, coloringInstructions, apiKey);
    console.log('🎨 AI Generated Coloring Page');
    
    return coloringPage;
    
  } catch (error) {
    console.error('❌ AI coloring page conversion failed:', error);
    throw error;
  }
}

/**
 * AI analyzes the image to understand its structure for coloring page conversion
 */
async function analyzeImageForColoringPage(imageDataUri: string, apiKey: string): Promise<string> {
  console.log('🔍 AI analyzing image structure...');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 500,
    }
  });

  // Extract image data
  const [meta, base64Data] = imageDataUri.split(',');
  const mimeMatch = meta?.match(/^data:(.*?);base64$/);
  const mimeType = mimeMatch?.[1] || 'image/jpeg';

  const prompt = `Analyze this image in detail for creating a coloring page. Focus on:

1. MAIN SUBJECT: What is the primary subject/character/object?
2. STRUCTURAL ELEMENTS: What are the key shapes, forms, and outlines?
3. COMPOSITION: How is the image framed and positioned?
4. DETAILS: What important details should be preserved as outlines?
5. BACKGROUND: What background elements should be included or simplified?
6. COLORING AREAS: What areas would be good for coloring (faces, clothing, objects)?

Provide a detailed structural analysis that will help create a proper coloring page with clean outlines and fillable areas.`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    }
  ]);

  const response = await result.response;
  const analysis = response.text();
  
  console.log('✅ AI analysis completed');
  return analysis;
}

/**
 * AI generates specific instructions for creating the coloring page
 */
async function generateColoringPageInstructions(imageAnalysis: string, apiKey: string): Promise<string> {
  console.log('📋 AI generating coloring page instructions...');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 400,
    }
  });

  const prompt = `Based on this image analysis, create specific instructions for generating a coloring page:

${imageAnalysis}

INSTRUCTIONS FOR COLORING PAGE GENERATION:
1. OUTLINE STYLE: What type of outlines should be used (thick, thin, detailed)?
2. FILLABLE AREAS: What areas should be left white for coloring?
3. DETAIL LEVEL: What details should be preserved vs. simplified?
4. BACKGROUND: How should the background be handled?
5. SPECIAL EFFECTS: Any special techniques for this specific image?

Provide clear, actionable instructions for creating a proper coloring page.`;

  const result = await model.generateContent([prompt]);
  const response = await result.response;
  const instructions = response.text();
  
  console.log('✅ AI instructions generated');
  return instructions;
}

/**
 * Use AI to generate the actual coloring page
 */
async function generateColoringPageWithAI(
  imageAnalysis: string, 
  coloringInstructions: string, 
  apiKey: string
): Promise<string> {
  console.log('🎨 AI generating coloring page...');
  
  try {
    // Try Imagen first for actual image generation
    const imagenResult = await generateWithImagen(imageAnalysis, coloringInstructions, apiKey);
    if (imagenResult) {
      return imagenResult;
    }
    
    // Fallback to other AI approaches
    throw new Error('Imagen generation failed, trying alternative approaches');
    
  } catch (error) {
    console.log('🔄 Imagen failed, trying alternative AI approach...');
    
    // Alternative: Use AI-guided processing
    return await generateWithAIGuidance(imageAnalysis, coloringInstructions, apiKey);
  }
}

/**
 * Generate coloring page using Imagen
 */
async function generateWithImagen(
  imageAnalysis: string, 
  coloringInstructions: string, 
  apiKey: string
): Promise<string> {
  console.log('🎨 Using Imagen for coloring page generation...');
  
  try {
    const imagenEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-preview-06-06:predict?key=${apiKey}`;
    
    const prompt = `Create a black and white line art coloring page based on this analysis:

${imageAnalysis}

Coloring Page Requirements:
${coloringInstructions}

SPECIFIC REQUIREMENTS:
- Pure black lines on white background
- Clean, simple outlines suitable for children
- Large fillable white areas for coloring
- Preserve the main subject and composition
- No shading, just bold outlines
- Child-friendly coloring page style
- Remove any text or letters
- Make it look like a real coloring book page`;

    const imagenPayload = {
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "ASPECT_RATIO_1_1",
        safetyFilterLevel: "BLOCK_ONLY_HIGH",
        personGeneration: "ALLOW_ADULT"
      }
    };
    
    const response = await fetch(imagenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(imagenPayload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Imagen API failed: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    const generatedImage = result.predictions?.[0]?.bytesBase64Encoded;
    
    if (!generatedImage) {
      throw new Error('Imagen did not return an image');
    }
    
    console.log('✅ Imagen coloring page generation successful');
    return `data:image/png;base64,${generatedImage}`;
    
  } catch (error) {
    console.error('❌ Imagen generation failed:', error);
    throw error;
  }
}

/**
 * Generate coloring page using AI-guided approach
 */
async function generateWithAIGuidance(
  imageAnalysis: string, 
  coloringInstructions: string, 
  apiKey: string
): Promise<string> {
  console.log('🤖 Using AI-guided approach for coloring page...');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2000,
    }
  });

  const prompt = `Create a detailed SVG-style line art description for a coloring page based on this analysis:

${imageAnalysis}

Instructions:
${coloringInstructions}

Create a detailed description of the line art that can be used to generate a coloring page. Focus on:
- Clean black outlines
- Fillable white areas
- Proper coloring page structure
- Child-friendly design

Provide a detailed description that captures the essence of a coloring book page.`;

  const result = await model.generateContent([prompt]);
  const response = await result.response;
  const description = response.text();
  
  console.log('📝 AI-generated coloring page description:', description);
  
  // For now, return the description as a text response
  // In a full implementation, this would be used to generate actual line art
  throw new Error(`AI analysis completed but image generation needs additional implementation. Description: ${description}`);
}

/**
 * Alternative AI approach using different model
 */
export async function convertWithAlternativeAI(imageDataUri: string): Promise<string> {
  console.log('🔄 Using alternative AI approach...');
  
  const apiKey = process.env.IMAGE_TO_LINE_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('AI API key required');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro", // Try different model
      generationConfig: {
        temperature: 0.0,
        maxOutputTokens: 1000,
      }
    });

    // Extract image data
    const [meta, base64Data] = imageDataUri.split(',');
    const mimeMatch = meta?.match(/^data:(.*?);base64$/);
    const mimeType = mimeMatch?.[1] || 'image/jpeg';

    const prompt = `Transform this image into a black and white line art coloring page. 

Create clean outlines and fillable areas suitable for children to color. Focus on:
- Simple, bold black lines
- Large white areas for coloring
- Preserve the main subject
- Remove complex details
- Make it coloring-book style`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);

    const response = await result.response;
    
    // Check if we got an image response
    const imageData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    
    if (imageData) {
      console.log('✅ Alternative AI approach returned image');
      return `data:${imageData.mimeType};base64,${imageData.data}`;
    } else {
      throw new Error('AI did not return image data');
    }
    
  } catch (error) {
    console.error('❌ Alternative AI approach failed:', error);
    throw error;
  }
}
