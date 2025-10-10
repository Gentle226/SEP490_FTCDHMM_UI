'use client';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { ProtectedRoute, Role } from '@/modules/auth';
import { UserManagementTable } from '@/modules/users/components/user-management-table';

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRoles={[Role.ADMIN]}>
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-[#99b94a]">Bảng Điều Khiển Admin</h1>

          {/* Moderator Management */}
            <div className="bg-card rounded-lg border p-6">
            <UserManagementTable
              userType="moderators"
              title={<span className="text-[#99b94a]">Quản Lý Moderator</span>}
              canCreate={true}
            />
            </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
