'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { ProtectedRoute, Role, useAuth } from '@/modules/auth';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Route users based on their role
      switch (user.role) {
        case Role.ADMIN:
          router.replace('/admin/dashboard');
          break;
        case Role.MODERATOR:
          router.replace('/moderator/dashboard');
          break;
        case Role.CUSTOMER:
          router.replace('/customer/dashboard');
          break;
        default:
          router.replace('/');
      }
    }
  }, [user, router]);

  return (
    <ProtectedRoute>
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Đang chuyển hướng sang bảng điều khiển...</div>
      </div>
    </ProtectedRoute>
  );
}
