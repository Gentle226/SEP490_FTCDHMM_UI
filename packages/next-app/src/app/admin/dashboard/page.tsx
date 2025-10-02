'use client';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { ProtectedRoute, Role } from '@/modules/auth';
import { UserManagementTable } from '@/modules/users/components/user-management-table';

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRoles={[Role.ADMIN]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Bảng Điều Khiển Admin</h1>
            <p className="text-muted-foreground">
              Quản lý tài khoản moderator và quản trị hệ thống
            </p>
          </div>

          {/* Moderator Management */}
          <div className="bg-card rounded-lg border p-6">
            <UserManagementTable userType="moderators" title="Quản Lý Moderator" canCreate={true} />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
