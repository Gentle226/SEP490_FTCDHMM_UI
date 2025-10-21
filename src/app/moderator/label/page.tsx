'use client';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { ProtectedRoute, Role } from '@/modules/auth';
import { LabelManagementTable } from '@/modules/labels/components';

export default function LabelManagementPage() {
  return (
    <ProtectedRoute requiredRoles={[Role.ADMIN, Role.MODERATOR]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <LabelManagementTable />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
