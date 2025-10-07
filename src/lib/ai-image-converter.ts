/**
 * REAL AI Image Converter - Uses actual AI image generation
 * No filters, no fallbacks, just real AI
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Convert image to coloring page using REAL AI image generation
 */
export async function convertImageToColoringPage(imageDataUri: string): Promise<string> {
  console.log('🤖 REAL AI: Converting image to coloring page using actual AI image generation...');
  
  const apiKey = process.env.IMAGE_TO_LINE_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('AI API key required');
  }

  try {
    // Use real AI to generate coloring page
    const coloringPageImage = await generateColoringPageWithAI(imageDataUri, apiKey);
    console.log('🎨 AI Generated Real Coloring Page');
    
    return coloringPageImage;
    
  } catch (error) {
    console.error('❌ AI conversion failed:', error);
    throw new Error(`AI conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate coloring page using real AI image generation
 */
async function generateColoringPageWithAI(imageDataUri: string, apiKey: string): Promise<string> {
  console.log('🎨 Generating coloring page with REAL AI...');
  
  try {
    // Step 1: Use Gemini to analyze the image
    const analysis = await analyzeImageForColoringPage(imageDataUri, apiKey);
    console.log('📝 Image analysis completed');
    
    // Step 2: Use AI to generate actual coloring page image
    const coloringPageImage = await generateImageWithAI(analysis, apiKey);
    
    if (coloringPageImage) {
      console.log('✅ AI coloring page generation successful');
      return coloringPageImage;
    } else {
      throw new Error('AI failed to generate coloring page');
    }
    
  } catch (error) {
    console.error('❌ AI coloring page generation failed:', error);
    throw error;
  }
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

/**
 * Generate actual coloring page image using AI
 */
async function generateImageWithAI(description: string, apiKey: string): Promise<string | null> {
  console.log('🎨 Generating actual coloring page image with AI...');
  
  try {
    // Use a real AI image generation service
    // Let's try using Hugging Face API for actual image generation
    
    const coloringPageImage = await generateWithHuggingFace(description, apiKey);
    
    if (coloringPageImage) {
      console.log('✅ Hugging Face AI generation successful');
      return coloringPageImage;
    } else {
      console.log('⚠️ Hugging Face failed, trying other AI...');
      return await generateWithOtherAI(description, apiKey);
    }
    
  } catch (error) {
    console.error('❌ AI image generation failed:', error);
    return null;
  }
}

/**
 * Generate coloring page using Hugging Face AI with detailed prompt
 */
async function generateWithHuggingFace(description: string, apiKey: string): Promise<string | null> {
  console.log('🎨 Generating with Hugging Face AI using DETAILED description...');
  
  try {
    const HUGGING_FACE_KEY = process.env.HUGGING_FACE_API_KEY || apiKey;
    
    // Create a highly detailed prompt for the AI
    const detailedPrompt = `Professional coloring book illustration, black and white line art, clean bold outlines, no shading, no color, white background, children's coloring page style.

SUBJECT DETAILS:
${description}

STYLE REQUIREMENTS:
- Black outlines only, thick clean lines (2-3px width)
- White background, no textures
- Simple, child-friendly line art
- All areas clearly defined for coloring
- No gradients, no shadows, no shading
- Professional coloring book quality
- Clear separation between different parts
- Suitable for ages 3-12`;

    console.log('📝 Using enhanced prompt (first 300 chars):', detailedPrompt.substring(0, 300) + '...');
    
    const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGING_FACE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: detailedPrompt,
        parameters: {
          num_inference_steps: 30,
          guidance_scale: 9.0,
          width: 768,
          height: 768,
          negative_prompt: "color, colored, shading, shadow, gradient, photograph, realistic, 3d, blurry, messy lines, thin lines, complex details, photorealistic"
        }
      })
    });
    
    if (response.ok) {
      const imageBlob = await response.blob();
      const arrayBuffer = await imageBlob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      console.log('✅ Hugging Face generation successful with detailed prompt');
      return `data:image/png;base64,${base64}`;
    } else {
      const errorText = await response.text();
      console.log('❌ Hugging Face API failed:', response.status, errorText);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Hugging Face generation failed:', error);
    return null;
  }
}

/**
 * Generate coloring page using fallback AI service with detailed prompt
 */
async function generateWithOtherAI(description: string, apiKey: string): Promise<string | null> {
  console.log('🎨 Generating with fallback AI service using DETAILED description...');
  
  try {
    // Create an enhanced prompt similar to the primary method
    const enhancedPrompt = `Coloring book page, line art drawing, black and white illustration, bold outlines, simple clean lines, white background, no shading, children's coloring book style.

DETAILS TO INCLUDE:
${description}

MUST HAVE:
- Black outlines only
- White background
- No colors, no shading
- Clear areas for coloring
- Simple child-friendly style`;

    const response = await fetch('https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: enhancedPrompt,
        parameters: {
          num_inference_steps: 25,
          guidance_scale: 8.5,
          width: 512,
          height: 512,
          negative_prompt: "color, photograph, realistic, shading, complex, gradient"
        }
      })
    });
    
    if (response.ok) {
      const imageBlob = await response.blob();
      const arrayBuffer = await imageBlob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      console.log('✅ Fallback AI generation successful with enhanced prompt');
      return `data:image/png;base64,${base64}`;
    } else {
      const errorText = await response.text();
      console.log('❌ Fallback AI API failed:', response.status, errorText);
      
      // If all AI services fail, throw error instead of creating stick figure
      throw new Error('All AI services failed to generate coloring page');
    }
    
  } catch (error) {
    console.error('❌ Fallback AI generation failed:', error);
    throw error;
  }
}
