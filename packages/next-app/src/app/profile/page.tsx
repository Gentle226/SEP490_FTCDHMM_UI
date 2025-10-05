'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/modules/auth';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Redirect to user's own profile
        router.replace(`/profile/${user.id}`);
      } else {
        // Redirect to login if not authenticated
        router.replace('/auth/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-lg">Đang tải hồ sơ...</div>
    </div>
  );
}
