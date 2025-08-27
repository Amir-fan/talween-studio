'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-story.ts';
import '@/ai/flows/generate-coloring-page-from-text.ts';
import '@/ai/flows/generate-coloring-page-from-description.ts';
