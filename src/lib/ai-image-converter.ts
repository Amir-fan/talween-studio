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
 * Convert image directly to SVG line art using Gemini
 */
async function convertImageToSVGWithGemini(imageDataUri: string, apiKey: string): Promise<string> {
  console.log('🎨 Converting image to SVG line art with Gemini...');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 4000, // Increased for SVG content
    }
  });

  // Extract image data
  const [meta, base64Data] = imageDataUri.split(',');
  const mimeMatch = meta?.match(/^data:(.*?);base64$/);
  const mimeType = mimeMatch?.[1] || 'image/jpeg';

  const systemInstruction = "Convert the provided image into clean black SVG line art for coloring books—no shading, no fills.";
  
  const prompt = `Convert this image into a clean black SVG line art suitable for coloring books.

REQUIREMENTS:
- Pure black lines on white background
- Clean, simple line art suitable for children
- Bold outlines that are easy to trace
- Large fillable white areas for coloring
- No shading, gradients, or fills
- No text or letters
- Child-friendly design
- Preserve the exact structure and composition of the original image

OUTPUT FORMAT:
Return ONLY valid SVG code, no explanations or markdown fences. The SVG should:
- Start with <svg> tag
- Have proper viewBox dimensions
- Use black stroke lines with no fill
- Be suitable for printing and coloring

Convert the provided image into clean black SVG line art for coloring books—no shading, no fills.`;

  try {
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
    const svgContent = response.text();
    
    console.log('📝 Raw Gemini response:', svgContent.substring(0, 200) + '...');
    
    // Clean and validate SVG content
    const cleanedSVG = cleanAndValidateSVG(svgContent);
    console.log('✅ SVG cleaned and validated');
    
    // Convert to data URI
    const svgDataUri = `data:image/svg+xml;base64,${Buffer.from(cleanedSVG).toString('base64')}`;
    
    console.log('✅ SVG conversion completed');
    return svgDataUri;
    
  } catch (error) {
    console.error('❌ SVG conversion failed:', error);
    throw error;
  }
}

/**
 * Clean and validate SVG content from Gemini response
 */
function cleanAndValidateSVG(svgContent: string): string {
  console.log('🧹 Cleaning SVG content...');
  
  // Remove markdown fences if present
  let cleaned = svgContent
    .replace(/```svg\s*/gi, '')
    .replace(/```\s*$/g, '')
    .replace(/```\s*$/gm, '')
    .trim();
  
  // Ensure it starts with <svg
  if (!cleaned.toLowerCase().includes('<svg')) {
    console.log('⚠️ No SVG tag found, extracting from content...');
    
    // Try to extract SVG from the content
    const svgMatch = cleaned.match(/<svg[^>]*>[\s\S]*<\/svg>/i);
    if (svgMatch) {
      cleaned = svgMatch[0];
    } else {
      console.log('❌ No valid SVG found in response');
      throw new Error('Gemini did not return valid SVG content');
    }
  }
  
  // Basic SVG validation
  if (!cleaned.includes('<svg') || !cleaned.includes('</svg>')) {
    console.log('❌ Invalid SVG structure');
    throw new Error('Invalid SVG structure returned by Gemini');
  }
  
  // Ensure proper viewBox if missing
  if (!cleaned.includes('viewBox')) {
    cleaned = cleaned.replace('<svg', '<svg viewBox="0 0 400 400"');
  }
  
  // Ensure proper stroke settings
  if (!cleaned.includes('stroke=')) {
    cleaned = cleaned.replace('<svg', '<svg stroke="black" stroke-width="2" fill="none"');
  }
  
  console.log('✅ SVG cleaned successfully');
  return cleaned;
}
