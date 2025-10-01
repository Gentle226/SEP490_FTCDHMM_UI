'use client';

import { useRouter } from 'next/navigation';

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
          <h1 className="text-xl font-bold">My App</h1>
        </div>

        <div className="flex items-center space-x-4">
          {user ? <UserActions user={user} onLogout={handleLogout} /> : null}
        </div>
      </div>
    </header>
  );
}
