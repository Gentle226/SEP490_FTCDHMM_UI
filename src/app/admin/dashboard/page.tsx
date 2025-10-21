'use client';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { ProtectedRoute, Role } from '@/modules/auth';
import { UserManagementTable } from '@/modules/users/components/user-management-table';

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRoles={[Role.ADMIN]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Moderator Management */}
          <div className="bg-card rounded-lg border p-6">
            <UserManagementTable
              userType="moderators"
              title={<span className="text-3xl text-[#99b94a]">Quản Lý Kiểm Duyệt Viên</span>}
              canCreate={true}
            />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
