'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { ChevronLeftIcon, SearchIcon, Utensils, UtensilsCrossedIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';

import { Button } from '@/base/components/ui/button';
import { Input } from '@/base/components/ui/input';
import { RecipeCardHorizontal } from '@/base/components/ui/recipe-card-horizontal';
import { useAuth } from '@/modules/auth';
import { recipeService } from '@/modules/recipes/services/recipe.service';

import { FilterState, SearchFilter } from './search-filter';

export function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<FilterState>({});

  // Infinite query for search results
  const {
    data: resultsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['searchRecipes', searchQuery, filters],
    queryFn: async ({ pageParam }) => {
      const response = await recipeService.searchRecipes({
        keyword: searchQuery || undefined,
        pageNumber: pageParam,
        pageSize: 10,
        ...filters,
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pageNumber < lastPage.totalPages) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
  });

  // Flatten results from pages
  const results = resultsData?.pages.flatMap((page) => page.items) || [];
  const totalCount = resultsData?.pages[0]?.totalCount || 0;

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0 });

  // Trigger infinite scroll
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleRecipeClick = (recipeId: string) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để xem chi tiết công thức');
      router.push('/auth/login');
      return;
    }
    router.push(`/recipe/${recipeId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30">
      {/* Header with Search */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10 rounded-full border border-gray-200 text-gray-600 transition-all hover:border-[#99b94a] hover:bg-[#99b94a]/10 hover:text-[#99b94a]"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </Button>

            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Nhập từ khóa tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 rounded-full border-gray-200 bg-gray-50 pr-14 pl-12 text-base transition-all focus:border-[#99b94a] focus:bg-white focus:ring-2 focus:ring-[#99b94a]/20"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute top-1/2 right-1.5 h-9 w-9 -translate-y-1/2 rounded-full bg-[#99b94a] shadow-md shadow-[#99b94a]/30 transition-all hover:bg-[#7a8f3a] hover:shadow-lg"
                >
                  <SearchIcon className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-5 sm:py-8">
        <div className="flex flex-col gap-5 sm:gap-6 lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Filters - Full width on mobile, 1/3 on desktop */}
          <div className="lg:col-span-1">
            <SearchFilter onFilterChange={handleFilterChange} />
          </div>

          {/* Search Results - Full width on mobile, 2/3 width on desktop */}
          <div className="lg:col-span-2">
            {/* Results Header */}
            <div className="mb-5 sm:mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-[#99b94a]" />
                    <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
                      Kết quả tìm kiếm
                    </h1>
                  </div>
                  {searchQuery && (
                    <p className="text-sm text-gray-500">
                      cho từ khóa &quot;
                      <span className="font-medium text-[#99b94a]">{searchQuery}</span>&quot;
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 rounded-full bg-[#99b94a]/10 px-3 py-1.5 text-sm font-semibold text-[#99b94a]">
                  <UtensilsCrossedIcon className="h-4 w-4" />
                  {results.length} món
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }, (_, i) => (
                  <RecipeCardHorizontal key={i} isLoading={true} />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm sm:p-16">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                  <SearchIcon className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-700 sm:text-xl">
                  Không tìm thấy công thức nào
                </p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                  Hãy thử thay đổi từ khóa hoặc điều chỉnh bộ lọc để tìm thấy nhiều công thức hơn
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {results.map((recipe) => (
                    <RecipeCardHorizontal
                      key={recipe.id}
                      id={recipe.id}
                      title={recipe.name}
                      author={recipe.author}
                      image={recipe.imageUrl}
                      cookTime={recipe.cookTime}
                      ration={recipe.ration}
                      difficulty={
                        typeof recipe.difficulty?.name === 'string'
                          ? recipe.difficulty.name
                          : typeof recipe.difficulty?.value === 'string'
                            ? String(recipe.difficulty.value)
                            : undefined
                      }
                      ingredients={recipe.ingredients || []}
                      labels={recipe.labels || []}
                      createdAtUtc={recipe.createdAtUtc}
                      onClick={() => handleRecipeClick(recipe.id)}
                    />
                  ))}
                </div>

                {/* Infinite scroll trigger */}
                {hasNextPage && (
                  <div ref={loadMoreRef} className="flex justify-center py-8">
                    {isFetchingNextPage && (
                      <div className="flex items-center gap-2 text-[#99b94a]">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#99b94a] border-t-transparent"></div>
                        <span>Đang tải thêm...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* No more data message */}
                {!hasNextPage && totalCount > 0 && (
                  <div className="py-8 text-center text-gray-500">
                    Đã hiển thị tất cả {totalCount} công thức
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
