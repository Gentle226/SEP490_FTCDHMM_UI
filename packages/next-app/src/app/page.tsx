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
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Welcome to Your App</h1>
          <p className="mb-8 text-xl text-gray-600">
            A secure application with role-based access control
          </p>
        </div>

        {user ? (
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-2xl font-semibold">
                Hello, {user.fullName || `${user.firstName} ${user.lastName}` || user.email}!
              </h2>
              <p className="mb-4 text-gray-600">
                Your role: <span className="font-semibold text-blue-600">{user.role}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Available to all authenticated users */}
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-2 text-lg font-semibold">Profile</h3>
                <p className="mb-4 text-gray-600">Manage your personal information</p>
                <Link href="/profile">
                  <Button>View Profile</Button>
                </Link>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-2 text-lg font-semibold">Dashboard</h3>
                <p className="mb-4 text-gray-600">Your personal dashboard</p>
                <Link href="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              </div>

              {/* Moderator and Admin only */}
              <ModeratorGuard user={user}>
                <div className="rounded-lg bg-white p-6 shadow">
                  <h3 className="mb-2 text-lg font-semibold">Moderator Panel</h3>
                  <p className="mb-4 text-gray-600">Content moderation tools</p>
                  <Link href="/moderator/dashboard">
                    <Button variant="secondary">Moderator Dashboard</Button>
                  </Link>
                </div>
              </ModeratorGuard>

              {/* Admin only */}
              <AdminGuard user={user}>
                <div className="rounded-lg bg-white p-6 shadow">
                  <h3 className="mb-2 text-lg font-semibold">Admin Panel</h3>
                  <p className="mb-4 text-gray-600">System administration</p>
                  <Link href="/admin/dashboard">
                    <Button variant="danger">Admin Dashboard</Button>
                  </Link>
                </div>
              </AdminGuard>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-6 text-gray-600">Please log in to access the application</p>
            <div className="space-x-4">
              <Link href="/auth/login">
                <Button size="lg">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" size="lg">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
