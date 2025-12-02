'use client';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { RecipeForm } from '@/modules/recipes/components';

function NewRecipePageContent() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <RecipeForm />
    </div>
  );
}

export default function NewRecipePage() {
  return (
    <DashboardLayout showHeader={true} hideCreateButton={true}>
      <NewRecipePageContent />
    </DashboardLayout>
  );
}
