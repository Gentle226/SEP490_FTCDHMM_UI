import Link from 'next/link';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { Button } from '@/base/components/ui/button';
import { ProtectedRoute, Role } from '@/modules/auth';

export default function CustomerDashboard() {
  return (
    <ProtectedRoute requiredRoles={[Role.CUSTOMER]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Bảng Điều Khiển Khách Hàng</h1>
            <p className="text-muted-foreground">Quản lý tài khoản và xem hoạt động của bạn</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="mb-4 text-xl font-semibold">Hồ Sơ Của Tôi</h2>
              <p className="text-muted-foreground mb-4">Quản lý thông tin cá nhân của bạn.</p>
              <Link href="/profile">
                <Button variant="outline">Xem Hồ Sơ</Button>
              </Link>
            </div>
            <div className="bg-card rounded-lg border p-6">
              <h2 className="mb-4 text-xl font-semibold">Công Thức Nấu Ăn</h2>
              <p className="text-muted-foreground mb-4">
                Xem và theo dõi công thức nấu ăn của bạn.
              </p>
              <Link href="/myrecipe">
                <Button variant="outline">Xem Công Thức</Button>
              </Link>
            </div>
            <div className="bg-card rounded-lg border p-6">
              <h2 className="mb-4 text-xl font-semibold">Sức Khỏe</h2>
              <p className="text-muted-foreground mb-4">
                Quản lý chỉ số sức khỏe và hoạt động thể lực.
              </p>
              <Link href="/profile/health-metrics">
                <Button variant="outline">Xem Chỉ Số</Button>
              </Link>
            </div>
            <div className="bg-card rounded-lg border p-6">
              <h2 className="mb-4 text-xl font-semibold">Mục Tiêu Sức Khỏe</h2>
              <p className="text-muted-foreground mb-4">
                Thiết lập và theo dõi mục tiêu sức khỏe của bạn.
              </p>
              <Link href="/profile/health-goals">
                <Button variant="outline">Quản Lý Mục Tiêu</Button>
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
