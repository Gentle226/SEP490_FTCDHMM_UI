'use client';

import { useQuery } from '@tanstack/react-query';
import { CookingPot } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { Pagination } from '@/base/components/layout/pagination';
import { Button } from '@/base/components/ui/button';
import { Skeleton } from '@/base/components/ui/skeleton';
import { MyRecipeCard } from '@/modules/recipes/components/my-recipe-card';
import { recipeService } from '@/modules/recipes/services/recipe.service';

function MyRecipeContent() {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const pageSize = 12;

  const { data, isLoading, error } = useQuery({
    queryKey: ['myRecipes', currentPage, pageSize],
    queryFn: () =>
      recipeService.getMyRecipes({
        pageNumber: currentPage,
        pageSize: pageSize,
      }),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 px-4">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#99b94a]/10 sm:h-14 sm:w-14">
                <CookingPot className="h-6 w-6 text-[#99b94a] sm:h-7 sm:w-7" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold tracking-tight text-[#99b94a] sm:text-2xl">
                  Món Của Tôi
                  {data && (
                    <span className="text-muted-foreground ml-2 text-base font-normal sm:text-lg">
                      ({data.totalCount})
                    </span>
                  )}
                </h1>
                <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                  Quản lý tất cả công thức nấu ăn của bạn
                </p>
              </div>
            </div>
            <Link href="/drafts" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full flex-shrink-0 border-[#99b94a] text-[#99b94a] hover:bg-[#99b94a]/10 sm:w-auto"
              >
                Xem danh sách bản nháp
              </Button>
            </Link>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-red-600">Có lỗi xảy ra khi tải danh sách món ăn</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: pageSize }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && data && data.items.length === 0 && (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <div className="mb-4 rounded-full bg-gray-200 p-4">
              <svg
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Chưa có món ăn nào</h3>
            <p className="mb-6 text-gray-600">Bắt đầu tạo công thức nấu ăn đầu tiên của bạn</p>
          </div>
        )}

        {/* Recipe Grid */}
        {!isLoading && data && data.items.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.items.map((recipe) => (
                <MyRecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  pagination={{
                    total: data.totalCount,
                    currentPage: data.pageNumber,
                    pageSize: data.pageSize,
                    totalPage: data.totalPages,
                    hasNextPage: data.pageNumber < data.totalPages,
                    hasPreviousPage: data.pageNumber > 1,
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function MyRecipePage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="mt-2 h-4 w-64" />
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          </div>
        </DashboardLayout>
      }
    >
      <MyRecipeContent />
    </Suspense>
  );
}
