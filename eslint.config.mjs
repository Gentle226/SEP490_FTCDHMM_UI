import { FlatCompat } from '@eslint/eslintrc';
import pluginQuery from '@tanstack/eslint-plugin-query';
import storybook from 'eslint-plugin-storybook';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),

  // Allow unused variables that start with an underscore
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  // No default exports (i.e. export default function Foo() {})
  {
    ignores: [
      '*.config.*',
      'src/app/**/{default,error,forbidden,layout,loading,not-found,page,template,unauthorized}.tsx',
      '.storybook/**',
      'src/**/*.{stories,story}.{ts,tsx}',
      'src/base/i18n/**',
      'messages/**',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Use named exports instead (i.e. export const foo = ...)',
        },
      ],
    },
  },

  // No relative imports from parent directories
  // (i.e. import { Foo } from '../../foo')
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../**/*'],
              message: "Use './' or '../' or '@/' imports only",
            },
          ],
        },
      ],
    },
  },

  // No console.log()
  {
    ignores: ['.husky/install.mjs'],
    rules: {
      'no-console': [
        'error',
        {
          allow: ['warn', 'error'],
        },
      ],
    },
  },

  // Allow anonymous default exports
  {
    rules: {
      'import/no-anonymous-default-export': 'off',
    },
  },

  // Only use camelCase as naming convention
  {
    rules: {
      camelcase: [
        'error',
        {
          properties: 'never',
          ignoreDestructuring: true,
          ignoreImports: true,
          ignoreGlobals: true,
        },
      ],
    },
  },

  // Storybook
  ...storybook.configs['flat/recommended'],
  {
    ignores: ['!.storybook'],
  },

  ...pluginQuery.configs['flat/recommended'],
];

export default eslintConfig;
