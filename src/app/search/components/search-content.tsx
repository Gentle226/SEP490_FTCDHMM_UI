'use client';

import { ChevronLeftIcon, SearchIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/base/components/ui/button';
import { Input } from '@/base/components/ui/input';
import { RecipeCardHorizontal } from '@/base/components/ui/recipe-card-horizontal';
import { recipeService } from '@/modules/recipes/services/recipe.service';
import { MyRecipeResponse } from '@/modules/recipes/types/my-recipe.types';

import { FilterState, SearchFilter } from './search-filter';

export function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<MyRecipeResponse['items']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchResults = useCallback(
    async (query: string, filtersToApply: FilterState, page: number) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await recipeService.searchRecipes({
          keyword: query,
          pageNumber: page,
          pageSize: 10,
          ...filtersToApply,
        });
        setResults(response.items || []);
        setTotalPages(response.totalPages || 0);
      } catch (error) {
        console.warn('Error searching recipes:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Fetch results when filters change
  useEffect(() => {
    setPageNumber(1);
    fetchResults(searchQuery, filters, 1);
  }, [filters, searchQuery, fetchResults]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setPageNumber(1);
      fetchResults(searchQuery, filters, 1);
    }
  };

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setPageNumber(1);
  }, []);

  return (
    <>
      {/* Header with Search */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </Button>

            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Tìm món ăn hoặc nguyên liệu"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 border-gray-200 pr-10 focus:border-[#99b94a]"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute top-1 right-1 h-8 w-8 bg-[#99b94a] hover:bg-[#7a8f3a]"
                >
                  <SearchIcon className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col gap-4 sm:gap-6 lg:grid lg:grid-cols-3">
          {/* Filters - Full width on mobile, 1/3 on desktop */}
          <div className="lg:col-span-1">
            <SearchFilter onFilterChange={handleFilterChange} />
          </div>

          {/* Search Results - Full width on mobile, 2/3 width on desktop */}
          <div className="lg:col-span-2">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl font-bold text-[#99b94a] sm:text-2xl">
                Kết quả tìm kiếm cho &quot;{searchQuery}&quot;
              </h1>
              <p className="mt-1 text-xs text-gray-600 sm:mt-2 sm:text-sm">
                Tìm thấy {results.length} kết quả
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }, (_, i) => (
                  <RecipeCardHorizontal key={i} isLoading={true} />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-6 text-center sm:p-12">
                <SearchIcon className="mx-auto mb-3 h-10 w-10 text-gray-300 sm:mb-4 sm:h-12 sm:w-12" />
                <p className="text-base text-gray-600 sm:text-lg">Không tìm thấy công thức nào</p>
                <p className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-sm">
                  Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn
                </p>
              </div>
            ) : (
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
                    onClick={() => router.push(`/recipe/${recipe.id}`)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={pageNumber === 1}
                  onClick={() => {
                    const newPage = pageNumber - 1;
                    setPageNumber(newPage);
                    fetchResults(searchQuery, filters, newPage);
                  }}
                >
                  Trang trước
                </Button>
                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm text-gray-600">
                    Trang {pageNumber} / {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  disabled={pageNumber === totalPages}
                  onClick={() => {
                    const newPage = pageNumber + 1;
                    setPageNumber(newPage);
                    fetchResults(searchQuery, filters, newPage);
                  }}
                >
                  Trang sau
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
