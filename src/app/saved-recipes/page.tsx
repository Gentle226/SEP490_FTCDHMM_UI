'use client';

import { useQuery } from '@tanstack/react-query';
import { Bookmark, Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { Pagination } from '@/base/components/layout/pagination';
import { Button } from '@/base/components/ui/button';
import { Input } from '@/base/components/ui/input';
import { Skeleton } from '@/base/components/ui/skeleton';
import { MyRecipeCard } from '@/modules/recipes/components/my-recipe-card';
import { recipeService } from '@/modules/recipes/services/recipe.service';

function SavedRecipesContent() {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const pageSize = 10;
  const [keyword, setKeyword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['savedRecipes', currentPage, pageSize, searchTerm],
    queryFn: () =>
      recipeService.getSavedRecipes({
        pageNumber: currentPage,
        pageSize: pageSize,
        keyword: searchTerm,
      }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(keyword);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 px-4">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#99b94a]/10 sm:h-14 sm:w-14">
              <Bookmark className="h-6 w-6 text-[#99b94a] sm:h-7 sm:w-7" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold tracking-tight text-[#99b94a] sm:text-2xl">
                Món Đã Lưu
                {data && (
                  <span className="text-muted-foreground ml-2 text-base font-normal sm:text-lg">
                    ({data.totalCount})
                  </span>
                )}
              </h1>
              <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                Các công thức nấu ăn bạn đã lưu lại
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" className="bg-[#99b94a] hover:bg-[#7a9a3d]">
            Tìm kiếm
          </Button>
        </form>

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-red-600">Có lỗi xảy ra khi tải danh sách món ăn đã lưu</p>
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
              <Bookmark className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              {searchTerm ? 'Không tìm thấy món ăn' : 'Chưa có món ăn đã lưu'}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Thử tìm kiếm với từ khóa khác'
                : 'Khám phá và lưu lại món ăn yêu thích của bạn'}
            </p>
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

export default function SavedRecipesPage() {
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
      <SavedRecipesContent />
    </Suspense>
  );
}
