'use server';
import { z } from 'zod';
import { generateColoringPageFromText as generateColoringPageFlow } from '@/ai/flows/generate-coloring-page-from-text';

export const GenerateColoringPageFromTextInputSchema = z.object({
  description: z.string().min(3, {
    message: 'الرجاء إدخال وصف لا يقل عن 3 أحرف.',
  }),
  difficulty: z.enum(['Simple', 'Detailed'], {
    required_error: 'الرجاء اختيار مستوى الصعوبة.',
  }),
});
export type GenerateColoringPageFromTextInput = z.infer<typeof GenerateColoringPageFromTextInputSchema>;

export const GenerateColoringPageFromTextOutputSchema = z.object({
  coloringPageDataUri: z.string().describe('The generated coloring page as a data URI.'),
});
export type GenerateColoringPageFromTextOutput = z.infer<typeof GenerateColoringPageFromTextOutputSchema>;


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
