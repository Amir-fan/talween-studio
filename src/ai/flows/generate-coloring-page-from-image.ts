
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
// Remove mock fallbacks; enforce strict generation
import {GoogleGenerativeAI} from '@google/generative-ai';
import { generateWithRetryStrict, STRICT_BLACK_WHITE_PROMPT } from '@/lib/image-validation';
// Use image analysis + generation for accurate conversion
async function convertImageToColoringPageServer(imageDataUri: string): Promise<string> {
  console.log('Converting uploaded image to coloring page using AI...');
  
  // First analyze the uploaded image to get accurate description
  const apiKey = process.env.IMAGE_TO_LINE_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('IMAGE_TO_LINE_KEY, GEMINI_API_KEY, or GOOGLE_API_KEY environment variable is required');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Extract mime and base64 data from data URI
  const [meta, b64] = imageDataUri.split(',');
  const mimeMatch = meta?.match(/^data:(.*?);base64$/);
  const sourceMime = mimeMatch?.[1] || 'image/jpeg';
  const base64Data = b64;
  
  // Analyze the uploaded image in detail (try multiple stable model names)
  const analyze = async (modelName: string) => {
    const model = genAI.getGenerativeModel({ model: modelName });
    return await model.generateContent([
      "Look at this image very carefully. I need you to describe EXACTLY what you see - the main subject, its exact appearance, pose, angle, details, and background. Be extremely specific about every detail including colors, shapes, textures, facial features (if applicable), and any unique characteristics. Focus on the EXACT composition, framing, and angle. This will be used to recreate the EXACT same image in coloring book style - do NOT change the angle, pose, or add extra elements.",
      {
        inlineData: {
          data: base64Data,
          mimeType: sourceMime
        }
      }
    ]);
  };

  let analysisText = '';
  const candidates = ['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  let lastErr: any = null;
  for (const m of candidates) {
    try {
      const res = await analyze(m);
      analysisText = res.response.text();
      if (analysisText) break;
    } catch (e) {
      lastErr = e;
      console.warn(`Gemini analyze failed for ${m}:`, e instanceof Error ? e.message : e);
      continue;
    }
  }
  if (!analysisText) {
    if (lastErr) {
      const msg = lastErr instanceof Error ? lastErr.message : String(lastErr);
      throw new Error(`Gemini analysis failed across models (flash-latest, pro-latest, flash, pro): ${msg}`);
    }
    throw new Error('Failed to analyze image with Gemini models');
  }

  const imageDescription = analysisText || 'a person';
  console.log('AI analyzed image as:', imageDescription);
  
  // Use retry mechanism to ensure black and white output
  const imageUrl = await generateWithRetryStrict(async () => {
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

  // Fetch the generated image and return as data URI to avoid remote domain issues
  try {
    const response = await fetch(imageUrl);
    const contentType = response.headers.get('content-type') || 'image/png';
    const buffer = Buffer.from(await response.arrayBuffer());
    const base64Out = buffer.toString('base64');
    const dataUri = `data:${contentType};base64,${base64Out}`;
    console.log('Successfully converted image to coloring page using AI');
    return dataUri;
  } catch (fetchErr) {
    console.warn('Could not convert generated URL to data URI, returning URL instead');
    return imageUrl;
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


const imageConversionPrompt = `Convert this image into a black and white line art coloring page. Create bold black outlines on white background. Make it simple and child-friendly for coloring.`;


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
