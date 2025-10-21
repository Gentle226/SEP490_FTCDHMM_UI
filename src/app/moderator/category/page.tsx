'use client';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { ProtectedRoute, Role } from '@/modules/auth';
import { IngredientCategoryManagementTable } from '@/modules/ingredient-categories/components';

export default function IngredientCategoryPage() {
  return (
    <ProtectedRoute requiredRoles={[Role.ADMIN, Role.MODERATOR]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <IngredientCategoryManagementTable />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
