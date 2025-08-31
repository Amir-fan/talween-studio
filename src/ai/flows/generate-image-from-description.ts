
'use server';

/**
 * @fileOverview Generates a single coloring page image from a text description.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const GenerateImageFromDescriptionInputSchema = z.object({
    description: z.string().describe("The text description of the scene to illustrate."),
});
export type GenerateImageFromDescriptionInput = z.infer<typeof GenerateImageFromDescriptionInputSchema>;


export const GenerateImageFromDescriptionOutputSchema = z.object({
    imageDataUri: z.string().describe("The generated image as a data URI."),
});
export type GenerateImageFromDescriptionOutput = z.infer<typeof GenerateImageFromDescriptionOutputSchema>;


export async function generateImageFromDescription(input: GenerateImageFromDescriptionInput): Promise<GenerateImageFromDescriptionOutput> {

    const prompt = `Create a black-and-white line art illustration for a children’s coloring book.

Input Scene: ${input.description}

Rules:
- Style: Bold outlines, no colors, no shading, no gray areas.
- Keep characters and objects simple and easy to recognize.
- Leave large empty spaces for coloring.
- Ensure the main character looks the same across all illustrations (same face, hair, clothes).
- Child-friendly, fun, and uncluttered design.`

    const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: prompt,
        config: {
            apiKey: process.env.STORY_IMAGE_KEY,
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    if (!media?.url) {
        throw new Error("Image generation failed to return a valid image URL.");
    }
    
    return { imageDataUri: media.url };
}
