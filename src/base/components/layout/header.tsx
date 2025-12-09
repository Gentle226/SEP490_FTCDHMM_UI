'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/base/components/ui/button';
import { useAuth } from '@/modules/auth';
import { authService } from '@/modules/auth/services/auth.service';

import { UserActions } from './user-actions';

export function Header() {
  const { user, setUser, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear user state and redirect
      setUser(null);
      router.push('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/fitfood-tracker-logo.png"
              alt="FitFood Tracker"
              className="h-12 w-auto"
            />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {!isLoading && user?.id ? (
            <>
              <Link href="/recipe/new">
                <Button size="sm" className="bg-[#99b94a] whitespace-nowrap hover:bg-[#7a8f3a]">
                  + Viết món mới
                </Button>
              </Link>
              <UserActions user={user} onLogout={handleLogout} />
            </>
          ) : !isLoading ? (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="whitespace-nowrap">
                  Đăng Nhập
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="bg-[#99b94a] whitespace-nowrap hover:bg-[#7a8f3a]">
                  Đăng Ký
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
