'use client';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { ProtectedRoute, Role } from '@/modules/auth';
import { PermissionManagementTable } from '@/modules/roles/components/permission-management-table';

export default function PermissionsPage() {
  return (
    <ProtectedRoute requiredRoles={[Role.ADMIN]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Quản Lý Phân Quyền</h1>
            <p className="text-muted-foreground">
              Quản lý vai trò và quyền truy cập trong hệ thống
            </p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <PermissionManagementTable />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
