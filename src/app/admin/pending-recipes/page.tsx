'use client';

import { ChefHat } from 'lucide-react';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { ProtectedRoute, Role } from '@/modules/auth';
import { RecipeManagementTable } from '@/modules/recipes/components';

export default function AdminRecipeManagementPage() {
  return (
    <ProtectedRoute requiredRoles={[Role.ADMIN]}>
      <DashboardLayout>
        <div className="space-y-6 px-3">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-[#99b94a]/10">
              <ChefHat className="h-7 w-7 text-[#99b94a]" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-[#99b94a]">
                Quản Lý Công Thức Chờ Duyệt
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Duyệt, từ chối, khóa hoặc xóa các công thức đang chờ phê duyệt
              </p>
            </div>
          </div>

          {/* Recipe Management Table */}
          <div className="bg-card rounded-lg border p-6">
            <RecipeManagementTable />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
