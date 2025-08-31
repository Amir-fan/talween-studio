
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

const StoryContentOutputSchema = z.object({
  title: z.string().describe('The title of the story.'),
  pages: z.array(PageContentSchema).describe('An array of page content objects.')
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
Your entire output must be a single JSON object.

Story Rules:
1. Main Character: {{childName}}
2. Age of the Child: {{age}}
3. Setting/Place: {{place}}
4. Lesson to Learn: {{moralLesson}}
5. Number of pages: {{numPages}}

Structure:
- The JSON object must have a "title" field (3-5 words).
- The JSON object must have a "pages" field, which is an array of page objects.
- Each object in the "pages" array represents one page and must contain:
    - "pageNumber": The number of the page.
    - "text": The narrative for that page, in simple, age-appropriate language for {{age}}-year-olds.
    - "illustrationDescription": A description for a single scene on that page.

Illustration Description Rules:
- The description for page 1 MUST clearly describe the main character’s appearance (e.g., "A boy named {{childName}} with short curly hair, wearing a t-shirt with a star and shorts."). This becomes the reference design.
- For all subsequent pages (page 2 and beyond), the description MUST reference the character consistently (e.g., "The same boy, {{childName}}, from page 1, now running in the park.").
- Descriptions should be easy to draw as coloring pages (simple objects, no complex details, no colors, only outlines).

Tone:
- Warm, imaginative, and positive.
- Simple enough for children of age {{age}}.
- The story should conclude with a clear statement of the learned lesson on the final page.
`,
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
