import { z } from 'zod';

const envClientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().endsWith('/'),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
});

// Debug logging for development
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 [ENV DEBUG] Client environment variables:');
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log(
    'NEXT_PUBLIC_GOOGLE_CLIENT_ID:',
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? '***SET***' : 'NOT_SET',
  );
}

const envClientData = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
};

let envClient: z.infer<typeof envClientSchema>;

try {
  envClient = envClientSchema.parse(envClientData);
} catch (error) {
  console.error('❌ [ENV ERROR] Client environment validation failed:', error);
  console.error('📋 [ENV DEBUG] Raw environment data:', envClientData);
  throw new Error('Client environment configuration is invalid');
}

export { envClient };
