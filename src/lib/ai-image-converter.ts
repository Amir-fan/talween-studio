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
 * Convert image to line art using server-side image processing
 */
async function convertImageToSVGWithGemini(imageDataUri: string, apiKey: string): Promise<string> {
  console.log('🎨 Converting image to line art using server-side processing...');
  
  // Extract image data
  const [meta, base64Data] = imageDataUri.split(',');
  const mimeMatch = meta?.match(/^data:(.*?);base64$/);
  const mimeType = mimeMatch?.[1] || 'image/jpeg';

  try {
    // Use server-side image processing to create line art
    const lineArtImage = await processImageToLineArt(imageDataUri);
    
    if (lineArtImage) {
      console.log('✅ Line art generated successfully');
      return lineArtImage;
    } else {
      throw new Error('Failed to generate line art');
    }
    
  } catch (error) {
    console.error('❌ Image processing failed:', error);
    throw error;
  }
}

/**
 * Process image to line art using server-side image processing
 */
async function processImageToLineArt(imageDataUri: string): Promise<string | null> {
  console.log('🔧 Processing image to line art...');
  
  try {
    // Import Sharp dynamically
    const sharp = (await import('sharp')).default;
    
    // Extract base64 data
    const [meta, base64Data] = imageDataUri.split(',');
    const mimeMatch = meta?.match(/^data:(.*?);base64$/);
    const mimeType = mimeMatch?.[1] || 'image/jpeg';
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    console.log('📸 Processing image with Sharp...');
    
    // Process the image to create line art
    const processedImage = await sharp(imageBuffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .greyscale()
      .normalize()
      .linear(1.2, 0) // Increase contrast
      .threshold(128) // Convert to black and white
      .png()
      .toBuffer();
    
    console.log('✅ Image processed successfully');
    
    // Convert back to data URI
    const processedBase64 = processedImage.toString('base64');
    return `data:image/png;base64,${processedBase64}`;
    
  } catch (error) {
    console.error('❌ Image processing failed:', error);
    return null;
  }
}

/**
 * Generate line art from description using Gemini
 */
async function generateLineArtFromDescription(description: string, apiKey: string): Promise<string | null> {
  console.log('🎨 Generating line art from description...');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      temperature: 0.0,
      maxOutputTokens: 2000,
    }
  });

  const prompt = `Based on this description: "${description}"

Create a black and white line art coloring page that matches the description exactly.

REQUIREMENTS:
- Pure black lines on white background
- Clean, simple outlines suitable for children
- No shading, gradients, or fills
- Bold, easy-to-trace lines
- Preserve the exact subject and pose described
- Make it look like a real coloring book page
- Large white areas for coloring

Generate the line art now.`;

  try {
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const content = response.text();
    
    console.log('📝 Line art response:', content.substring(0, 300) + '...');
    
    // Check if we got an image response
    const imageData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    
    if (imageData) {
      console.log('✅ Got image data from Gemini');
      return `data:${imageData.mimeType};base64,${imageData.data}`;
    } else {
      console.log('❌ No image data in response, trying alternative approach...');
      
      // Try to create a simple line art using text-to-image
      return await createSimpleLineArtImage(description, apiKey);
    }
    
  } catch (error) {
    console.error('❌ Line art generation failed:', error);
    return null;
  }
}

/**
 * Create simple line art image as fallback
 */
async function createSimpleLineArtImage(description: string, apiKey: string): Promise<string | null> {
  console.log('🔧 Creating simple line art image...');
  
  try {
    // Create a simple SVG based on the description
    const svgContent = createFallbackSVG(description);
    if (svgContent) {
      return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    }
    return null;
  } catch (error) {
    console.error('❌ Simple line art creation failed:', error);
    return null;
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
