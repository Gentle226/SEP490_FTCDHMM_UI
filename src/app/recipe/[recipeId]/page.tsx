'use client';

import { useParams } from 'next/navigation';

import { RecipeDetailView } from '@/modules/recipes/components';

export default function RecipeDetailPage() {
  const params = useParams();
  const recipeId = params.recipeId as string;

  return <RecipeDetailView recipeId={recipeId} />;
}
