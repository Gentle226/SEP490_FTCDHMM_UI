'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

import { Role, hasAnyPermission } from '@/modules/auth/types';

import { useAuth } from '../contexts/auth.context';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: Role[];
  requiredPermissions?: string[];
  requireAllPermissions?: boolean; // If true, user must have ALL permissions; if false, ANY permission
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  requireAllPermissions = false,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // Check role requirements
      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role as Role)) {
        router.push('/');
        return;
      }

      // Check permission requirements
      if (requiredPermissions.length > 0) {
        const hasPermission = requireAllPermissions
          ? requiredPermissions.every((permission) => user.permissions?.includes(permission))
          : hasAnyPermission(user, requiredPermissions);

        if (!hasPermission) {
          router.push('/');
          return;
        }
      }
    }
  }, [
    user,
    isLoading,
    requiredRoles,
    requiredPermissions,
    requireAllPermissions,
    redirectTo,
    router,
  ]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check role requirements
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return null;
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const hasPermission = requireAllPermissions
      ? requiredPermissions.every((permission) => user.permissions?.includes(permission))
      : hasAnyPermission(user, requiredPermissions);

    if (!hasPermission) {
      return null;
    }
  }

  return <>{children}</>;
}
