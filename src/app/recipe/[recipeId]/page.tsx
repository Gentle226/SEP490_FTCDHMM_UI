'use client';

import { useParams } from 'next/navigation';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { RecipeDetailView } from '@/modules/recipes/components';

export default function RecipeDetailPage() {
  const params = useParams();
  const recipeId = params.recipeId as string;

  return (
    <DashboardLayout>
      <RecipeDetailView recipeId={recipeId} />
    </DashboardLayout>
  );
}
