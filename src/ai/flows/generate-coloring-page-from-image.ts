
'use server';
/**
 * @fileOverview Converts a user-uploaded image into a coloring page.
 *
 * - generateColoringPageFromImage - A function that takes an image and converts it.
 * - GenerateColoringPageFromImageInput - The input type for the function.
 * - GenerateColoringPageFromImageOutput - The return type for the function.
 */

import {z} from 'genkit';
import { convertImageWithMultipleApproaches } from '@/lib/ai-image-conversion';

// Use AI structural conversion that preserves the exact original image
async function convertImageToColoringPageServer(imageDataUri: string): Promise<string> {
  console.log('🎨 Converting uploaded image to coloring page using AI structural conversion...');
  
  try {
    // Use the new AI structural conversion that preserves exact image structure
    const convertedImageDataUri = await convertImageWithMultipleApproaches(imageDataUri, {
      preserveStructure: true,
      lineArtStyle: 'bold',
      removeBackground: true,
      enhanceEdges: true
    });
    
    console.log('✅ AI structural conversion completed successfully');
    return convertedImageDataUri;
    
  } catch (error) {
    console.error('❌ AI structural conversion failed:', error);
    throw new Error(`Failed to convert image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

const GenerateColoringPageFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateColoringPageFromImageInput = z.infer<typeof GenerateColoringPageFromImageInputSchema>;

const GenerateColoringPageFromImageOutputSchema = z.object({
  coloringPageDataUri: z.string().describe('The generated coloring page as a data URI.'),
});
export type GenerateColoringPageFromImageOutput = z.infer<typeof GenerateColoringPageFromImageOutputSchema>;


// Note: The new AI structural conversion approach uses direct image-to-image conversion
// instead of text-based prompts to preserve exact image structure


export async function generateColoringPageFromImage(input: GenerateColoringPageFromImageInput): Promise<GenerateColoringPageFromImageOutput> {
  const {photoDataUri} = input;
  
  console.log('Converting image to coloring page...');
  
  try {
    // Check if we have the required API keys
    const apiKey = process.env.IMAGE_TO_LINE_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.log('No API key available, using fallback generation');
      throw new Error('No API key available');
    }
    
    // Try real AI image generation first (strict - no mock fallback)
    const processedImageDataUri = await convertImageToColoringPageServer(photoDataUri);
    console.log('Successfully converted image to coloring page using AI');
    return { coloringPageDataUri: processedImageDataUri };
  } catch (error) {
    console.error('AI image generation failed (strict):', error);
    throw error;
  }
}
