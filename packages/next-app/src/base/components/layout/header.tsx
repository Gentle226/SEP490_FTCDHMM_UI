'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/base/components/ui/button';
import { useAuth } from '@/modules/auth';
import { authService } from '@/modules/auth/services/auth.service';

import { UserActions } from './user-actions';

export function Header() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear user state and redirect
      setUser(null);
      router.push('/auth/login');
    }
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center">
            <img src="/Fitfood Tracker Logo.png" alt="FitFood Tracker" className="h-16 w-auto" />
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <UserActions user={user} onLogout={handleLogout} />
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Đăng Nhập
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  Đăng Ký
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
