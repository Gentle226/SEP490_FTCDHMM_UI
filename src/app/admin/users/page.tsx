'use client';

import { Users } from 'lucide-react';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { ProtectedRoute, Role } from '@/modules/auth';
import { UserManagementTable } from '@/modules/users/components/user-management-table';

export default function UsersManagementPage() {
  return (
    <ProtectedRoute requiredRoles={[Role.ADMIN]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4 px-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-[#99b94a]/10">
              <Users className="h-7 w-7 text-[#99b94a]" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-[#99b94a]">
                Quản Lý Người Dùng
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Quản lý và giám sát tất cả người dùng hệ thống
              </p>
            </div>
          </div>

          {/* Users Management Table */}
          <div className="bg-card rounded-lg border p-6">
            <UserManagementTable title={<span>Danh sách Người Dùng</span>} canCreate={true} />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
