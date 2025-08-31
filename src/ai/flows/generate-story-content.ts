
'use server';
/**
 * @fileOverview Generates the text content for a story, including illustration descriptions.
 * This flow is the first step in the dual-API story generation system.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StoryContentInputSchema = z.object({
  childName: z.string().describe("The main character's name."),
  age: z.string().describe("The child's age group (e.g., '4-6')."),
  place: z.string().describe('The setting of the story.'),
  moralLesson: z.string().describe('The lesson the story should teach.'),
  numPages: z.number().describe('The total number of pages in the story.')
});
export type StoryContentInput = z.infer<typeof StoryContentInputSchema>;

const PageContentSchema = z.object({
    pageNumber: z.number(),
    text: z.string().describe('The narrative text for this page.'),
    illustrationDescription: z.string().describe('A detailed description for the illustrator.'),
});

const ChapterContentSchema = z.object({
    chapterTitle: z.string(),
    narrative: z.string(),
    illustrationDescription: z.string(),
});

const StoryContentOutputSchema = z.object({
  title: z.string().describe('The title of the story.'),
  chapters: z.array(ChapterContentSchema).describe('An array of chapter content objects.')
});
export type StoryContent = z.infer<typeof StoryContentOutputSchema>;


const storyPrompt = ai.definePrompt({
  name: 'generateStoryContentPrompt',
  input: {schema: StoryContentInputSchema},
  output: {schema: StoryContentOutputSchema},
  config: {
      apiKey: process.env.STORY_TEXT_KEY,
  },
  prompt: `You are a children’s story generator for coloring books. 
Your goal is to create a short, fun, and easy-to-read story that can also be illustrated in black-and-white line art.

Story Rules:
1. Main Character: {{childName}}
2. Age of the Child: {{age}}
3. Setting/Place: {{place}}
4. Lesson to Learn: {{moralLesson}}

Structure:
- Title of the story (3–5 words).
- Divide the story into 2–3 short chapters (100–150 words each).
- Each chapter must include:
   • Chapter title (2–4 words).
   • Narrative in simple, age-appropriate language for {{age}}-year-olds.
   • An "illustration description" for a single scene.

Illustration Description Rules:
- First chapter must clearly describe the main character’s appearance (hair, clothes, face shape) → this becomes the reference design.
- Later chapters must reference this same character: ("Same {{childName}} as Chapter 1, with the same face and clothes, but now doing [action].")
- Descriptions should be easy to draw as coloring pages (simple objects, no complex details, no colors, only outlines).

Tone:
- Warm, imaginative, and positive.
- Simple enough for children of {{age}}.
- End with a clear statement of the learned lesson.`,
});

const generateStoryContentFlow = ai.defineFlow(
  {
    name: 'generateStoryContentFlow',
    inputSchema: StoryContentInputSchema,
    outputSchema: StoryContentOutputSchema,
  },
  async (input) => {
    const { output } = await storyPrompt(input);
    if (!output) {
        throw new Error("Failed to generate story content.");
    }
    return output;
  }
);

export async function generateStoryContent(
  input: StoryContentInput
): Promise<StoryContent> {
  return generateStoryContentFlow(input);
}
