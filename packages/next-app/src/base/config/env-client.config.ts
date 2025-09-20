import { z } from 'zod';

const envClientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().endsWith('/'),
});

export const envClient = envClientSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});
