'use client';

import { ClipboardList } from 'lucide-react';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { PermissionPolicies, ProtectedRoute } from '@/modules/auth';
import { IngredientCategoryManagementTable } from '@/modules/ingredient-categories/components';

export default function IngredientCategoryPage() {
  return (
    <ProtectedRoute requiredPermissions={[PermissionPolicies.INGREDIENT_CATEGORY_CREATE]}>
      <DashboardLayout>
        <div className="space-y-6 px-3">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-[#99b94a]/10">
              <ClipboardList className="h-7 w-7 text-[#99b94a]" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-[#99b94a]">
                Quản Lý Nhóm Nguyên Liệu
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Quản lý và phân loại các nhóm nguyên liệu
              </p>
            </div>
          </div>

          {/* Category Management */}
          <IngredientCategoryManagementTable />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
