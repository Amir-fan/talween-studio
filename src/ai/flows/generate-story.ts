'use server';
/**
 * @fileOverview A children's story generator.
 *
 * - generateStory - A function that handles the story generation process.
 * - GenerateStoryInput - The input type for the generateStory function.
 * - GenerateStoryOutput - The return type for the generateStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStoryInputSchema = z.object({
  childName: z.string().describe("The main character's name."),
  age: z.string().describe('The age of the child.'),
  place: z.string().describe('The setting of the story.'),
  lesson: z.string().describe('The moral or lesson to be learned.'),
});
export type GenerateStoryInput = z.infer<typeof GenerateStoryInputSchema>;

const ChapterSchema = z.object({
    chapterTitle: z.string().describe('The title of the chapter (2-4 words).'),
    narrative: z.string().describe('The narrative of the chapter (150-200 words).'),
    illustrationDescription: z.string().describe('A description for a coloring book illustration for this chapter.'),
});

const GenerateStoryOutputSchema = z.object({
  storyTitle: z.string().describe('The creative title of the story (3-5 words).'),
  chapters: z.array(ChapterSchema).describe('An array of story chapters.'),
});
export type GenerateStoryOutput = z.infer<typeof GenerateStoryOutputSchema>;

export async function generateStory(input: GenerateStoryInput): Promise<GenerateStoryOutput> {
  return generateStoryFlow(input);
}

const storyPrompt = ai.definePrompt({
  name: 'generateStoryPrompt',
  input: {schema: GenerateStoryInputSchema},
  output: {schema: GenerateStoryOutputSchema},
  prompt: `You are a children’s story generator specialized in creating simple coloring-book style stories. 
The goal is to create a short, engaging, and wholesome story for a child.

Follow these rules:

1. Story Elements:
   - Main Character: {{{childName}}}
   - Age of the Child: {{{age}}}
   - Setting/Place: {{{place}}}
   - Moral/Lesson: {{{lesson}}}

2. Structure:
   - Title of the story (creative, 3–5 words).
   - Divide the story into 3 to 5 chapters.
   - Each chapter should have:
     • Chapter title (2–4 words).
     • Narrative (150–200 words) in simple, age-appropriate language.
     • A short "illustration description" that describes a single scene to be drawn in coloring-book style.

3. Writing Style:
   - Fun, imaginative, and positive tone.
   - Clear beginning, middle, and end.
   - Keep vocabulary suitable for {{{age}}}-year-old children.
   - Reinforce the moral/lesson in the final chapter.

4. Illustration Description Rules:
   - One scene per chapter.
   - Describe in clear, simple terms (example: “Ali standing under a big tree holding a balloon”).
   - No colors — only describe outlines, objects, and characters so it can be drawn as a line-art coloring page.
   - Consistency: Keep {{{childName}}} looking the same across all chapters.

Output Format:
- Story Title
- For each chapter:
   • Chapter Title
   • Narrative
   • Illustration Description`,
});

const generateStoryFlow = ai.defineFlow(
  {
    name: 'generateStoryFlow',
    inputSchema: GenerateStoryInputSchema,
    outputSchema: GenerateStoryOutputSchema,
  },
  async input => {
    const {output} = await storyPrompt(input);
    return output!;
  }
);
