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
            <h1 className="mb-2 text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">Manage moderator accounts and system administration</p>
          </div>

          <div className="space-y-8">
            {/* Moderator Management */}
            <div className="rounded-lg bg-white p-6 shadow">
              <UserManagementTable
                userType="moderators"
                title="Moderator Management"
                canCreate={true}
              />
            </div>

            {/* System Overview Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-semibold">System Settings</h2>
                <p className="text-gray-600">Configure system-wide settings and preferences.</p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-semibold">Analytics</h2>
                <p className="text-gray-600">View system analytics and reports.</p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-semibold">Audit Logs</h2>
                <p className="text-gray-600">Review system activity and user actions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
