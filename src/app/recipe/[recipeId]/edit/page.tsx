'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { Skeleton } from '@/base/components/ui/skeleton';
import { RecipeForm } from '@/modules/recipes/components/recipe-form';
import { recipeService } from '@/modules/recipes/services/recipe.service';
import { RecipeDetail } from '@/modules/recipes/types';

export default function EditRecipePage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.recipeId as string;

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecipe() {
      if (!recipeId) {
        setError('ID công thức không hợp lệ');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await recipeService.getRecipeById(recipeId);
        setRecipe(data);
      } catch (err) {
        console.error('Failed to fetch recipe:', err);
        setError('Không thể tải thông tin công thức. Vui lòng thử lại sau.');
        toast.error('Không thể tải thông tin công thức');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecipe();
  }, [recipeId]);

  if (isLoading) {
    return (
      <DashboardLayout showHeader={false}>
        <div className="mx-auto max-w-5xl space-y-6 p-6">
          <Skeleton className="h-12 w-64" />
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !recipe) {
    return (
      <DashboardLayout showHeader={false}>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-red-500">{error || 'Không tìm thấy công thức'}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 text-sm text-blue-500 hover:underline"
            >
              Quay lại
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout showHeader={false}>
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-[#99b94a]">Chỉnh sửa công thức</h1>
          <p className="mt-2 text-gray-600">Cập nhật thông tin công thức của bạn</p>
        </div>

        <RecipeForm recipeId={recipeId} initialData={recipe} mode="edit" />
      </div>
    </DashboardLayout>
  );
}
