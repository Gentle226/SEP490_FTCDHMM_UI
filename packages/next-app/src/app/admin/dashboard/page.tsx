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

          {/* System Overview Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="mb-4 text-xl font-semibold">Cài Đặt Hệ Thống</h2>
              <p className="text-muted-foreground">Cấu hình cài đặt và tùy chọn toàn hệ thống.</p>
            </div>
            <div className="bg-card rounded-lg border p-6">
              <h2 className="mb-4 text-xl font-semibold">Phân Tích</h2>
              <p className="text-muted-foreground">Xem phân tích và báo cáo hệ thống.</p>
            </div>
            <div className="bg-card rounded-lg border p-6">
              <h2 className="mb-4 text-xl font-semibold">Nhật Ký Kiểm Tra</h2>
              <p className="text-muted-foreground">
                Xem xét hoạt động hệ thống và hành động người dùng.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
