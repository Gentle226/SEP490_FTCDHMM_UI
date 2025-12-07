'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import {
  PermissionPolicies,
  ProtectedRoute,
  Role,
  hasAnyPermission,
  useAuth,
} from '@/modules/auth';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Route users based on their role and permissions
      if (user.role === Role.ADMIN) {
        router.replace('/admin/dashboard');
      } else if (
        hasAnyPermission(user, [
          PermissionPolicies.USER_MANAGEMENT_VIEW,
          PermissionPolicies.RECIPE_MANAGEMENT_VIEW,
          PermissionPolicies.INGREDIENT_MANAGER_VIEW,
          PermissionPolicies.LABEL_CREATE,
          PermissionPolicies.INGREDIENT_CATEGORY_CREATE,
          PermissionPolicies.REPORT_VIEW,
        ])
      ) {
        // Users with management permissions go to moderator dashboard
        router.replace('/moderator/dashboard');
      } else {
        // Regular customers go to customer dashboard
        router.replace('/customer/dashboard');
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
