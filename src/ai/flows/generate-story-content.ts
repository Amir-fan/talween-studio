
'use server';
/**
 * @fileOverview Generates the text content for a children's story, including chapters and illustration descriptions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const GenerateStoryContentInputSchema = z.object({
  childName: z.string().describe("Child's name in Arabic"),
  age: z.enum(['3-5', '6-8', '9-12']).describe('The age group of the child.'),
  place: z.string().describe("Location or 'auto-select'"),
  moralLesson: z.string().describe("Moral value or 'auto-select'"),
  numPages: z.number().optional().default(3), // Although the prompt fixes it to 3 chapters, we keep this for potential future flexibility.
});
export type GenerateStoryContentInput = z.infer<typeof GenerateStoryContentInputSchema>;

const ChapterSchema = z.object({
    chapterTitle: z.string().describe('The title of the chapter.'),
    narrative: z.string().describe('The text content of the chapter.'),
    illustrationDescription: z.string().describe('A simple description of an illustration for this chapter.'),
});

export const StoryContentOutputSchema = z.object({
    title: z.string().describe('The title of the entire story.'),
    chapters: z.array(ChapterSchema).describe('An array of chapters, each with text and an illustration description.'),
});
export type StoryContent = z.infer<typeof StoryContentOutputSchema>;


const storyContentPrompt = ai.definePrompt({
    name: 'storyContentPrompt',
    input: { schema: GenerateStoryContentInputSchema },
    output: { schema: StoryContentOutputSchema },
    prompt: `You are a children’s story generator that creates short, simple stories in Arabic designed for coloring books.

Instructions:
1. Required Inputs:
   - Main character name: {{childName}}
   - Age: {{age}}
   - Place/Setting: {{place}}
   - Lesson/Moral: {{moralLesson}}

2. Story Rules:
   - Language: Arabic only.
   - Story length: Short, divided into 3 chapters maximum.
   - Each chapter must include:
       • Chapter Title (2–3 words).
       • Narrative (50–80 words) suitable for {{age}} years old.
       • Illustration Description: a single, simple scene description for coloring.

3. Story Structure:
   - Clear beginning, middle, and end.
   - Fun, imaginative, and child-friendly tone.
   - End of the story should reinforce the lesson/moral.

4. Illustration Description Rules:
   - Describe only one scene per chapter.
   - Keep it simple: (e.g., “علي يقف أمام المدرسة مع حقيبته”).
   - No colors mentioned — line art only.
   - Keep the main character {{childName}} consistent across all chapters (same face, hair, and clothing).

Output Format:
- Story Title
- Chapter 1: Title + Narrative + Illustration Description
- Chapter 2: Title + Narrative + Illustration Description
- Chapter 3: Title + Narrative + Illustration Description
`,
    config: {
        model: 'googleai/gemini-2.0-flash',
        apiKey: process.env.STORY_TEXT_KEY,
    }
});


export const generateStoryContentFlow = ai.defineFlow(
    {
        name: 'generateStoryContentFlow',
        inputSchema: GenerateStoryContentInputSchema,
        outputSchema: StoryContentOutputSchema,
    },
    async (input) => {
        const { output } = await storyContentPrompt(input);
        if (!output) {
            throw new Error('Failed to generate story content from AI.');
        }
        return output;
    }
);

export async function generateStoryContent(input: GenerateStoryContentInput): Promise<StoryContent> {
    return generateStoryContentFlow(input);
}
