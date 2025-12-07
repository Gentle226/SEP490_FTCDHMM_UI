'use client';

import { ReactNode } from 'react';

import { User, hasAnyPermission, hasPermission } from '@/modules/auth/types';

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermission: string;
  user?: User | null;
  fallback?: ReactNode;
}

export function PermissionGuard({
  children,
  requiredPermission,
  user,
  fallback = null,
}: PermissionGuardProps) {
  if (!hasPermission(user ?? null, requiredPermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AnyPermissionGuardProps {
  children: ReactNode;
  requiredPermissions: string[];
  user?: User | null;
  fallback?: ReactNode;
}

export function AnyPermissionGuard({
  children,
  requiredPermissions,
  user,
  fallback = null,
}: AnyPermissionGuardProps) {
  if (!hasAnyPermission(user ?? null, requiredPermissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
