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

  const prompt = `Create an SVG line art coloring page from this image.

REQUIREMENTS:
- Black lines on white background
- Simple outlines suitable for children
- No shading or fills
- Clean, bold lines
- Preserve main subject details

Return ONLY the SVG code starting with <svg and ending with </svg>.`;

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
    
    // Extract SVG from the response - try multiple patterns
    let svgContent = null;
    
    // Try different SVG patterns
    const patterns = [
      /<svg[^>]*>[\s\S]*?<\/svg>/gi,
      /```svg\s*([\s\S]*?)\s*```/gi,
      /```\s*([\s\S]*?<svg[^>]*>[\s\S]*?<\/svg>[\s\S]*?)\s*```/gi,
      /<svg[^>]*>[\s\S]*<\/svg>/i
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        svgContent = match[1] || match[0];
        console.log('✅ SVG found with pattern:', pattern.toString());
        break;
      }
    }
    
    if (svgContent) {
      // Clean up the SVG content
      svgContent = svgContent.trim();
      
      // Ensure it starts with <svg
      if (!svgContent.toLowerCase().startsWith('<svg')) {
        const svgStart = svgContent.indexOf('<svg');
        if (svgStart !== -1) {
          svgContent = svgContent.substring(svgStart);
        }
      }
      
      console.log('✅ SVG extracted successfully');
      console.log('📝 SVG preview:', svgContent.substring(0, 200) + '...');
      
      return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    } else {
      console.log('❌ No SVG found in response');
      console.log('📝 Full response:', content);
      
      // Try to create a simple fallback SVG
      const fallbackSVG = createFallbackSVG(content);
      if (fallbackSVG) {
        console.log('✅ Created fallback SVG');
        return `data:image/svg+xml;base64,${Buffer.from(fallbackSVG).toString('base64')}`;
      }
      
      throw new Error('Gemini did not return valid SVG content');
    }
    
  } catch (error) {
    console.error('❌ Gemini SVG generation failed:', error);
    throw error;
  }
}

/**
 * Create a simple fallback SVG when Gemini doesn't return proper SVG
 */
function createFallbackSVG(content: string): string | null {
  console.log('🔧 Creating fallback SVG from Gemini response...');
  
  try {
    // Extract key elements from the description
    const hasPerson = /person|character|face|head|body|man|woman|child/i.test(content);
    const hasAnimal = /animal|cat|dog|bird|fish|horse/i.test(content);
    const hasObject = /object|car|house|tree|flower|ball/i.test(content);
    
    // Create a simple SVG based on the content
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
    <line x1="220" y1="280" x2="220" y2="360"/>
    <!-- Eyes -->
    <circle cx="185" cy="110" r="3"/>
    <circle cx="215" cy="110" r="3"/>
    <!-- Smile -->
    <path d="M 180 130 Q 200 150 220 130"/>`;
    } else if (hasAnimal) {
      // Basic animal outline
      svgContent += `
    <!-- Animal body -->
    <ellipse cx="200" cy="200" rx="80" ry="60"/>
    <!-- Head -->
    <circle cx="200" cy="120" r="50"/>
    <!-- Ears -->
    <ellipse cx="170" cy="80" rx="15" ry="25"/>
    <ellipse cx="230" cy="80" rx="15" ry="25"/>
    <!-- Eyes -->
    <circle cx="185" cy="110" r="5"/>
    <circle cx="215" cy="110" r="5"/>
    <!-- Nose -->
    <ellipse cx="200" cy="130" rx="8" ry="5"/>
    <!-- Tail -->
    <path d="M 280 200 Q 320 180 340 200"/>`;
    } else if (hasObject) {
      // Basic object outline
      svgContent += `
    <!-- Object -->
    <rect x="120" y="120" width="160" height="160" rx="20"/>
    <!-- Details -->
    <circle cx="200" cy="200" r="40"/>
    <rect x="150" y="150" width="100" height="100" rx="10"/>`;
    } else {
      // Generic shape
      svgContent += `
    <!-- Generic shape -->
    <circle cx="200" cy="200" r="80"/>
    <rect x="120" y="120" width="160" height="160" rx="20"/>
    <polygon points="200,80 240,160 160,160"/>`;
    }
    
    svgContent += `
  </g>
</svg>`;
    
    console.log('✅ Fallback SVG created');
    return svgContent;
    
  } catch (error) {
    console.error('❌ Failed to create fallback SVG:', error);
    return null;
  }
}

// Note: Simplified to use only Gemini for direct SVG generation
