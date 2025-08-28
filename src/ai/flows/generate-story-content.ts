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
    page_number: z.any(),
    content: z.string(),
    interaction: z.string().nullable().optional(),
    image_reference: z.string(),
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
  usage_instructions: z.string(),
  educational_objectives: z.array(z.string()).optional(),
});
export type StoryContentOutput = z.infer<typeof StoryContentOutputSchema>;


const storyPrompt = ai.definePrompt({
    name: 'storyContentPrompt',
    input: { schema: StoryContentInputSchema },
    output: { schema: StoryContentOutputSchema, format: 'json' },
    prompt: `You are a professional Arabic children's story writer specializing in creating personalized interactive stories for Arab and Gulf children. Your mission is to create story content ONLY (text) that will be paired with images generated separately.

## Input Parameters:
{
  "child_name": "{{child_name}}",
  "age_group": "{{age_group}}",
  "number_of_pages": "{{number_of_pages}}",
  "setting": "{{setting}}",
  "lesson": "{{lesson}}",
  "story_id": "{{story_id}}"
}

## Age-Specific Content Guidelines:

### Ages 3-5:
- Simple sentences (5-8 words)
- Basic vocabulary only
- One main concept per page
- Repetitive, rhythmic language
- Focus on colors, shapes, numbers 1-5

### Ages 6-8:
- Medium sentences (8-12 words)
- Introduce new vocabulary in context
- 2-3 concepts per page
- Simple dialogue
- Basic moral reasoning

### Ages 9-12:
- Complex sentences (12-18 words)
- Rich vocabulary
- Multiple concepts and subplots
- Character development
- Deep moral and ethical discussions

## Cultural Requirements:
- Write entirely in Modern Standard Arabic
- Include Islamic values naturally
- Use Gulf/Arab cultural references
- Include phrases like "الحمد لله", "إن شاء الله" naturally
- Reference traditional customs and values

## Output Format:
You must output a valid JSON object that conforms to the provided schema. Each "page" object must have a unique "image_reference" string (e.g., "cover", "page_1", "page_2").

## Story Structure Requirements:
- A 4-page story should have a simple beginning, problem, solution, and conclusion.
- An 8-page story should have an introduction, character development, conflict, resolution, lesson, and conclusion.
- 12-16 pages stories should have extended character development, multiple mini-lessons, and rich interactions.

## Interactive Elements by Age:
- **3-5**: "ابحث عن...", "عدّ كم...", "أشر إلى..."
- **6-8**: "ما رأيك في...؟", "ماذا كنت ستفعل...؟"
- **9-12**: "لماذا اتخذ هذا القرار؟", "كيف نطبق هذا في حياتنا؟"

## Quality Checklist:
- Child's name appears 2+ times per page naturally
- Story flows logically and engagingly
- Moral lesson integrated smoothly, not preachy
- Language appropriate for specified age
- Cultural and religious sensitivity maintained
- Each page has clear narrative purpose

Generate a complete story following these specifications.
`,
    config: {
        model: 'googleai/gemini-2.0-flash',
        apiKey: process.env.STORY_API_KEY
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
