import { z } from 'zod';

const envClientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().endsWith('/'),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
});

export const envClient = envClientSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
});
