'use client';

import { ReactNode } from 'react';

import { Role, User } from '@/modules/auth/types';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: Role[];
  user?: Pick<User, 'role'> | null;
  fallback?: ReactNode;
}

export function RoleGuard({ children, allowedRoles, user, fallback = null }: RoleGuardProps) {
  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AdminGuardProps {
  children: ReactNode;
  user?: Pick<User, 'role'> | null;
  fallback?: ReactNode;
}

export function AdminGuard({ children, user, fallback = null }: AdminGuardProps) {
  return (
    <RoleGuard allowedRoles={[Role.ADMIN]} user={user} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

interface CustomerGuardProps {
  children: ReactNode;
  user?: Pick<User, 'role'> | null;
  fallback?: ReactNode;
}

export function CustomerGuard({ children, user, fallback = null }: CustomerGuardProps) {
  return (
    <RoleGuard allowedRoles={[Role.CUSTOMER]} user={user} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}
