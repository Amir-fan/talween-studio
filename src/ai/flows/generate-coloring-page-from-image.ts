
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
  
  // Analyze the uploaded image in detail by first querying available models
  const listModels = async () => {
    const urls = [
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    ];
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const json = await res.json();
        if (json?.models?.length) return json.models as any[];
      } catch {
        // ignore and try next
      }
    }
    return [] as any[];
  };

  const models = await listModels();
  const modelNames = models.map((m: any) => m.name || m.baseModel).filter(Boolean);
  // Prefer flash-latest, then other flash, then pro-latest
  const preferred = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-001',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash-lite-001'
  ];
  const pick = preferred.find(p => modelNames.some(n => n.includes(p)))
    || modelNames.find(n => /gemini.*flash/i.test(n))
    || modelNames.find(n => /gemini.*pro/i.test(n));

  if (!pick) {
    throw new Error(`No suitable Gemini model found. Available: ${modelNames.join(', ') || 'none'}`);
  }

  // Decide REST endpoint version
  const useV1 = modelNames.some(n => n.includes(pick) && n.startsWith('models/')) ? true : true;
  // Use v1beta for 1.5-* names, v1 for 2.0*
  const restEndpoint = pick.startsWith('gemini-2')
    ? `https://generativelanguage.googleapis.com/v1/models/${pick}:generateContent?key=${apiKey}`
    : `https://generativelanguage.googleapis.com/v1beta/models/${pick}:generateContent?key=${apiKey}`;

  const analysisBody: any = {
    contents: [
      {
        parts: [
          { text: 'Describe EXACTLY what is in this image (subject, pose, angle, composition, and all details).' },
          { inline_data: { mime_type: sourceMime, data: base64Data } }
        ]
      }
    ]
  };

  const analysisRes = await fetch(restEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(analysisBody)
  });
  if (!analysisRes.ok) {
    const errText = await analysisRes.text();
    throw new Error(`Gemini analyze failed for model ${pick}: ${analysisRes.status} ${errText}`);
  }
  const analysisJson = await analysisRes.json();
  const analysisText = (analysisJson?.candidates?.[0]?.content?.parts || [])
    .map((p: any) => p?.text)
    .filter(Boolean)
    .join(' ')
    .trim();
  if (!analysisText) {
    throw new Error('Gemini analyze returned empty description');
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
