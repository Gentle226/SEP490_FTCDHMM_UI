import { Header } from '@/base/components/layout/header';
import { ProtectedRoute, Role } from '@/modules/auth';

export default function CustomerDashboard() {
  return (
    <ProtectedRoute requiredRoles={[Role.CUSTOMER]}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Customer Dashboard</h1>
            <p className="text-gray-600">Manage your account and view your activity</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">My Profile</h2>
              <p className="text-gray-600">Manage your personal information and preferences.</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">My Recipe</h2>
              <p className="text-gray-600">View and track your recipes.</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
