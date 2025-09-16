
'use server';

import { checkAndDeductCreditsForFeature } from '@/lib/local-credits';
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
    // Check and deduct credits for the feature
    if (values.userId) {
        const creditCheck = await checkAndDeductCreditsForFeature(
          values.userId, 
          'TEXT_TO_COLORING',
          `تحويل فكرة نصية إلى صفحة تلوين: ${values.description}`
        );
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
