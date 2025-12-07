'use client';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { PermissionPolicies, ProtectedRoute } from '@/modules/auth';
import { ReportManagementList } from '@/modules/report';

export default function ModeratorReportsPage() {
  return (
    <ProtectedRoute requiredPermissions={[PermissionPolicies.REPORT_VIEW]}>
      <DashboardLayout>
        <div className="space-y-6">
          <ReportManagementList />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
