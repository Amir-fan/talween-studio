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
 * Convert image to line art using Gemini direct SVG generation
 */
async function convertImageToSVGWithGemini(imageDataUri: string, apiKey: string): Promise<string> {
  console.log('🎨 Converting image to line art using Gemini direct SVG generation...');
  
  // Extract image data
  const [meta, base64Data] = imageDataUri.split(',');
  const mimeMatch = meta?.match(/^data:(.*?);base64$/);
  const mimeType = mimeMatch?.[1] || 'image/jpeg';

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 4000,
    }
  });

  const prompt = `Look at this image and create a clean black and white line art SVG coloring page.

CRITICAL REQUIREMENTS:
- Create an SVG with black lines on white background
- Trace the exact outlines and shapes from the image
- Make it suitable for children to color
- Use simple, clean lines
- No shading, no fills, just outlines
- Preserve the main subject and key details
- Return ONLY the SVG code, no explanations

Create the SVG now:`;

  try {
    console.log('🎨 Generating SVG with Gemini...');
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
    const content = response.text();
    
    console.log('📝 Gemini response length:', content.length);
    console.log('📝 Response preview:', content.substring(0, 300) + '...');
    
    // Extract SVG from the response
    const svgMatch = content.match(/<svg[^>]*>[\s\S]*<\/svg>/i);
    
    if (svgMatch) {
      const svgContent = svgMatch[0];
      console.log('✅ SVG found in Gemini response');
      return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    } else {
      console.log('❌ No SVG found in response');
      console.log('📝 Full response:', content);
      throw new Error('Gemini did not return valid SVG content');
    }
    
  } catch (error) {
    console.error('❌ Gemini SVG generation failed:', error);
    throw error;
  }
}

// Note: Simplified to use only Gemini for direct SVG generation
