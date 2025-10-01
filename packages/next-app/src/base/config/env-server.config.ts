import { z } from 'zod';

const envServerSchema = z.object({
  API_URL: z.string().url().endsWith('/'),
});

export const envServer = envServerSchema.parse({
  API_URL: process.env.API_URL || 'http://localhost:7116/',
});
