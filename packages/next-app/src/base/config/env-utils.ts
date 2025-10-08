/**
 * Utility functions for environment variable handling and debugging
 */

export type EnvVarConfig = {
  name: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'url';
  description?: string;
};

/**
 * Validates and logs environment variables
 */
export function validateEnvVars(configs: EnvVarConfig[], context: 'client' | 'server' = 'server') {
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log(`[ENV VALIDATION] Checking ${context} environment variables...`);

  configs.forEach((config) => {
    const value = process.env[config.name];
    const hasValue = value !== undefined && value !== '';

    console.log(
      `  ${config.name}: ${hasValue ? 'SET' : 'NOT SET'}${hasValue ? ` (${value})` : ''}`,
    );

    if (config.required && !hasValue) {
      errors.push(`Required environment variable ${config.name} is not set`);
    }

    if (hasValue && config.type === 'url') {
      try {
        new URL(value!);
      } catch {
        errors.push(`Environment variable ${config.name} is not a valid URL: ${value}`);
      }
    }

    if (hasValue && config.type === 'number') {
      if (isNaN(Number(value))) {
        errors.push(`Environment variable ${config.name} is not a valid number: ${value}`);
      }
    }

    if (hasValue && config.type === 'boolean') {
      if (!['true', 'false', '1', '0'].includes(value!.toLowerCase())) {
        warnings.push(
          `Environment variable ${config.name} should be a boolean value (true/false or 1/0): ${value}`,
        );
      }
    }
  });

  if (warnings.length > 0) {
    console.warn('[ENV WARNINGS]:');
    warnings.forEach((warning) => console.warn(`  ${warning}`));
  }

  if (errors.length > 0) {
    console.error('[ENV ERRORS]:');
    errors.forEach((error) => console.error(`  ${error}`));
    throw new Error(`Environment validation failed with ${errors.length} error(s)`);
  }

  console.log(`[ENV VALIDATION] All ${context} environment variables are valid`);
}

/**
 * Debug all available environment variables (development only)
 */
export function debugAllEnvVars() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.log('🐛 [ENV DEBUG] All environment variables:');
  Object.keys(process.env)
    .sort()
    .forEach((key) => {
      const value = process.env[key];
      // Hide sensitive values
      const shouldHide =
        key.toLowerCase().includes('secret') ||
        key.toLowerCase().includes('key') ||
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('password');

      console.log(`  ${key}: ${shouldHide ? '***HIDDEN***' : value}`);
    });
}

/**
 * Check if we're running on client side
 */
export function isClientSide() {
  return typeof window !== 'undefined';
}

/**
 * Check if we're running on server side
 */
export function isServerSide() {
  return typeof window === 'undefined';
}

/**
 * Get environment variable with fallback and validation
 */
export function getEnvVar(
  name: string,
  fallback?: string,
  options: { required?: boolean; type?: 'string' | 'number' | 'boolean' | 'url' } = {},
): string {
  const value = process.env[name] || fallback;

  if (options.required && (!value || value === '')) {
    throw new Error(`Required environment variable ${name} is not set`);
  }

  if (value && options.type === 'url') {
    try {
      new URL(value);
    } catch {
      throw new Error(`Environment variable ${name} is not a valid URL: ${value}`);
    }
  }

  return value || '';
}
