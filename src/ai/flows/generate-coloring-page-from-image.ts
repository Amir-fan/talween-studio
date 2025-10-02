
'use server';
/**
 * @fileOverview Converts a user-uploaded image into a coloring page.
 *
 * - generateColoringPageFromImage - A function that takes an image and converts it.
 * - GenerateColoringPageFromImageInput - The input type for the function.
 * - GenerateColoringPageFromImageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {createMockColoringPageFromImage, createEnhancedMockFromImage} from './mock-ai-fallback';
import {GoogleGenerativeAI} from '@google/generative-ai';
import { generateWithRetry, STRICT_BLACK_WHITE_PROMPT } from '@/lib/image-validation';
// Use image analysis + generation for accurate conversion
async function convertImageToColoringPageServer(imageDataUri: string): Promise<string> {
  console.log('Converting uploaded image to coloring page using AI...');
  
  // First analyze the uploaded image to get accurate description
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY or GOOGLE_API_KEY environment variable is required');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
  // Extract base64 data from data URI
  const base64Data = imageDataUri.split(',')[1];
  
  // Analyze the uploaded image in detail
  const analysisResult = await model.generateContent([
    "Look at this image very carefully. I need you to describe EXACTLY what you see - the main subject, its exact appearance, pose, angle, details, and background. Be extremely specific about every detail including colors, shapes, textures, facial features (if applicable), and any unique characteristics. Focus on the EXACT composition, framing, and angle. This will be used to recreate the EXACT same image in coloring book style - do NOT change the angle, pose, or add extra elements.",
    {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg"
      }
    }
  ]);
  
  const imageDescription = analysisResult.response.text() || 'a person';
  console.log('AI analyzed image as:', imageDescription);
  
  // Use retry mechanism to ensure black and white output
  const imageUrl = await generateWithRetry(async () => {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-generate-preview-06-06',
      prompt: `${STRICT_BLACK_WHITE_PROMPT}

Convert this EXACT image into a pure black and white line art coloring page: "${imageDescription}"

Additional Requirements:
- Convert the EXACT same image - do NOT change the angle, pose, or composition
- Keep the EXACT same framing and perspective as the original
- Pure white background only - no extra background details
- Same number of subjects/elements as described - do NOT add more
- Same details, features, and characteristics as described
- Do NOT add any elements not in the description
- Do NOT change the subject's appearance, pose, or angle
- Do NOT add extra people, objects, or elements
- This must be the EXACT same image converted to line art style only
- Work for ANY type of image - people, animals, objects, anything`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error("AI image generation failed to return a valid URL");
    }
    
    return media.url;
  });

  console.log('Successfully converted image to coloring page using AI');
  return imageUrl;
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


const imageConversionPrompt = `Convert this image into a black and white line art coloring page. Create bold black outlines on white background. Make it simple and child-friendly for coloring.`;


export async function generateColoringPageFromImage(input: GenerateColoringPageFromImageInput): Promise<GenerateColoringPageFromImageOutput> {
  const {photoDataUri} = input;
  
  console.log('Converting image to coloring page using real AI image generation...');
  
  try {
    // Try real AI image generation first
    const processedImageDataUri = await convertImageToColoringPageServer(photoDataUri);
    console.log('Successfully converted image to coloring page using AI');
    return { coloringPageDataUri: processedImageDataUri };
  } catch (error) {
    console.error('AI image generation failed, using fallback:', error);
    
    // Fallback to mock generation if AI fails
    console.log('Using fallback image generation...');
    const fallbackImageDataUri = createEnhancedMockFromImage(photoDataUri);
    console.log('Successfully generated fallback coloring page');
    return { coloringPageDataUri: fallbackImageDataUri };
  }
}
