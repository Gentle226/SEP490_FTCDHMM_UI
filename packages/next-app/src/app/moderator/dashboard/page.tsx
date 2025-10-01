import { ProtectedRoute, Role } from '@/modules/auth';

export default function ModeratorDashboard() {
  return (
    <ProtectedRoute requiredRoles={[Role.ADMIN, Role.MODERATOR]}>
      <div className="container mx-auto p-6">
        <h1 className="mb-6 text-3xl font-bold">Moderator Dashboard</h1>
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
    </ProtectedRoute>
  );
}
