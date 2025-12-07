'use client';

import { BookOpen } from 'lucide-react';
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
      <DashboardLayout showHeader={true} hideCreateButton={true}>
        <div className="mx-auto w-[80%] space-y-6 py-8">
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
      <DashboardLayout showHeader={true} hideCreateButton={true}>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-red-500">{error || 'Không tìm thấy công thức'}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 rounded-md px-3 py-2 text-sm text-[#99b94a] hover:bg-[#88a43a]/10 focus:ring-2 focus:ring-[#99b94a] focus:ring-offset-2 focus:outline-none"
            >
              Quay lại
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout showHeader={true} hideCreateButton={true}>
      <div className="mx-auto w-[80%] pt-4 pb-8">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-[#99b94a]/10">
            <BookOpen className="h-7 w-7 text-[#99b94a]" />
          </div>
          <div className="flex-1 pt-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-[#99b94a]">
              Chỉnh sửa công thức
            </h1>
            <p className="text-muted-foreground text-sm">Cập nhật thông tin công thức của bạn</p>
          </div>
        </div>

        <RecipeForm recipeId={recipeId} initialData={recipe} mode="edit" />
      </div>
    </DashboardLayout>
  );
}
