'use client';

import { Header } from '@/base/components/layout/header';
import { ProtectedRoute, Role } from '@/modules/auth';
import { UserManagementTable } from '@/modules/users/components/user-management-table';

export default function ModeratorDashboard() {
  return (
    <ProtectedRoute requiredRoles={[Role.ADMIN, Role.MODERATOR]}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Bảng Điều Khiển Moderator</h1>
            <p className="text-gray-600">Quản lý tài khoản khách hàng và kiểm duyệt nội dung</p>
          </div>

          <div className="space-y-8">
            {/* Customer Management */}
            <div className="rounded-lg bg-white p-6 shadow">
              <UserManagementTable
                userType="customers"
                title="Quản Lý Khách Hàng"
                canCreate={false}
              />
            </div>

            {/* Moderation Tools */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-semibold">Kiểm Duyệt Nội Dung</h2>
                <p className="text-gray-600">Xem xét và kiểm duyệt nội dung do người dùng tạo.</p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-semibold">Báo Cáo Người Dùng</h2>
                <p className="text-gray-600">Xử lý báo cáo và khiếu nại của người dùng.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
