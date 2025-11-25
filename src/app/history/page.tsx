'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { Pagination } from '@/base/components/layout/pagination';
import { Skeleton } from '@/base/components/ui/skeleton';
import { MyRecipeCard } from '@/modules/recipes/components/my-recipe-card';
import { recipeService } from '@/modules/recipes/services/recipe.service';

function HistoryContent() {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const pageSize = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['recipeHistory', currentPage, pageSize],
    queryFn: () =>
      recipeService.getHistory({
        pageNumber: currentPage,
        pageSize: pageSize,
      }),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 px-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#99b94a]">
              Công Thức Đã Xem
              {data && <span className="ml-2 text-[#99b94a]">({data.totalCount})</span>}
            </h1>
            <p className="mt-1 text-gray-600">Lịch sử các công thức nấu ăn bạn đã xem</p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-red-600">Có lỗi xảy ra khi tải lịch sử xem công thức</p>
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

export default function HistoryPage() {
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
      <HistoryContent />
    </Suspense>
  );
}
