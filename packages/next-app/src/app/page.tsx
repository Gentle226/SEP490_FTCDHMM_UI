'use client';

import Link from 'next/link';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { Header } from '@/base/components/layout/header';
import { Button } from '@/base/components/ui/button';
import { AdminGuard, ModeratorGuard, useAuth } from '@/modules/auth';

export default function HomePage() {
  const { user } = useAuth();

  // If user is logged in, show dashboard layout
  if (user) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Chào Mừng Đến Với FitFood Tracker</h1>
            <p className="text-muted-foreground mt-2 text-xl">
              Một ứng dụng quản lý chế độ ăn và chỉ số sức khỏe toàn diện
            </p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <h2 className="mb-4 text-2xl font-semibold">
              Xin chào,{' '}
              {user.fullName ||
                (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                user.email}
              !
            </h2>
            <p className="text-muted-foreground">
              Vai trò của bạn: <span className="text-primary font-semibold">{user.role}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Available to all authenticated users */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="mb-2 text-lg font-semibold">Hồ Sơ</h3>
              <p className="text-muted-foreground mb-4">Quản lý thông tin cá nhân của bạn</p>
              <Link href="/profile">
                <Button>Xem Hồ Sơ</Button>
              </Link>
            </div>

            <div className="bg-card rounded-lg border p-6">
              <h3 className="mb-2 text-lg font-semibold">Bảng Điều Khiển</h3>
              <p className="text-muted-foreground mb-4">Bảng điều khiển cá nhân của bạn</p>
              <Link href="/dashboard">
                <Button>Đi Đến Bảng Điều Khiển</Button>
              </Link>
            </div>

            {/* Moderator and Admin only */}
            <ModeratorGuard user={user}>
              <div className="bg-card rounded-lg border p-6">
                <h3 className="mb-2 text-lg font-semibold">Bảng Moderator</h3>
                <p className="text-muted-foreground mb-4">Công cụ kiểm duyệt nội dung</p>
                <Link href="/moderator/dashboard">
                  <Button variant="secondary">Bảng Điều Khiển Moderator</Button>
                </Link>
              </div>
            </ModeratorGuard>

            {/* Admin only */}
            <AdminGuard user={user}>
              <div className="bg-card rounded-lg border p-6">
                <h3 className="mb-2 text-lg font-semibold">Bảng Admin</h3>
                <p className="text-muted-foreground mb-4">Quản trị hệ thống</p>
                <Link href="/admin/dashboard">
                  <Button variant="danger">Bảng Điều Khiển Admin</Button>
                </Link>
              </div>
            </AdminGuard>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If user is not logged in, show landing page
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Chào Mừng Đến Với FitFood Tracker
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Một ứng dụng quản lý chế độ ăn và chỉ số sức khỏe toàn diện
          </p>
        </div>

        <div className="text-center">
          <p className="mb-6 text-gray-600">Vui lòng đăng nhập để truy cập ứng dụng</p>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button size="lg">Đăng Nhập</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="lg">
                Đăng Ký
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
