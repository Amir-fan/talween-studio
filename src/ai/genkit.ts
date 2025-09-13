import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Force IPv4 and set timeout for better connectivity
process.env.NODE_OPTIONS = '--dns-result-order=ipv4first --max-old-space-size=4096';

// Additional network configuration
process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_API_KEY;

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY environment variable is required');
}

export const ai = genkit({
  plugins: [googleAI({
    apiKey: process.env.GOOGLE_API_KEY,
  })],
  model: 'googleai/gemini-1.5-pro',
});
