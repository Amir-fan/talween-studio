'use server';

import {
  generateColoringPageFromText,
  GenerateColoringPageFromTextInput,
} from '@/ai/flows/generate-coloring-page-from-text';

export async function generateImageAction(
  values: GenerateColoringPageFromTextInput
): Promise<{
  success: boolean;
  data?: { coloringPageDataUri: string };
  error?: string;
}> {
  try {
    const result = await generateColoringPageFromText(values);
    return { success: true, data: result };
  } catch (error) {
    console.error('Image generation failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'فشلت عملية إنشاء الصورة. الرجاء المحاولة مرة أخرى.';
    return { success: false, error: errorMessage };
  }
}
