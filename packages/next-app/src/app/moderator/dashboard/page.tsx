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
            <h1 className="mb-2 text-3xl font-bold">Moderator Dashboard</h1>
            <p className="text-gray-600">Manage customer accounts and moderate content</p>
          </div>

          <div className="space-y-8">
            {/* Customer Management */}
            <div className="rounded-lg bg-white p-6 shadow">
              <UserManagementTable
                userType="customers"
                title="Customer Management"
                canCreate={false}
              />
            </div>

            {/* Moderation Tools */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-semibold">Content Moderation</h2>
                <p className="text-gray-600">Review and moderate user-generated content.</p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-xl font-semibold">User Reports</h2>
                <p className="text-gray-600">Handle user reports and complaints.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
