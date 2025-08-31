'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/create-story-and-coloring-pages.ts';
import '@/ai/flows/generate-coloring-page-from-image.ts';
import '@/ai/flows/generate-coloring-page-from-text.ts';
