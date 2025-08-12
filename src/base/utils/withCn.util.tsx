/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CxOptions } from 'class-variance-authority';
import type React from 'react';

import { cn } from '@/base/lib';

import { withProps } from './withProps.util';

/**
 * Set default `className` with `cn`.
 *
 * - IntelliSense: add `withCn` to `classAttributes`
 * - ESLint: add `withCn` to `settings.tailwindcss.callees`
 */
export function withCn<T extends React.ComponentType<any>>(Component: T, ...inputs: CxOptions) {
  return withProps(Component, { className: cn(inputs) } as any);
}
