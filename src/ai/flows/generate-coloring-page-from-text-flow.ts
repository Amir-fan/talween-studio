
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { GenerateColoringPageFromTextInputSchema, GenerateColoringPageFromTextOutputSchema } from '@/app/create/word/types';
import type { GenerateColoringPageFromTextOutput } from '@/app/create/word/types';
import { dbAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';


export const generateColoringPageFromTextFlow = ai.defineFlow(
    {
        name: 'generateColoringPageFromTextFlow',
        inputSchema: GenerateColoringPageFromTextInputSchema,
        outputSchema: GenerateColoringPageFromTextOutputSchema,
    },
    async (input) => {
        const prompt = `
          Create a black-and-white line art illustration for a children’s coloring book.
    
          **Input Scene:** "${input.description}"
    
          **Rules:**
          1.  **Style:** Bold outlines, no colors, no shading, no gray areas.
          2.  **Simplicity:** Keep characters and objects simple and easy to recognize. Difficulty: ${input.difficulty}.
          3.  **Clarity:** Leave large empty spaces for coloring.
          4.  **Design:** The final output should be fun, cute, and child-friendly.
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
                id: creationId,
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
