'use client';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { ProtectedRoute } from '@/modules/auth';
import {
  CurrentHealthGoalCard,
  CustomHealthGoalEditor,
  HealthGoalLibrary,
} from '@/modules/health-goals';

export default function MyHealthGoalsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <CurrentHealthGoalCard />

          <div className="space-y-6">
            <CustomHealthGoalEditor />
            <HealthGoalLibrary />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
