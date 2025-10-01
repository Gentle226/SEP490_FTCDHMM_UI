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
            <h1 className="text-3xl font-bold">Bảng Điều Khiển Moderator</h1>
            <p className="text-muted-foreground">
              Quản lý tài khoản khách hàng và kiểm duyệt nội dung
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

          {/* Moderation Tools */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="mb-4 text-xl font-semibold">Kiểm Duyệt Nội Dung</h2>
              <p className="text-muted-foreground">
                Xem xét và kiểm duyệt nội dung do người dùng tạo.
              </p>
            </div>
            <div className="bg-card rounded-lg border p-6">
              <h2 className="mb-4 text-xl font-semibold">Báo Cáo Người Dùng</h2>
              <p className="text-muted-foreground">Xử lý báo cáo và khiếu nại của người dùng.</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
