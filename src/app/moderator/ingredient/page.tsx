'use client';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { ProtectedRoute, Role } from '@/modules/auth';
import { IngredientManagementTable } from '@/modules/ingredients';

export default function IngredientManagementPage() {
  return (
    <ProtectedRoute requiredRoles={[Role.ADMIN, Role.MODERATOR]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Ingredient Management */}
          <div className="bg-card rounded-lg border p-6">
            <IngredientManagementTable
              title={
                <span className="text-3xl font-semibold text-[#99b94a]">Quản Lý Nguyên Liệu</span>
              }
            />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
