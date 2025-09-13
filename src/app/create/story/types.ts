
import { z } from 'zod';

export const PageSchema = z.object({
  pageNumber: z.number(),
  text: z.string(),
  imageDataUri: z.string(),
});

export const StoryAndPagesOutputSchema = z.object({
  title: z.string(),
  pages: z.array(PageSchema),
});
export type StoryAndPagesOutput = z.infer<typeof StoryAndPagesOutputSchema>;


export const StoryAndPagesInputSchema = z.object({
  userId: z.string().describe("The authenticated user's ID."),
  childName: z.string().describe("Child's name in Arabic"),
  ageGroup: z.enum(['3-5', '6-8', '9-12']).describe('The age group of the child.'),
  numberOfPages: z.enum(['4', '8', '12', '16']).describe('The number of pages for the story.'),
  setting: z.string().describe("Location or 'auto-select'"),
  lesson: z.string().describe("Moral value or 'auto-select'"),
});
export type StoryAndPagesInput = z.infer<typeof StoryAndPagesInputSchema>;
