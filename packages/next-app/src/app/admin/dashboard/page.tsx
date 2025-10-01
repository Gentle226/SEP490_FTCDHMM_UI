'use client';

import { Header } from '@/base/components/layout/header';
import { ProtectedRoute, Role } from '@/modules/auth';
import { UserManagementTable } from '@/modules/users/components/user-management-table';

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRoles={[Role.ADMIN]}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Bảng Điều Khiển Admin</h1>
            <p className="text-gray-600">Quản lý tài khoản moderator và quản trị hệ thống</p>
          </div>

          <div className="space-y-8">
            {/* Moderator Management */}
            <div className="rounded-lg bg-white p-6 shadow">
              <UserManagementTable
                userType="moderators"
                title="Quản Lý Moderator"
                canCreate={true}
              />
            </div>

            {/* System Overview Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-semibold">Cài Đặt Hệ Thống</h2>
                <p className="text-gray-600">Cấu hình cài đặt và tùy chọn toàn hệ thống.</p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-semibold">Phân Tích</h2>
                <p className="text-gray-600">Xem phân tích và báo cáo hệ thống.</p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-semibold">Nhật Ký Kiểm Tra</h2>
                <p className="text-gray-600">Xem xét hoạt động hệ thống và hành động người dùng.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
