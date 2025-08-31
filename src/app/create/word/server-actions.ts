
'use server';

import { checkAndDeductCredits } from '@/lib/credits';
import { generateColoringPageFromTextFlow } from '@/ai/flows/generate-coloring-page-from-text-flow';
import type { GenerateColoringPageFromTextInput, GenerateColoringPageFromTextOutput } from './types';


export async function generateImageAction(
  values: GenerateColoringPageFromTextInput
): Promise<{
  success: boolean;
  data?: GenerateColoringPageFromTextOutput;
  error?: string;
}> {
  try {
    if (values.userId) {
        const creditCheck = await checkAndDeductCredits(values.userId, 1);
        if (!creditCheck.success) {
            throw new Error(creditCheck.error === 'Not enough credits' ? 'NotEnoughCredits' : 'Failed to process credits.');
        }
    }

    const result = await generateColoringPageFromTextFlow(values);
    return { success: true, data: result };
  } catch (error) {
    console.error('Image generation failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'فشلت عملية إنشاء الصورة. الرجاء المحاولة مرة أخرى.';
    
     if (errorMessage.includes('NotEnoughCredits')) {
        return { success: false, error: 'NotEnoughCredits' };
    }
    return { success: false, error: errorMessage };
  }
}
