'use client';

import { Header } from '@/base/components/layout/header';
import { useAuth } from '@/modules/auth';

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isLoggedIn = !!user?.id;

  return (
    <>
      {!isLoggedIn && <Header />}
      {children}
    </>
  );
}
