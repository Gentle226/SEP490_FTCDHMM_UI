/**
 * Test script to validate environment configuration
 * Run this with: npx tsx src/base/config/test-env.ts
 */
// Load environment variables from .env files
import { config } from 'dotenv';
import path from 'path';

import { envClient } from './env-client.config';
import { envServer } from './env-server.config';
import { debugAllEnvVars, validateEnvVars } from './env-utils';
import { env } from './env.config';

// Load .env files in order (later files override earlier ones)
config({ path: path.resolve(process.cwd(), '.env') });
config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('🔧 Loaded environment files:');
console.log('  .env:', require('fs').existsSync('.env') ? '✅' : '❌');
console.log('  .env.local:', require('fs').existsSync('.env.local') ? '✅' : '❌');
console.log('');

console.log('🧪 Testing Environment Configuration...\n');

try {
  // Test server config
  console.log('📄 Server Config:');
  console.log('  API_URL:', env.API_URL);
  console.log('  NODE_ENV:', env.NODE_ENV);
  console.log('');

  // Test client config
  console.log('📄 Client Config:');
  console.log('  NEXT_PUBLIC_API_URL:', envClient.NEXT_PUBLIC_API_URL);
  console.log(
    '  NEXT_PUBLIC_GOOGLE_CLIENT_ID:',
    envClient.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'NOT SET',
  );
  console.log('');

  // Test server-only config
  console.log('📄 Server-only Config:');
  console.log('  API_URL:', envServer.API_URL);
  console.log('  NODE_ENV:', envServer.NODE_ENV);
  console.log('');

  // Manual check of environment variables
  console.log('🔍 Manual Environment Check:');
  console.log('  process.env.API_URL:', process.env.API_URL);
  console.log('  process.env.NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('  process.env.NODE_ENV:', process.env.NODE_ENV);
  console.log(
    '  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID:',
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  );
  console.log('');

  // Validate specific env vars
  validateEnvVars(
    [
      { name: 'API_URL', required: true, type: 'url', description: 'Backend API URL' },
      {
        name: 'NEXT_PUBLIC_API_URL',
        required: true,
        type: 'url',
        description: 'Public API URL for client',
      },
      { name: 'NODE_ENV', required: false, type: 'string', description: 'Environment mode' },
      {
        name: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
        required: false,
        type: 'string',
        description: 'Google OAuth Client ID',
      },
    ],
    'server',
  );

  // Debug all env vars (only in development)
  debugAllEnvVars();

  console.log('\n✅ All environment configurations are working correctly!');
} catch (error) {
  console.error('\n❌ Environment configuration test failed:');
  console.error(error);
  process.exit(1);
}
