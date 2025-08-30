'use server';
/**
 * @fileOverview Generates the textual content of a story based on user inputs.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StoryContentInputSchema = z.object({
  child_name: z.string().describe("Child's name in Arabic"),
  age_group: z.enum(['3-5', '6-8', '9-12']).describe('The age group of the child.'),
  number_of_pages: z.enum(['4', '8', '12', '16']).describe('The number of pages for the story.'),
  setting: z.string().describe("Location or 'auto-select'"),
  lesson: z.string().describe("Moral value or 'auto-select'"),
  story_id: z.string().describe('Unique identifier for image API coordination'),
});
export type StoryContentInput = z.infer<typeof StoryContentInputSchema>;


const PageSchema = z.object({
    page_number: z.any().describe('The page number or "cover".'),
    content: z.string().describe('The text for the page. For the cover, this is the title.'),
    illustration_description: z.string().describe('A detailed description for the image generator.'),
});

const StoryMetadataSchema = z.object({
    story_id: z.string(),
    title: z.string(),
    age_group: z.string(),
    main_lesson: z.string(),
    setting: z.string(),
    total_pages: z.number(),
});

const StoryContentOutputSchema = z.object({
  story_metadata: StoryMetadataSchema,
  pages: z.array(PageSchema),
});
export type StoryContentOutput = z.infer<typeof StoryContentOutputSchema>;

const storyPromptText = `You are a children’s story generator for coloring books. 
Your goal is to create a short, fun, and easy-to-read story that can also be illustrated in black-and-white line art.

Story Rules:
1. Main Character: {{child_name}}
2. Age of the Child: {{age_group}}
3. Setting/Place: {{setting}}
4. Lesson to Learn: {{lesson}}

Structure:
- Title of the story (3–5 words).
- Divide the story into 2–3 short chapters (100–150 words each). The number of pages should be {{number_of_pages}}.
- Each chapter must include:
   • Chapter title (2–4 words).
   • Narrative in simple, age-appropriate language for {{age_group}}-year-olds.
   • An "illustration_description" for a single scene.

Illustration Description Rules:
- The first chapter must clearly describe the main character’s appearance (hair, clothes, face shape) → this becomes the reference design.
- Later chapters must reference this same character: ("Same {{child_name}} as Chapter 1, with the same face and clothes, but now doing [action].")
- Descriptions should be easy to draw as coloring pages (simple objects, no complex details, no colors, only outlines).

Tone:
- Warm, imaginative, and positive.
- Simple enough for children of {{age_group}}.
- End with a clear statement of the learned lesson.

You must output a valid JSON object that conforms to the provided schema.
`;


const storyPrompt = ai.definePrompt({
    name: 'storyContentPrompt',
    input: { schema: StoryContentInputSchema },
    output: { schema: StoryContentOutputSchema, format: 'json' },
    prompt: storyPromptText,
    config: {
        model: 'googleai/gemini-2.0-flash',
        apiKey: process.env.STORY_TEXT_KEY
    }
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
      throw new Error('Failed to generate story content. The model returned no output.');
    }
    return output;
  }
);


export async function generateStoryContent(input: StoryContentInput): Promise<StoryContentOutput> {
    return generateStoryContentFlow(input);
}
