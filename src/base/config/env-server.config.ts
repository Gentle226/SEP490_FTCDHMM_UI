import { z } from 'zod';

const envServerSchema = z.object({
  API_URL: z.string().url().endsWith('/'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const envServer = envServerSchema.parse({
  API_URL: process.env.API_URL,
  NODE_ENV: process.env.NODE_ENV,
});
