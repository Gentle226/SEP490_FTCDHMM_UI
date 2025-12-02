'use client';

import { Goal } from 'lucide-react';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { ProtectedRoute, Role } from '@/modules/auth';
import { HealthGoalList } from '@/modules/health-goals';

export default function HealthGoalsPage() {
  return (
    <ProtectedRoute requiredRoles={[Role.ADMIN]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4 px-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-[#99b94a]/10">
              <Goal className="h-7 w-7 text-[#99b94a]" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-[#99b94a]">
                Quản Lý Mục Tiêu Sức Khỏe
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Quản lý và cấu hình mục tiêu sức khỏe của hệ thống
              </p>
            </div>
          </div>

          {/* Health Goal List */}
          <HealthGoalList showHeader={false} />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
