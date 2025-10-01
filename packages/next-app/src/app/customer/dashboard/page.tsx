import { Header } from '@/base/components/layout/header';
import { ProtectedRoute, Role } from '@/modules/auth';

export default function CustomerDashboard() {
  return (
    <ProtectedRoute requiredRoles={[Role.CUSTOMER]}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Bảng điều khiển khách hàng</h1>
            <p className="text-gray-600">Quản lý tài khoản và xem hoạt động của mình.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">Hồ sơ của tôi</h2>
              <p className="text-gray-600">Quản lý thông tin cá nhân của mình.</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">Công thức nấu ăn</h2>
              <p className="text-gray-600">Xem và theo dõi công thức nấu ăn của mình.</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
