'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

import { Role } from '@/modules/auth/types';

import { useAuth } from '../contexts/auth.context';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: Role[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
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

      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role as Role)) {
        router.push('/');
        return;
      }

    }
  }, [user, isLoading, requiredRoles, redirectTo, router]);

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

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
