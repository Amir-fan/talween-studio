
import { z } from 'zod';

export const GenerateColoringPageFromTextInputSchema = z.object({
  description: z.string().min(3, {
    message: 'الرجاء إدخال وصف لا يقل عن 3 أحرف.',
  }),
  difficulty: z.enum(['Simple', 'Detailed'], {
    required_error: 'الرجاء اختيار مستوى الصعوبة.',
  }),
  userId: z.string().optional(),
  userEmail: z.string().email().optional(),
}).refine((data) => {
  const banned = [
    'سلاح','مسدس','بندقية','رصاص','قنبلة','مخدر','مخدرات','كحول','عري','إباحية','دموي','قتل','انتحار','إيذاء','إيذاء النفس',
    'gun','pistol','rifle','weapon','bullet','bomb','drug','drugs','alcohol','nude','nudity','porn','gore','kill','murder','suicide','self harm','self-harm'
  ];
  const d = (data.description || '').toLowerCase();
  return !banned.some(term => d.includes(term));
}, {
  message: 'الوصف يحتوي على محتوى غير مسموح به (أسلحة/مخدرات/عري/إيذاء).',
  path: ['description']
});
export type GenerateColoringPageFromTextInput = z.infer<typeof GenerateColoringPageFromTextInputSchema>;

export const GenerateColoringPageFromTextOutputSchema = z.object({
  coloringPageDataUri: z.string().describe('The generated coloring page as a data URI.'),
});
export type GenerateColoringPageFromTextOutput = z.infer<typeof GenerateColoringPageFromTextOutputSchema>;
