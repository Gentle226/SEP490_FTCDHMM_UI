import { ProtectedRoute, Role } from '@/modules/auth';

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRoles={[Role.ADMIN]}>
      <div className="container mx-auto p-6">
        <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">User Management</h2>
            <p className="text-gray-600">Manage system users and their permissions.</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">System Settings</h2>
            <p className="text-gray-600">Configure system-wide settings and preferences.</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Analytics</h2>
            <p className="text-gray-600">View system analytics and reports.</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
