'use client';

import { Tags } from 'lucide-react';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { PermissionPolicies, ProtectedRoute } from '@/modules/auth';
import { LabelManagementTable } from '@/modules/labels/components';

export default function LabelManagementPage() {
  return (
    <ProtectedRoute
      requiredPermissions={[
        PermissionPolicies.LABEL_CREATE,
        PermissionPolicies.LABEL_UPDATE,
        PermissionPolicies.LABEL_DELETE,
      ]}
    >
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4 px-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-[#99b94a]/10">
              <Tags className="h-7 w-7 text-[#99b94a]" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-[#99b94a]">
                Quản Lý Nhãn Món Ăn
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Quản lý và phân loại các nhãn dán món ăn
              </p>
            </div>
          </div>

          {/* Label Management */}
          <LabelManagementTable />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
