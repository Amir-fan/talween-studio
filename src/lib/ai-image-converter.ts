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
 * Convert image to line art using REAL AI image-to-image generation
 */
async function convertImageToSVGWithGemini(imageDataUri: string, apiKey: string): Promise<string> {
  console.log('🎨 Converting image to line art using REAL AI image-to-image generation...');
  
  // Extract image data
  const [meta, base64Data] = imageDataUri.split(',');
  const mimeMatch = meta?.match(/^data:(.*?);base64$/);
  const mimeType = mimeMatch?.[1] || 'image/jpeg';

  // Use Gemini to analyze the image and create a detailed prompt for Imagen
  const detailedPrompt = await createDetailedLineArtPrompt(imageDataUri, apiKey);
  
  // Use Imagen to generate the actual line art
  const lineArtImage = await generateLineArtWithImagen(detailedPrompt, apiKey);
  
  if (!lineArtImage) {
    throw new Error('AI image generation failed');
  }
  
  return lineArtImage;
}

/**
 * Create detailed line art prompt using Gemini AI analysis
 */
async function createDetailedLineArtPrompt(imageDataUri: string, apiKey: string): Promise<string> {
  console.log('🔍 Creating detailed line art prompt with AI analysis...');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2000,
    }
  });

  // Extract image data
  const [meta, base64Data] = imageDataUri.split(',');
  const mimeMatch = meta?.match(/^data:(.*?);base64$/);
  const mimeType = mimeMatch?.[1] || 'image/jpeg';

  const prompt = `Analyze this image and create a detailed description for generating a black and white line art coloring page.

CRITICAL REQUIREMENTS:
- Describe the main subject in detail (person, animal, object, scene)
- Identify key structural elements: outlines, shapes, forms
- Note facial features, clothing, objects, background elements
- Describe pose, positioning, proportions, and composition
- Mention any distinctive features, accessories, or characteristics
- Focus on what would make a good coloring page outline

Create a clear, detailed description that an AI image generator can use to recreate this as clean line art.`;

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
  
  console.log('📝 AI Analysis:', analysis.substring(0, 200) + '...');
  
  return analysis;
}

/**
 * Generate line art using Imagen with detailed AI prompt
 */
async function generateLineArtWithImagen(detailedPrompt: string, apiKey: string): Promise<string | null> {
  console.log('🎨 Generating line art with Imagen AI...');
  
  try {
    // Try the correct Imagen API endpoint
    const imagenEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-preview-06-06:predict?key=${apiKey}`;
    
    const prompt = `Create a black and white line art coloring page: ${detailedPrompt}

REQUIREMENTS:
- Black lines on white background only
- Clean, simple outlines suitable for children
- No shading, colors, or fills
- No text or words
- Coloring book style
- Easy to trace lines
- Large white areas for coloring`;

    const payload = {
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        safetyFilterLevel: "BLOCK_ONLY_HIGH",
        personGeneration: "ALLOW_ADULT"
      }
    };
    
    console.log('📤 Sending AI-generated prompt to Imagen...');
    console.log('📤 Prompt:', prompt.substring(0, 200) + '...');
    
    const response = await fetch(imagenEndpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('📥 Imagen response status:', response.status);
    console.log('📥 Imagen response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Imagen generation failed:', response.status, errorText);
      console.log('📤 Payload sent:', JSON.stringify(payload, null, 2));
      throw new Error(`Imagen API failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('📥 Imagen full response:', JSON.stringify(result, null, 2));
    
    // Check for image data in different possible locations
    const generatedImage = result.predictions?.[0]?.bytesBase64Encoded || 
                          result.predictions?.[0]?.image?.bytesBase64Encoded ||
                          result.predictions?.[0]?.data ||
                          result.image ||
                          result.data ||
                          result.predictions?.[0]?.generatedImage ||
                          result.predictions?.[0]?.imageData;
    
    console.log('🔍 Looking for image data in:', {
      'result.predictions?.[0]?.bytesBase64Encoded': result.predictions?.[0]?.bytesBase64Encoded ? 'FOUND' : 'NOT FOUND',
      'result.predictions?.[0]?.image?.bytesBase64Encoded': result.predictions?.[0]?.image?.bytesBase64Encoded ? 'FOUND' : 'NOT FOUND',
      'result.predictions?.[0]?.data': result.predictions?.[0]?.data ? 'FOUND' : 'NOT FOUND',
      'result.image': result.image ? 'FOUND' : 'NOT FOUND',
      'result.data': result.data ? 'FOUND' : 'NOT FOUND',
      'result.predictions?.[0]?.generatedImage': result.predictions?.[0]?.generatedImage ? 'FOUND' : 'NOT FOUND',
      'result.predictions?.[0]?.imageData': result.predictions?.[0]?.imageData ? 'FOUND' : 'NOT FOUND'
    });
    
    if (generatedImage) {
      console.log('✅ AI line art generation successful');
      // Ensure it's properly formatted
      if (generatedImage.startsWith('data:')) {
        return generatedImage;
      } else {
        return `data:image/png;base64,${generatedImage}`;
      }
    }
    
    console.log('❌ No image data found in any expected location');
    console.log('📊 Response structure analysis:', {
      hasPredictions: !!result.predictions,
      predictionsLength: result.predictions?.length || 0,
      firstPredictionKeys: result.predictions?.[0] ? Object.keys(result.predictions[0]) : [],
      topLevelKeys: Object.keys(result)
    });
    
    // If we have predictions but no image data, let's see what we do have
    if (result.predictions && result.predictions.length > 0) {
      console.log('🔍 First prediction content:', JSON.stringify(result.predictions[0], null, 2));
    }
    
    throw new Error('No image data returned from Imagen');
    
  } catch (error) {
    console.error('❌ AI line art generation failed:', error);
    throw error;
  }
}

// Note: Removed fallback SVG functions since we're using real image generation
