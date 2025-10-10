'use client';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { ProtectedRoute, Role } from '@/modules/auth';
import { UserManagementTable } from '@/modules/users/components/user-management-table';

export default function ModeratorDashboard() {
  return (
    <ProtectedRoute requiredRoles={[Role.ADMIN, Role.MODERATOR]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Quản lý nguyên liệu</h1>
            <p className="text-muted-foreground">
              Quản 
            </p>
          </div>

          {/* Customer Management */}
          <div className="bg-card rounded-lg border p-6">
            <UserManagementTable
              userType="customers"
              title="Quản Lý Khách Hàng"
              canCreate={false}
            />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
