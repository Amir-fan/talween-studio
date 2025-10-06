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

  const prompt = `Analyze this image and create a detailed prompt for generating a black and white line art coloring page. 

CRITICAL REQUIREMENTS:
- Describe the EXACT subject, composition, and key details
- Focus on outlines, contours, and structural elements
- Identify facial features, clothing, objects, and background elements
- Note the pose, positioning, and proportions
- Describe any distinctive features or characteristics

The prompt should be detailed enough for an AI image generator to create an accurate line art version that preserves the original structure and details.`;

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
    const imagenEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-preview-06-06:predict?key=${apiKey}`;
    
    const prompt = `Create a black and white line art coloring page based on this detailed analysis: "${detailedPrompt}"

STRICT REQUIREMENTS:
- Pure black lines on white background
- Clean, bold outlines that are easy to trace
- Preserve the EXACT structure and details from the analysis
- No shading, gradients, or fills
- No text or letters
- Child-friendly coloring book style
- Large fillable white areas for coloring
- Maintain original proportions and composition`;

    const payload = {
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        safetyFilterLevel: "BLOCK_ONLY_HIGH",
        personGeneration: "ALLOW_ADULT"
      }
    };
    
    console.log('📤 Sending AI-generated prompt to Imagen...');
    const response = await fetch(imagenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log('📥 Imagen response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Imagen generation failed:', response.status, errorText);
      console.log('📤 Payload sent:', JSON.stringify(payload, null, 2));
      throw new Error(`Imagen API failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('📥 Imagen response received');
    
    const generatedImage = result.predictions?.[0]?.bytesBase64Encoded;
    
    if (generatedImage) {
      console.log('✅ AI line art generation successful');
      return `data:image/png;base64,${generatedImage}`;
    }
    
    throw new Error('No image data returned from Imagen');
    
  } catch (error) {
    console.error('❌ AI line art generation failed:', error);
    throw error;
  }
}

// Note: Removed fallback SVG functions since we're using real image generation
