'use server';

import {
  generateColoringPageFromImage,
  GenerateColoringPageFromImageInput,
} from '@/ai/flows/generate-coloring-page-from-image';

export async function generateImageFromPhotoAction(
  values: GenerateColoringPageFromImageInput
): Promise<{
  success: boolean;
  data?: { coloringPageDataUri: string };
  error?: string;
}> {
  try {
    const result = await generateColoringPageFromImage(values);
    return { success: true, data: result };
  } catch (error) {
    console.error('Image from photo generation failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'فشلت عملية إنشاء الصورة. الرجاء المحاولة مرة أخرى.';
    return { success: false, error: errorMessage };
  }
}
