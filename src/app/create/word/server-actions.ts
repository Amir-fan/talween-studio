
'use server';

import { generateColoringPageFromText } from '@/ai/flows/generate-coloring-page-from-text';
import type { GenerateColoringPageFromTextInput, GenerateColoringPageFromTextOutput } from './types';


export async function generateImageAction(
  values: GenerateColoringPageFromTextInput
): Promise<{
  success: boolean;
  data?: GenerateColoringPageFromTextOutput;
  error?: string;
}> {
  try {
    const result = await generateColoringPageFromText(values);
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
