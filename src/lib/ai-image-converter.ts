/**
 * AI Image Converter - Uses Google Imagen (same as story images)
 * Consistent with all other features in the app
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ai } from '@/ai';

const STRICT_BLACK_WHITE_PROMPT = `You are an expert at creating professional children's coloring book pages.

CRITICAL REQUIREMENTS:
- Output MUST be black and white line art ONLY
- Thick, bold black outlines (2-3px width)
- Pure white background with NO shading, NO gradients, NO gray tones
- Simple, clean lines suitable for children ages 3-12 to color
- NO text, letters, numbers, or words anywhere in the image
- Professional coloring book quality
- Clear separation between different parts for easy coloring`;

/**
 * Convert image to coloring page using Google Imagen (same as other features)
 */
export async function convertImageToColoringPage(imageDataUri: string): Promise<string> {
  console.log('🤖 Converting image to coloring page using Google Imagen...');
  
  const apiKey = process.env.IMAGE_TO_LINE_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('Google AI API key required');
  }

  try {
    // Step 1: Analyze image with Gemini to get detailed description
    console.log('📝 Step 1: Analyzing image with Gemini...');
    const detailedDescription = await analyzeImageForColoringPage(imageDataUri, apiKey);
    
    // Step 2: Generate coloring page with Google Imagen using the description
    console.log('🎨 Step 2: Generating coloring page with Google Imagen...');
    const coloringPageUrl = await generateColoringPageWithImagen(detailedDescription);
    
    console.log('✅ Coloring page generated successfully');
    return coloringPageUrl;
    
  } catch (error) {
    console.error('❌ AI conversion failed:', error);
    throw new Error(`AI conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate coloring page using Google Imagen (same model as stories)
 */
async function generateColoringPageWithImagen(description: string): Promise<string> {
  console.log('🎨 Generating coloring page with Google Imagen...');
  
  try {
    // Use retry logic for stability
    const imageUrl = await generateWithRetryStrict(async () => {
      const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-generate-preview-06-06',
        prompt: `${STRICT_BLACK_WHITE_PROMPT}

Convert this image into a professional coloring book page:

${description}

STYLE REQUIREMENTS:
- Black and white line art only
- Bold, clear outlines (2-3px thick)
- White background
- No shading, no gradients, no gray tones
- Simple enough for children to color
- Preserve the exact subject, pose, and all details from the description
- Professional coloring book quality
- Clear areas for coloring

CRITICAL: The coloring page must look exactly like the described image, just converted to black line art on white background.`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (!media?.url) {
        throw new Error('Google Imagen failed to return a valid image URL');
      }
      
      return media.url;
    });

    console.log('✅ Google Imagen generation successful');
    return imageUrl;
    
  } catch (error) {
    console.error('❌ Google Imagen generation failed:', error);
    throw error;
  }
}

/**
 * Retry logic for AI generation (borrowed from story flow)
 */
async function generateWithRetryStrict<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 AI generation attempt ${attempt}/${maxRetries}...`);
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        const delay = attempt * 2000; // 2s, 4s, 6s
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`AI generation failed after ${maxRetries} attempts: ${lastError?.message}`);
}

/**
 * Analyze image for coloring page generation with EXTREME detail
 */
async function analyzeImageForColoringPage(imageDataUri: string, apiKey: string): Promise<string> {
  console.log('🔍 Analyzing image with EXTREME DETAIL for coloring page generation...');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2000, // Increased for more detail
    }
  });

  // Extract image data
  const [meta, base64Data] = imageDataUri.split(',');
  const mimeMatch = meta?.match(/^data:(.*?);base64$/);
  const mimeType = mimeMatch?.[1] || 'image/jpeg';

  const prompt = `You are a professional coloring book artist. Analyze this image in EXTREME DETAIL and create a comprehensive description for generating a perfect black and white line art coloring page that preserves the EXACT likeness and all details.

DESCRIBE IN EXTREME DETAIL:

1. SUBJECT IDENTIFICATION:
   - What is the main subject? (person, animal, object, etc.)
   - If it's a person: age, gender, ethnicity, physical features
   - Exact facial expression and emotion

2. FACIAL FEATURES (if applicable):
   - Eye shape, size, position (wide set, close, almond, round, etc.)
   - Eyebrow shape and thickness
   - Nose shape (small, large, button, pointed, etc.)
   - Mouth shape and expression (smiling, neutral, open, closed, etc.)
   - Ear visibility and shape
   - Face shape (round, oval, square, heart-shaped, etc.)
   - Any facial hair (beard, mustache, etc.)

3. HAIR DETAILS:
   - Hair style (straight, curly, wavy, braided, ponytail, etc.)
   - Hair length (short, medium, long, shoulder-length, etc.)
   - Hair texture and volume
   - Bangs or fringe presence
   - Hair accessories (clips, bands, etc.)

4. BODY POSITION & POSE:
   - Exact body position (standing, sitting, lying, etc.)
   - Arm positions (crossed, at sides, raised, etc.)
   - Leg positions (crossed, straight, bent, etc.)
   - Body orientation (facing forward, side profile, 3/4 view, etc.)
   - Overall posture

5. CLOTHING DETAILS:
   - Type of clothing (t-shirt, dress, jacket, pants, etc.)
   - Clothing fit (tight, loose, oversized, etc.)
   - Collar type, sleeve length
   - Patterns or designs on clothing (stripes, polka dots, logos, etc.)
   - Visible buttons, zippers, pockets
   - Shoes or footwear

6. BACKGROUND & CONTEXT:
   - Setting (indoors, outdoors, plain background, etc.)
   - Objects in background
   - Ground or floor details
   - Any props being held or nearby

7. PROPORTIONS & SCALE:
   - Relative size of body parts
   - Overall composition within frame
   - Where subject is positioned

8. UNIQUE CHARACTERISTICS:
   - Any distinguishing features
   - Accessories (glasses, jewelry, hats, etc.)
   - Special details that make this image unique

CREATE A DESCRIPTION that will allow an AI to generate a coloring book page that looks EXACTLY like this image, just in black and white line art form. Be extremely specific about EVERY detail you see.`;

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
  console.log('📝 DETAILED ANALYSIS COMPLETED:', analysis.substring(0, 500) + '...');
  return analysis;
}

