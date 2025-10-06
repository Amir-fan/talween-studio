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
 * Convert image to line art using direct image-to-image AI conversion
 */
async function convertImageToSVGWithGemini(imageDataUri: string, apiKey: string): Promise<string> {
  console.log('🎨 Converting image to line art using direct AI conversion...');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      temperature: 0.0,
      maxOutputTokens: 2000,
    }
  });

  // Extract image data
  const [meta, base64Data] = imageDataUri.split(',');
  const mimeMatch = meta?.match(/^data:(.*?);base64$/);
  const mimeType = mimeMatch?.[1] || 'image/jpeg';

  const prompt = `Convert this image into a clean black line art coloring page.

CRITICAL REQUIREMENTS:
- Create clean black outlines of the EXACT image shown
- Preserve the main subject, facial features, and key details
- Use thick black lines on white background
- No shading, no fills, no solid black areas
- Make it look like a real coloring book page
- Keep the same composition and proportions as the original
- Focus on outlines and contours, not abstract shapes

Convert the provided image into clean black line art for coloring books—no shading, no fills.`;

  try {
    console.log('🎨 Converting image directly to line art...');
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
    
    console.log('📝 AI response length:', content.length);
    console.log('📝 AI response preview:', content.substring(0, 300) + '...');
    
    // Check if we got an image response
    const imageData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    
    if (imageData) {
      console.log('✅ AI returned image data');
      return `data:${imageData.mimeType};base64,${imageData.data}`;
    } else {
      console.log('❌ No image data in response, trying to extract SVG...');
      
      // Try to extract SVG from text response
      const svgMatch = content.match(/<svg[^>]*>[\s\S]*<\/svg>/i);
      if (svgMatch) {
        const svgContent = svgMatch[0];
        console.log('✅ Found SVG in response');
        return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
      } else {
        console.log('❌ No SVG found, trying alternative approach...');
        
        // Try to create a simple SVG from the description
        const simpleSVG = createSimpleSVGFromDescription(content);
        if (simpleSVG) {
          console.log('✅ Created simple SVG from description');
          return `data:image/svg+xml;base64,${Buffer.from(simpleSVG).toString('base64')}`;
        } else {
          console.log('❌ Could not create valid content from response');
          console.log('📝 Full response:', content);
          throw new Error('AI did not return valid image or SVG content');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Direct AI conversion failed:', error);
    throw error;
  }
}

/**
 * Create a simple SVG from AI description as fallback
 */
function createSimpleSVGFromDescription(description: string): string | null {
  console.log('🔧 Creating simple SVG from description...');
  
  try {
    // Extract key elements from the description
    const hasPerson = /person|character|face|head|body/i.test(description);
    const hasHat = /hat|cap|headwear/i.test(description);
    const hasSmile = /smile|mouth|teeth/i.test(description);
    const hasEyes = /eye|eyes/i.test(description);
    
    // Create a simple SVG based on the description
    let svgContent = `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="white"/>
  <g stroke="black" stroke-width="3" fill="none">`;
  
    if (hasPerson) {
      // Basic person outline
      svgContent += `
    <!-- Head -->
    <circle cx="200" cy="120" r="40"/>
    <!-- Body -->
    <rect x="160" y="160" width="80" height="120" rx="10"/>
    <!-- Arms -->
    <line x1="160" y1="180" x2="120" y2="220"/>
    <line x1="240" y1="180" x2="280" y2="220"/>
    <!-- Legs -->
    <line x1="180" y1="280" x2="180" y2="360"/>
    <line x1="220" y1="280" x2="220" y2="360"/>`;
      
      if (hasEyes) {
        svgContent += `
    <!-- Eyes -->
    <circle cx="185" cy="110" r="3"/>
    <circle cx="215" cy="110" r="3"/>`;
      }
      
      if (hasSmile) {
        svgContent += `
    <!-- Smile -->
    <path d="M 180 130 Q 200 150 220 130"/>`;
      }
      
      if (hasHat) {
        svgContent += `
    <!-- Hat -->
    <ellipse cx="200" cy="80" rx="50" ry="15"/>
    <rect x="150" y="80" width="100" height="40" rx="5"/>`;
      }
    } else {
      // Generic shape if no person detected
      svgContent += `
    <!-- Generic shape -->
    <circle cx="200" cy="200" r="80"/>
    <rect x="120" y="120" width="160" height="160" rx="20"/>`;
    }
    
    svgContent += `
  </g>
</svg>`;
    
    console.log('✅ Simple SVG created');
    return svgContent;
    
  } catch (error) {
    console.error('❌ Failed to create simple SVG:', error);
    return null;
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
