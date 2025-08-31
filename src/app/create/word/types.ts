import { z } from 'zod';

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
