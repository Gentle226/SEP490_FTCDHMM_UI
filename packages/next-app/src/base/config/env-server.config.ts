import { z } from 'zod';

const envServerSchema = z.object({
  API_URL: z.string().url().endsWith('/'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const envServerData = {
  API_URL: process.env.API_URL,
  NODE_ENV: process.env.NODE_ENV,
};

let envServer: z.infer<typeof envServerSchema>;

try {
  envServer = envServerSchema.parse(envServerData);
} catch (error) {
  console.error('❌ [ENV ERROR] Server environment validation failed:', error);
  console.error('📋 [ENV DEBUG] Raw environment data:', envServerData);
  throw new Error('Server environment configuration is invalid');
}

export { envServer };
