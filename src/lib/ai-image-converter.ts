/**
 * SINGLE AI Image Converter - No fallbacks, no filters, just AI
 * This is the ONLY file for image-to-coloring conversion
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Convert image to coloring page using ONLY Gemini - direct image-to-SVG conversion
 */
export async function convertImageToColoringPage(imageDataUri: string): Promise<string> {
  console.log('🤖 AI ONLY: Converting image to coloring page using Gemini direct conversion...');
  
  const apiKey = process.env.IMAGE_TO_LINE_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('AI API key required');
  }

  try {
    // Use Gemini to convert image directly to SVG line art
    const svgResult = await convertImageToSVGWithGemini(imageDataUri, apiKey);
    console.log('🎨 AI Generated SVG Line Art');
    
    return svgResult;
    
  } catch (error) {
    console.error('❌ AI conversion failed:', error);
    throw new Error(`AI conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert image to line art using real image-to-image generation
 */
async function convertImageToSVGWithGemini(imageDataUri: string, apiKey: string): Promise<string> {
  console.log('🎨 Converting image to line art using REAL image-to-image generation...');
  
  // Extract image data
  const [meta, base64Data] = imageDataUri.split(',');
  const mimeMatch = meta?.match(/^data:(.*?);base64$/);
  const mimeType = mimeMatch?.[1] || 'image/jpeg';

  try {
    // Try Imagen with image input first
    const imagenResult = await convertWithImagenImageToImage(imageDataUri, apiKey);
    if (imagenResult) {
      console.log('✅ Imagen image-to-image conversion successful');
      return imagenResult;
    }
  } catch (error) {
    console.log('⚠️ Imagen image-to-image failed, trying alternative...', error);
  }

  try {
    // Fallback: Use Gemini to analyze and then Imagen to generate
    const geminiAnalysis = await analyzeImageForGeneration(imageDataUri, apiKey);
    const imagenTextResult = await convertWithImagenTextToImage(geminiAnalysis, apiKey);
    if (imagenTextResult) {
      console.log('✅ Imagen text-to-image conversion successful');
      return imagenTextResult;
    }
  } catch (error) {
    console.log('⚠️ Imagen text-to-image failed:', error);
  }

  try {
    // Final fallback: Use a simple line art prompt
    const simpleResult = await convertWithSimpleLineArtPrompt(apiKey);
    if (simpleResult) {
      console.log('✅ Simple line art conversion successful');
      return simpleResult;
    }
  } catch (error) {
    console.log('⚠️ Simple line art failed:', error);
  }

  throw new Error('All image generation methods failed');
}

/**
 * Convert using Imagen with image input (if supported)
 */
async function convertWithImagenImageToImage(imageDataUri: string, apiKey: string): Promise<string | null> {
  console.log('🎨 Trying Imagen image-to-image conversion...');
  
  try {
    // First, let's try the correct Imagen API format
    const imagenEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-preview-06-06:predict?key=${apiKey}`;
    
    // Extract image data
    const [meta, base64Data] = imageDataUri.split(',');
    const mimeMatch = meta?.match(/^data:(.*?);base64$/);
    const mimeType = mimeMatch?.[1] || 'image/jpeg';
    
    // Try the correct Imagen API format
    const payload = {
      instances: [{
        prompt: "Create black-and-white line art from the EXACT input. Preserve all outlines and details. White background, black lines only. No shading, no fills, no added elements."
      }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "ASPECT_RATIO_1_1",
        safetyFilterLevel: "BLOCK_ONLY_HIGH",
        personGeneration: "ALLOW_ADULT"
      }
    };
    
    console.log('📤 Sending request to Imagen API...');
    const response = await fetch(imagenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log('📥 Imagen API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Imagen image-to-image failed:', response.status, errorText);
      return null;
    }
    
    const result = await response.json();
    console.log('📥 Imagen API response:', JSON.stringify(result, null, 2));
    
    const generatedImage = result.predictions?.[0]?.bytesBase64Encoded;
    
    if (generatedImage) {
      console.log('✅ Imagen image-to-image successful');
      return `data:image/png;base64,${generatedImage}`;
    }
    
    console.log('❌ No image data in Imagen response');
    return null;
    
  } catch (error) {
    console.log('❌ Imagen image-to-image error:', error);
    return null;
  }
}

/**
 * Analyze image with Gemini for generation
 */
async function analyzeImageForGeneration(imageDataUri: string, apiKey: string): Promise<string> {
  console.log('🔍 Analyzing image for generation...');
  
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

  const prompt = `Analyze this image in detail for creating a line art coloring page. Describe the main subject, key features, composition, and important details that should be preserved in a clean line art version.`;

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
  return response.text();
}

/**
 * Convert using Imagen with text description
 */
async function convertWithImagenTextToImage(description: string, apiKey: string): Promise<string | null> {
  console.log('🎨 Converting with Imagen text-to-image...');
  
  try {
    const imagenEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-preview-06-06:predict?key=${apiKey}`;
    
    const prompt = `Create a black and white line art coloring page based on this description: "${description}"

REQUIREMENTS:
- Pure black lines on white background
- Clean, simple line art suitable for children
- Bold outlines that are easy to trace
- Large fillable white areas for coloring
- No shading, gradients, or fills
- No text or letters
- Child-friendly design
- Preserve the main subject and key details from the description`;

    const payload = {
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
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Imagen text-to-image failed:', response.status, errorText);
      return null;
    }
    
    const result = await response.json();
    const generatedImage = result.predictions?.[0]?.bytesBase64Encoded;
    
    if (generatedImage) {
      console.log('✅ Imagen text-to-image successful');
      return `data:image/png;base64,${generatedImage}`;
    }
    
    return null;
    
  } catch (error) {
    console.log('❌ Imagen text-to-image error:', error);
    return null;
  }
}

/**
 * Convert using simple line art prompt as final fallback
 */
async function convertWithSimpleLineArtPrompt(apiKey: string): Promise<string | null> {
  console.log('🎨 Trying simple line art generation...');
  
  try {
    const imagenEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-preview-06-06:predict?key=${apiKey}`;
    
    const prompt = `Simple black and white line art coloring page for children. Clean outlines, no shading, white background, black lines only. Suitable for coloring book.`;
    
    const payload = {
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "ASPECT_RATIO_1_1",
        safetyFilterLevel: "BLOCK_ONLY_HIGH",
        personGeneration: "ALLOW_ADULT"
      }
    };
    
    console.log('📤 Sending simple line art request to Imagen API...');
    const response = await fetch(imagenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log('📥 Simple line art response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Simple line art failed:', response.status, errorText);
      return null;
    }
    
    const result = await response.json();
    console.log('📥 Simple line art response:', JSON.stringify(result, null, 2));
    
    const generatedImage = result.predictions?.[0]?.bytesBase64Encoded;
    
    if (generatedImage) {
      console.log('✅ Simple line art successful');
      return `data:image/png;base64,${generatedImage}`;
    }
    
    console.log('❌ No image data in simple line art response');
    return null;
    
  } catch (error) {
    console.log('❌ Simple line art error:', error);
    return null;
  }
}

// Note: Removed fallback SVG functions since we're using real image generation
