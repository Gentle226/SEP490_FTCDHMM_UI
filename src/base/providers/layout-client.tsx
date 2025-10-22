'use client';

import { usePathname } from 'next/navigation';

import { Header } from '@/base/components/layout/header';
import { useAuth } from '@/modules/auth';

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const isLoggedIn = !!user?.id;
  const isAuthPage = pathname?.startsWith('/auth');

  return (
    <>
      {!isLoggedIn && !isAuthPage && <Header />}
      {children}
    </>
  );
}
