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


const imageConversionPrompt = `You are an image editor that converts any given image into a black-and-white coloring-book style illustration.

Instructions:
- Take the input image and transform it into clean line art.
- Keep only black outlines, no colors, no shading, no gray areas.
- Use bold, simple outlines that are easy for children to color.
- Keep the design uncluttered with large open spaces.
- Avoid small details or complex textures that are difficult to color.
- Make the final output fun, cute, and child-friendly.
- Preserve the main characters or objects from the original image but simplify them into cartoon-style outlines.
- Ensure the result looks like a page from a children’s coloring book.`;

const generateColoringPageFromImageFlow = ai.defineFlow(
  {
    name: 'generateColoringPageFromImageFlow',
    inputSchema: GenerateColoringPageFromImageInputSchema,
    outputSchema: GenerateColoringPageFromImageOutputSchema,
  },
  async ({photoDataUri}) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {media: {url: photoDataUri}},
        {text: imageConversionPrompt},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        apiKey: process.env.IMAGE_TO_LINE_KEY,
      },
    });

    if (!media?.url) {
        throw new Error("Image generation failed to return a valid URL.");
    }
    
    return {coloringPageDataUri: media.url};
  }
);

export async function generateColoringPageFromImage(input: GenerateColoringPageFromImageInput): Promise<GenerateColoringPageFromImageOutput> {
  return generateColoringPageFromImageFlow(input);
}
