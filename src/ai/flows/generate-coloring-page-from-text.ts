
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GenerateColoringPageFromTextInputSchema, GenerateColoringPageFromTextOutputSchema } from '@/app/create/word/types';
import type { GenerateColoringPageFromTextInput, GenerateColoringPageFromTextOutput } from '@/app/create/word/types';
import { dbAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { checkAndDeductCredits } from '@/lib/credits';


export const generateColoringPageFromTextFlow = ai.defineFlow(
    {
        name: 'generateColoringPageFromTextFlow',
        inputSchema: GenerateColoringPageFromTextInputSchema,
        outputSchema: GenerateColoringPageFromTextOutputSchema,
    },
    async (input) => {
        if (input.userId) {
            const creditCheck = await checkAndDeductCredits(input.userId, 1);
            if (!creditCheck.success) {
                 throw new Error(creditCheck.error === 'Not enough credits' ? 'NotEnoughCredits' : 'Failed to process credits.');
            }
        }

        const prompt = `
          Create a black-and-white line art illustration for a children’s coloring book.
    
          **Input Scene:** "${input.description}"
    
          **Rules:**
          1.  **Style:** Bold outlines, no colors, no shading, no gray areas.
          2.  **Simplicity:** Keep characters and objects simple and easy to recognize.
          3.  **Clarity:** Leave large empty spaces for coloring.
          4.  **Consistency:** Ensure the main character looks the same across all illustrations (same face, hair, clothes).
          5.  **Design:** The final output should be fun, cute, and child-friendly.
        `;
    
        const { media } = await ai.generate({
          model: 'googleai/gemini-2.0-flash-preview-image-generation',
          prompt: prompt,
          config: {
            apiKey: process.env.TEXT_TO_IMAGE_KEY,
            responseModalities: ['TEXT', 'IMAGE'],
          },
        });
    
        if (!media?.url) {
          throw new Error('Image generation failed to return a valid image URL.');
        }

        if (input.userId) {
            const creationId = uuidv4();
            const creationRef = dbAdmin.collection('creations').doc(creationId);
            await creationRef.set({
                userId: input.userId,
                description: input.description,
                imageUrl: media.url,
                difficulty: input.difficulty,
                createdAt: FieldValue.serverTimestamp(),
            });
        }
    
        return { coloringPageDataUri: media.url };
    }
);


export async function generateColoringPageFromText(
  input: GenerateColoringPageFromTextInput
): Promise<GenerateColoringPageFromTextOutput> {
  const result = await generateColoringPageFromTextFlow(input);
  return result;
}
