/**
 * SINGLE AI Image Converter - No fallbacks, no filters, just AI
 * This is the ONLY file for image-to-coloring conversion
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Convert image to coloring page using ONLY AI - no fallbacks
 */
export async function convertImageToColoringPage(imageDataUri: string): Promise<string> {
  console.log('🤖 AI ONLY: Converting image to coloring page...');
  
  const apiKey = process.env.IMAGE_TO_LINE_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('AI API key required');
  }

  try {
    // Step 1: Use Gemini to analyze the image
    const imageDescription = await analyzeImageWithGemini(imageDataUri, apiKey);
    console.log('📝 AI Analysis:', imageDescription);
    
    // Step 2: Use Imagen to generate coloring page
    const coloringPage = await generateColoringPageWithImagen(imageDescription, apiKey);
    console.log('🎨 AI Generated Coloring Page');
    
    return coloringPage;
    
  } catch (error) {
    console.error('❌ AI conversion failed:', error);
    throw new Error(`AI conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Analyze image with Gemini
 */
async function analyzeImageWithGemini(imageDataUri: string, apiKey: string): Promise<string> {
  console.log('🔍 Analyzing image with Gemini...');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1000,
    }
  });

  // Extract image data
  const [meta, base64Data] = imageDataUri.split(',');
  const mimeMatch = meta?.match(/^data:(.*?);base64$/);
  const mimeType = mimeMatch?.[1] || 'image/jpeg';

  const prompt = `Analyze this image and create a detailed description for converting it into a coloring page. 

Focus on:
1. Main subject (person, object, character)
2. Key features and details that should be preserved
3. Composition and framing
4. Background elements
5. Important shapes and outlines

Describe it in a way that would help create a clean line art coloring page suitable for children.`;

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
  const description = response.text();
  
  console.log('✅ Gemini analysis completed');
  return description;
}

/**
 * Generate coloring page using Imagen
 */
async function generateColoringPageWithImagen(imageDescription: string, apiKey: string): Promise<string> {
  console.log('🎨 Generating coloring page with Imagen...');
  
  try {
    const imagenEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-preview-06-06:predict?key=${apiKey}`;
    
    const prompt = `Create a black and white line art coloring page based on this description: "${imageDescription}"

COLORING PAGE REQUIREMENTS:
- Pure black lines on white background
- Simple, clean line art suitable for children
- Bold outlines that are easy to trace
- Large fillable white areas for coloring
- No shading or gradients
- No text or letters
- Child-friendly design
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
    
    console.log('📤 Sending request to Imagen...');
    const response = await fetch(imagenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(imagenPayload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Imagen API error:', response.status, errorText);
      throw new Error(`Imagen API failed: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log('📥 Imagen response received');
    
    const generatedImage = result.predictions?.[0]?.bytesBase64Encoded;
    
    if (!generatedImage) {
      console.error('❌ No image in Imagen response:', result);
      throw new Error('Imagen did not return an image');
    }
    
    console.log('✅ Imagen generation successful');
    return `data:image/png;base64,${generatedImage}`;
    
  } catch (error) {
    console.error('❌ Imagen generation failed:', error);
    throw error;
  }
}
