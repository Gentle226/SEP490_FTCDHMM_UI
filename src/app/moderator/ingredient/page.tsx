'use client';

import { Salad } from 'lucide-react';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { PermissionPolicies, ProtectedRoute } from '@/modules/auth';
import { IngredientManagementTable } from '@/modules/ingredients';

export default function IngredientManagementPage() {
  return (
    <ProtectedRoute requiredPermissions={[PermissionPolicies.INGREDIENT_MANAGER_VIEW]}>
      <DashboardLayout>
        <div className="space-y-6 px-3">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-[#99b94a]/10">
              <Salad className="h-7 w-7 text-[#99b94a]" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-[#99b94a]">
                Quản Lý Nguyên Liệu
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Quản lý và chỉnh sửa các nguyên liệu trong hệ thống
              </p>
            </div>
          </div>

          {/* Ingredient Management */}
          <div className="bg-card rounded-lg border p-6">
            <IngredientManagementTable title={<span></span>} />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
