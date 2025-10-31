'use client';

import { ChefHat } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { Pagination } from '@/base/components/layout/pagination';
import { Button } from '@/base/components/ui/button';
import { Skeleton } from '@/base/components/ui/skeleton';
import { MyRecipeCard } from '@/modules/recipes/components/my-recipe-card';
import { useUserRecipes } from '@/modules/recipes/hooks';

interface UserRecipesListProps {
  userId: string;
  isOwnProfile?: boolean;
  onRecipeCountChange?: (count: number) => void;
}

export function UserRecipesList({
  userId,
  isOwnProfile = false,
  onRecipeCountChange,
}: UserRecipesListProps) {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const pageSize = 10;

  const {
    data: recipesData,
    isLoading,
    error,
  } = useUserRecipes({
    userId,
    pageNumber: currentPage,
    pageSize,
  });

  // Update parent component with recipe count when data changes
  useEffect(() => {
    if (recipesData && onRecipeCountChange) {
      onRecipeCountChange(recipesData.totalCount);
    }
  }, [recipesData, onRecipeCountChange]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <RecipeCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-600">Có lỗi xảy ra khi tải danh sách công thức</p>
        <p className="text-muted-foreground mt-2 text-sm">Vui lòng thử lại sau</p>
      </div>
    );
  }

  // Empty state
  if (!recipesData || recipesData.items.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <div className="mb-4 rounded-full bg-gray-200 p-4">
          <ChefHat className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          {isOwnProfile ? 'Bạn chưa có công thức nào' : 'Người dùng chưa có công thức nào'}
        </h3>
        <p className="text-muted-foreground mb-4 max-w-md text-sm">
          {isOwnProfile
            ? 'Hãy bắt đầu chia sẻ những công thức nấu ăn yêu thích của bạn với cộng đồng'
            : 'Người dùng này chưa chia sẻ công thức nào'}
        </p>
        {isOwnProfile && (
          <Button
            className="bg-[#99b94a] hover:bg-[#7a9a3d]"
            onClick={() => (window.location.href = '/recipe/new')}
          >
            Tạo công thức mới
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recipe Grid */}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {recipesData.items.map((recipe) => (
          <MyRecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {/* Pagination */}
      {recipesData.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            pagination={{
              total: recipesData.totalCount,
              currentPage: recipesData.pageNumber,
              pageSize: recipesData.pageSize,
              totalPage: recipesData.totalPages,
              hasNextPage: recipesData.pageNumber < recipesData.totalPages,
              hasPreviousPage: recipesData.pageNumber > 1,
            }}
          />
        </div>
      )}
    </div>
  );
}

// Recipe Card Skeleton Component
function RecipeCardSkeleton() {
  return (
    <div className="bg-card group overflow-hidden rounded-lg border transition-shadow hover:shadow-md">
      <div className="aspect-video">
        <Skeleton className="size-full rounded-none" />
      </div>
      <div className="space-y-2 p-3 sm:space-y-3 sm:p-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Skeleton className="h-4 w-3/4 sm:h-5" />
          <Skeleton className="h-3 w-full sm:h-4" />
          <Skeleton className="h-3 w-2/3 sm:h-4" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Skeleton className="size-5 rounded-full sm:size-6" />
            <Skeleton className="h-3 w-16 sm:h-4 sm:w-20" />
          </div>
          <div className="flex gap-1.5 sm:gap-2">
            <Skeleton className="h-3 w-10 sm:h-4 sm:w-12" />
            <Skeleton className="h-3 w-10 sm:h-4 sm:w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
