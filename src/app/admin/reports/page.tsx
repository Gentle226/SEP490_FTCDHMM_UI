'use client';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { ProtectedRoute, Role } from '@/modules/auth';
import { ReportManagementList } from '@/modules/report';

export default function ReportsPage() {
  return (
    <ProtectedRoute requiredRoles={[Role.ADMIN]}>
      <DashboardLayout>
        <div className="space-y-6">
          <ReportManagementList />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
