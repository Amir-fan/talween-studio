
'use server';

// This is a pure server action file. It only contains the async function.

import { generateColoringPageFromText as generateColoringPageFlow } from '@/ai/flows/generate-coloring-page-from-text';
import type { GenerateColoringPageFromTextInput, GenerateColoringPageFromTextOutput } from './actions';


export async function generateImageAction(
  values: GenerateColoringPageFromTextInput
): Promise<{
  success: boolean;
  data?: GenerateColoringPageFromTextOutput;
  error?: string;
}> {
  try {
    const result = await generateColoringPageFlow(values);
    return { success: true, data: result };
  } catch (error) {
    console.error('Image generation failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'فشلت عملية إنشاء الصورة. الرجاء المحاولة مرة أخرى.';
    return { success: false, error: errorMessage };
  }
}
