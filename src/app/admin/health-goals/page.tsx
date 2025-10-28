'use client';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { ProtectedRoute, Role } from '@/modules/auth';
import { HealthGoalList } from '@/modules/health-goals';

export default function HealthGoalsPage() {
  return (
    <ProtectedRoute requiredRoles={[Role.ADMIN]}>
      <DashboardLayout>
        <div className="space-y-6">
          <HealthGoalList />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
