'use client';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { ProtectedRoute, Role } from '@/modules/auth';
import { IngredientManagementTable } from '@/modules/ingredients';

export default function IngredientManagementPage() {
  return (
    <ProtectedRoute requiredRoles={[Role.ADMIN, Role.MODERATOR]}>
      <DashboardLayout>
        <div className="space-y-8 pt-8 pr-8 pl-8">
          <div>
            <h1 className="text-4xl font-bold text-[#99b94a]">Quản lý Nguyên Liệu</h1>
          </div>

          {/* Ingredient Management */}
          <div className="bg-card rounded-lg border p-6">
            <IngredientManagementTable />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
