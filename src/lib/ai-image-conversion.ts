/**
 * AI-based structural image conversion that preserves the exact original image
 * Uses the uploaded image directly as input to AI models for conversion
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getBestWorkingImageModel, AvailableModel } from './model-discovery';

export interface ImageConversionOptions {
  preserveStructure?: boolean;
  lineArtStyle?: 'bold' | 'fine' | 'sketch';
  removeBackground?: boolean;
  enhanceEdges?: boolean;
}

/**
 * Convert uploaded image to line art using AI with the original image as direct input
 * This preserves the exact structure, composition, and details of the original
 */
export async function convertImageToLineArtAI(
  imageDataUri: string, 
  options: ImageConversionOptions = {}
): Promise<string> {
  console.log('🎨 Starting AI structural conversion of uploaded image...');
  
  const apiKey = process.env.IMAGE_TO_LINE_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('AI API key required for image conversion');
  }

  // Find the best working model dynamically
  const bestModel = await getBestWorkingImageModel(apiKey);
  if (!bestModel) {
    throw new Error('No working image models found. Please check your API key and model availability.');
  }

  console.log(`🎯 Using model: ${bestModel.name} (${bestModel.apiVersion})`);
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Extract image data
  const [meta, base64Data] = imageDataUri.split(',');
  const mimeMatch = meta?.match(/^data:(.*?);base64$/);
  const mimeType = mimeMatch?.[1] || 'image/jpeg';

  try {
    // Use the discovered working model
    const model = genAI.getGenerativeModel({ 
      model: bestModel.name.replace('models/', ''), // Remove models/ prefix if present
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent conversion
        topK: 1,
        topP: 0.8,
        maxOutputTokens: 1024,
      }
    });

    const conversionPrompt = `Convert this EXACT image into a black and white line art coloring page. 

CRITICAL REQUIREMENTS:
- Keep the EXACT same composition, framing, and perspective as the original
- Preserve ALL structural details, proportions, and relationships
- Convert to clean black lines on pure white background
- Do NOT change the subject's pose, angle, or positioning
- Do NOT add or remove any elements from the original
- Do NOT change the lighting or shadows - convert them to line patterns
- Make it suitable for coloring by children
- Keep the same level of detail as the original

This should look like the original image traced as a coloring page - not a new interpretation.`;

    console.log('🔄 Processing image with AI for structural conversion...');

    const result = await model.generateContent([
      conversionPrompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);

    const response = await result.response;
    
    // Check if we got an image back
    if (response.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      const generatedImageData = response.candidates[0].content.parts[0].inlineData;
      const convertedDataUri = `data:${generatedImageData.mimeType};base64,${generatedImageData.data}`;
      
      console.log('✅ AI structural conversion completed');
      return convertedDataUri;
    } else {
      // Fallback: try alternative approach with different model
      console.log('⚠️ Primary conversion failed, trying alternative approach...');
      return await convertWithAlternativeApproach(imageDataUri, apiKey);
    }

  } catch (error) {
    console.error('❌ AI conversion failed:', error);
    throw new Error(`AI image conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Alternative approach using different AI model or method
 */
async function convertWithAlternativeApproach(imageDataUri: string, apiKey: string): Promise<string> {
  console.log('🔄 Trying alternative AI conversion approach...');
  
  // Find an alternative working model
  const bestModel = await getBestWorkingImageModel(apiKey);
  if (!bestModel) {
    throw new Error('No working image models found for alternative approach');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Extract image data
  const [meta, base64Data] = imageDataUri.split(',');
  const mimeMatch = meta?.match(/^data:(.*?);base64$/);
  const mimeType = mimeMatch?.[1] || 'image/jpeg';

  try {
    // Use the discovered working model
    const model = genAI.getGenerativeModel({ 
      model: bestModel.name.replace('models/', ''),
      generationConfig: {
        temperature: 0.0, // Very low temperature for precise conversion
        topK: 1,
        topP: 0.7,
        maxOutputTokens: 1024,
      }
    });

    const detailedPrompt = `Transform this image into a black and white line art coloring page while maintaining the EXACT same structure and composition.

PRESERVATION REQUIREMENTS:
- Keep identical framing, perspective, and camera angle
- Maintain exact proportions and spatial relationships
- Preserve all visible edges, contours, and structural lines
- Convert textures and patterns to appropriate line work
- Keep the same number and positioning of all elements
- Do NOT reinterpret or stylize - just convert to line art format

OUTPUT REQUIREMENTS:
- Pure black lines on white background
- Clean, bold outlines suitable for coloring
- No shading, gradients, or color fills
- Child-friendly coloring page style

The result should be the original image converted to line art, not a new artistic interpretation.`;

    const result = await model.generateContent([
      detailedPrompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);

    const response = await result.response;
    
    if (response.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
      const generatedImageData = response.candidates[0].content.parts[0].inlineData;
      const convertedDataUri = `data:${generatedImageData.mimeType};base64,${generatedImageData.data}`;
      
      console.log('✅ Alternative AI conversion completed');
      return convertedDataUri;
    } else {
      throw new Error('AI model did not return image data');
    }

  } catch (error) {
    console.error('❌ Alternative conversion also failed:', error);
    throw new Error(`All AI conversion methods failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Enhanced conversion with multiple AI approaches for better structural preservation
 */
export async function convertImageWithMultipleApproaches(
  imageDataUri: string,
  options: ImageConversionOptions = {}
): Promise<string> {
  console.log('🎨 Starting multi-approach AI conversion...');

  const approaches = [
    () => convertImageToLineArtAI(imageDataUri, options),
    () => convertWithStructuralFocus(imageDataUri),
    () => convertWithEdgePreservation(imageDataUri)
  ];

  for (let i = 0; i < approaches.length; i++) {
    try {
      console.log(`🔄 Trying approach ${i + 1}/${approaches.length}...`);
      const result = await approaches[i]();
      console.log(`✅ Approach ${i + 1} succeeded`);
      return result;
    } catch (error) {
      console.log(`❌ Approach ${i + 1} failed:`, error);
      if (i === approaches.length - 1) {
        throw error; // Re-throw the last error if all approaches fail
      }
    }
  }

  throw new Error('All conversion approaches failed');
}

/**
 * Focus on structural preservation with specific prompting
 */
async function convertWithStructuralFocus(imageDataUri: string): Promise<string> {
  const apiKey = process.env.IMAGE_TO_LINE_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('API key required');

  const bestModel = await getBestWorkingImageModel(apiKey);
  if (!bestModel) throw new Error('No working models found');

  const genAI = new GoogleGenerativeAI(apiKey);
  const [meta, base64Data] = imageDataUri.split(',');
  const mimeMatch = meta?.match(/^data:(.*?);base64$/);
  const mimeType = mimeMatch?.[1] || 'image/jpeg';

  const model = genAI.getGenerativeModel({ 
    model: bestModel.name.replace('models/', ''),
    generationConfig: { temperature: 0.0 }
  });

  const structuralPrompt = `Create a line art version of this EXACT image. 

STRUCTURAL PRESERVATION:
- Same composition and framing
- Identical subject positioning and proportions  
- Preserve all visible structural elements
- Convert colors to appropriate line weights
- Maintain original lighting as line patterns

OUTPUT: Clean black lines on white background for coloring.`;

  const result = await model.generateContent([
    structuralPrompt,
    { inlineData: { data: base64Data, mimeType } }
  ]);

  const response = await result.response;
  const imageData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  
  if (!imageData) throw new Error('No image returned');
  
  return `data:${imageData.mimeType};base64,${imageData.data}`;
}

/**
 * Focus on edge preservation for better detail retention
 */
async function convertWithEdgePreservation(imageDataUri: string): Promise<string> {
  const apiKey = process.env.IMAGE_TO_LINE_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('API key required');

  const bestModel = await getBestWorkingImageModel(apiKey);
  if (!bestModel) throw new Error('No working models found');

  const genAI = new GoogleGenerativeAI(apiKey);
  const [meta, base64Data] = imageDataUri.split(',');
  const mimeMatch = meta?.match(/^data:(.*?);base64$/);
  const mimeType = mimeMatch?.[1] || 'image/jpeg';

  const model = genAI.getGenerativeModel({ 
    model: bestModel.name.replace('models/', ''),
    generationConfig: { temperature: 0.0 }
  });

  const edgePrompt = `Convert this image to line art while preserving all edges and contours exactly as they appear.

EDGE PRESERVATION:
- Trace all visible edges and contours precisely
- Maintain original detail level and complexity
- Keep the same outline shapes and forms
- Convert textures to appropriate line patterns
- Preserve fine details and structural elements

STYLE: Black lines on white background, coloring page format.`;

  const result = await model.generateContent([
    edgePrompt,
    { inlineData: { data: base64Data, mimeType } }
  ]);

  const response = await result.response;
  const imageData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  
  if (!imageData) throw new Error('No image returned');
  
  return `data:${imageData.mimeType};base64,${imageData.data}`;
}
