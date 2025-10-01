'use client';

import Link from 'next/link';

import { Header } from '@/base/components/layout/header';
import { Button } from '@/base/components/ui/button';
import { AdminGuard, ModeratorGuard, useAuth } from '@/modules/auth';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Chào Mừng Đến Với Ứng Dụng</h1>
          <p className="mb-8 text-xl text-gray-600">
            Một ứng dụng bảo mật với kiểm soát truy cập dựa trên vai trò
          </p>
        </div>

        {user ? (
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-2xl font-semibold">
                Hello,{' '}
                {user.fullName ||
                  (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                  user.email}
                !
              </h2>
              <p className="mb-4 text-gray-600">
                Vai trò của bạn: <span className="font-semibold text-blue-600">{user.role}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Available to all authenticated users */}
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-2 text-lg font-semibold">Hồ Sơ</h3>
                <p className="mb-4 text-gray-600">Quản lý thông tin cá nhân của bạn</p>
                <Link href="/profile">
                  <Button>Xem Hồ Sơ</Button>
                </Link>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-2 text-lg font-semibold">Bảng Điều Khiển</h3>
                <p className="mb-4 text-gray-600">Bảng điều khiển cá nhân của bạn</p>
                <Link href="/dashboard">
                  <Button>Đi Đến Bảng Điều Khiển</Button>
                </Link>
              </div>

              {/* Moderator and Admin only */}
              <ModeratorGuard user={user}>
                <div className="rounded-lg bg-white p-6 shadow">
                  <h3 className="mb-2 text-lg font-semibold">Bảng Moderator</h3>
                  <p className="mb-4 text-gray-600">Công cụ kiểm duyệt nội dung</p>
                  <Link href="/moderator/dashboard">
                    <Button variant="secondary">Bảng Điều Khiển Moderator</Button>
                  </Link>
                </div>
              </ModeratorGuard>

              {/* Admin only */}
              <AdminGuard user={user}>
                <div className="rounded-lg bg-white p-6 shadow">
                  <h3 className="mb-2 text-lg font-semibold">Bảng Admin</h3>
                  <p className="mb-4 text-gray-600">Quản trị hệ thống</p>
                  <Link href="/admin/dashboard">
                    <Button variant="danger">Bảng Điều Khiển Admin</Button>
                  </Link>
                </div>
              </AdminGuard>
            </div>
          </div>
        ) : (
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
        )}
      </main>
    </div>
  );
}
