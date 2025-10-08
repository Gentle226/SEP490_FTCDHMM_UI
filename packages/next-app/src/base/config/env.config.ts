import { z } from 'zod';

const envSchema = z.object({
  API_URL: z.string().url().endsWith('/'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse({
  API_URL: process.env.API_URL,
  NODE_ENV: process.env.NODE_ENV,
});
