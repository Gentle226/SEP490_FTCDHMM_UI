'use client';

import { KeyRound } from 'lucide-react';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { PermissionPolicies, ProtectedRoute } from '@/modules/auth';
import { PermissionManagementTable } from '@/modules/roles/components/permission-management-table';

export default function PermissionsPage() {
  return (
    <ProtectedRoute requiredPermissions={[PermissionPolicies.ROLE_VIEW]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4 px-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-[#99b94a]/10">
              <KeyRound className="h-7 w-7 text-[#99b94a]" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-[#99b94a]">
                Quản Lý Phân Quyền
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Quản lý vai trò và cấu hình quyền hạn trong hệ thống
              </p>
            </div>
          </div>

          {/* Permission Management */}
          <PermissionManagementTable />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
