'use client';

import { ClockAlert } from 'lucide-react';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { ProtectedRoute } from '@/modules/auth';
import { MyPendingRecipesTable } from '@/modules/recipes/components';

export default function PendingRecipesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6 px-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-[#99b94a]/10">
                <ClockAlert className="h-7 w-7 text-[#99b94a]" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold tracking-tight text-[#99b94a]">
                  Công Thức Chờ Duyệt
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Danh sách các công thức của bạn đang chờ được kiểm duyệt
                </p>
              </div>
            </div>
          </div>

          {/* Pending Recipes Table */}
          <div className="bg-card rounded-lg border p-6">
            <MyPendingRecipesTable />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
