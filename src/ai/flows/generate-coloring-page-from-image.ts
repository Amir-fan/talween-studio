
'use server';
/**
 * @fileOverview Converts a user-uploaded image into a coloring page.
 *
 * - generateColoringPageFromImage - A function that takes an image and converts it.
 * - GenerateColoringPageFromImageInput - The input type for the function.
 * - GenerateColoringPageFromImageOutput - The return type for the function.
 */

import {z} from 'genkit';
import { convertImageToColoringPage } from '@/lib/ai-image-converter';

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
  
  console.log('🤖 Converting image to coloring page using AI ONLY...');
  
  try {
    // Use ONLY AI - no fallbacks, no filters
    const processedImageDataUri = await convertImageToColoringPage(photoDataUri);
    console.log('✅ AI conversion completed successfully');
    return { coloringPageDataUri: processedImageDataUri };
  } catch (error) {
    console.error('❌ AI conversion failed:', error);
    throw error;
  }
}
