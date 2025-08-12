import { z } from 'zod';

const envSchema = z.object({
  API_URL: z.string().url().endsWith('/'),
});

export const env = envSchema.parse(process.env);
