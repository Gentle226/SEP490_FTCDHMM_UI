'use client';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { ProtectedRoute } from '@/modules/auth';
import { CustomHealthGoalList } from '@/modules/health-goals';

export default function MyHealthGoalsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <CustomHealthGoalList />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
