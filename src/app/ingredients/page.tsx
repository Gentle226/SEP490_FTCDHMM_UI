'use client';

import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Lightbulb, Search, X } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { Pagination } from '@/base/components/layout/pagination';
import { Button } from '@/base/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/base/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/base/components/ui/dropdown-menu';
import { Input } from '@/base/components/ui/input';
import { Pagination as PaginationType } from '@/base/types';
import {
  IngredientDetailsResponse,
  ingredientPublicService,
} from '@/modules/ingredients/services/ingredient-public.service';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Convert API response to pagination type
function convertToPaginationType(data: {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}): PaginationType {
  return {
    total: data.totalCount,
    currentPage: data.pageNumber,
    pageSize: data.pageSize,
    totalPage: data.totalPages,
    hasNextPage: data.pageNumber < data.totalPages,
    hasPreviousPage: data.pageNumber > 1,
  };
}

export default function IngredientsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL params
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSearch = searchParams.get('search') || '';
  const currentPageSize = parseInt(searchParams.get('pageSize') || '20', 10);

  // State
  const [page, setPage] = useState(currentPage);
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [pageSize, setPageSize] = useState(currentPageSize);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Detail dialog state
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientDetailsResponse | null>(
    null,
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    setPage(currentPage);
    setSearchTerm(currentSearch);
    setPageSize(currentPageSize);
  }, [currentPage, currentSearch, currentPageSize]);

  // Update URL when search term changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (debouncedSearchTerm) {
      params.set('search', debouncedSearchTerm);
    } else {
      params.delete('search');
    }

    // Reset to page 1 when searching
    if (debouncedSearchTerm !== currentSearch) {
      params.set('page', '1');
    }

    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearchTerm, pathname, router, searchParams, currentSearch]);

  // Update URL when page changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  }, [page, pathname, router, searchParams]);

  // Update URL when pageSize changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('pageSize', pageSize.toString());
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  }, [pageSize, pathname, router, searchParams]);

  // Fetch ingredients
  const { data: ingredientsData, isLoading } = useQuery({
    queryKey: ['ingredients-public', { page, search: debouncedSearchTerm, pageSize }],
    queryFn: () =>
      ingredientPublicService.getIngredients({
        pageNumber: page,
        pageSize: pageSize,
        keyword: debouncedSearchTerm || undefined,
      }),
  });

  // Fetch ingredient details
  const fetchIngredientDetails = async (ingredientId: string) => {
    setIsLoadingDetails(true);
    try {
      const details = await ingredientPublicService.getIngredientById(ingredientId);
      setSelectedIngredient(details);
      setIsDetailDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch ingredient details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const utcDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    return new Date(utcDateString).toLocaleDateString('vi-VN');
  };

  // Get key nutrients for display
  const getKeyNutrients = (nutrients?: IngredientDetailsResponse['nutrients']) => {
    if (!nutrients) return [];

    const macroKeywords = [
      'protein',
      'chất đạm',
      'fat',
      'tổng chất béo',
      'carbohydrate',
      'tinh bột',
      'năng lượng',
      'calories',
    ];
    const prioritizedNutrients: typeof nutrients = [];
    const remainingNutrients: typeof nutrients = [];

    nutrients.forEach((nutrient) => {
      const name = (nutrient.vietnameseName || nutrient.name || '').toLowerCase();
      if (macroKeywords.some((keyword) => name.includes(keyword))) {
        prioritizedNutrients.push(nutrient);
      } else {
        remainingNutrients.push(nutrient);
      }
    });

    return [...prioritizedNutrients.slice(0, 4), ...remainingNutrients.slice(0, 2)];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#99b94a]">Kho Nguyên Liệu</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Khám phá các nguyên liệu và thông tin dinh dưỡng chi tiết
            </p>
          </div>

          {/* Search */}
          <div className="flex w-full items-center gap-2 sm:w-80">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm nguyên liệu..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pr-10 pl-10"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Xóa tìm kiếm"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#99b94a] border-t-transparent" />
          </div>
        )}

        {/* No Results */}
        {!isLoading && ingredientsData?.items?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Search className="mb-4 h-12 w-12 text-gray-300" />
            {debouncedSearchTerm ? (
              <p className="text-gray-500">
                Không tìm thấy nguyên liệu nào với từ khóa &ldquo;{debouncedSearchTerm}&rdquo;
              </p>
            ) : (
              <p className="text-gray-500">Chưa có nguyên liệu nào</p>
            )}
          </div>
        )}

        {/* Ingredients Grid */}
        {!isLoading && ingredientsData && ingredientsData.items.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {ingredientsData.items.map((ingredient) => (
                <button
                  key={ingredient.id}
                  onClick={() => fetchIngredientDetails(ingredient.id)}
                  className="group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:border-[#99b94a] hover:shadow-md"
                >
                  {/* Image */}
                  <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                    {ingredient.imageUrl ? (
                      <Image
                        src={ingredient.imageUrl}
                        alt={ingredient.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-4xl">🥬</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col p-3">
                    <h3 className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-[#99b94a]">
                      {ingredient.name}
                    </h3>
                    {ingredient.categoryNames && ingredient.categoryNames.length > 0 && (
                      <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                        {ingredient.categoryNames.map((c) => c.name).join(', ')}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination & Page Size */}
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-sm text-gray-500">
                {debouncedSearchTerm ? (
                  <>
                    Tìm thấy <span className="font-medium">{ingredientsData.totalCount}</span> kết
                    quả cho &ldquo;{debouncedSearchTerm}&rdquo;
                  </>
                ) : (
                  <>
                    Hiển thị <span className="font-medium">{ingredientsData.items.length}</span>{' '}
                    trên tổng số <span className="font-medium">{ingredientsData.totalCount}</span>{' '}
                    nguyên liệu
                  </>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Page Size Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Hiển thị:</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="min-w-[80px] gap-2">
                        {pageSize}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {[10, 20, 50].map((size) => (
                        <DropdownMenuItem
                          key={size}
                          onClick={() => setPageSize(size)}
                          className={pageSize === size ? 'bg-[#99b94a]/10 text-[#99b94a]' : ''}
                        >
                          {size} mục
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Pagination */}
            {ingredientsData.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination pagination={convertToPaginationType(ingredientsData)} />
              </div>
            )}
          </>
        )}

        {/* Ingredient Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="text-2xl text-[#99b94a]">Chi tiết nguyên liệu</DialogTitle>
              <DialogDescription>Thông tin chi tiết và hàm lượng dinh dưỡng</DialogDescription>
            </DialogHeader>

            {isLoadingDetails ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#99b94a] border-t-transparent" />
              </div>
            ) : (
              selectedIngredient && (
                <div className="space-y-4">
                  {/* Image and Basic Info */}
                  <div className="flex flex-col gap-4 sm:flex-row">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      {selectedIngredient.imageUrl ? (
                        <div className="relative h-48 w-48 overflow-hidden rounded-lg">
                          <Image
                            src={selectedIngredient.imageUrl}
                            alt={selectedIngredient.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-gray-100">
                          <span className="text-6xl">🥬</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <span className="font-semibold">Tên: </span>
                        <span>{selectedIngredient.name}</span>
                      </div>

                      {selectedIngredient.description && (
                        <div>
                          <span className="font-semibold">Mô tả: </span>
                          <span>{selectedIngredient.description}</span>
                        </div>
                      )}

                      {selectedIngredient.categories &&
                        selectedIngredient.categories.length > 0 && (
                          <div>
                            <span className="font-semibold">Danh mục: </span>
                            <span>
                              {selectedIngredient.categories.map((c) => c.name).join(', ')}
                            </span>
                          </div>
                        )}

                      <div>
                        <span className="font-semibold">Cập nhật lần cuối: </span>
                        <span>{formatDate(selectedIngredient.lastUpdatedUtc)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Nutrients Preview */}
                  {getKeyNutrients(selectedIngredient.nutrients).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="flex items-center gap-2 font-semibold text-[#99b94a]">
                        <Lightbulb className="h-4 w-4" />
                        Dinh dưỡng chính (trên 100g)
                      </h4>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {getKeyNutrients(selectedIngredient.nutrients).map((nutrient, index) => (
                          <div key={index} className="rounded-lg border bg-lime-50 p-3">
                            <div className="text-sm font-medium">
                              {nutrient.vietnameseName || nutrient.name || 'N/A'}
                            </div>
                            <div className="mt-1 text-lg font-bold text-[#99b94a]">
                              {nutrient.medianValue !== undefined
                                ? `${nutrient.medianValue} ${nutrient.unit}`
                                : 'N/A'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Nutrients */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-[#99b94a]">
                      Toàn bộ hàm lượng dinh dưỡng (trên 100g)
                    </h4>
                    {!selectedIngredient.nutrients || selectedIngredient.nutrients.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Chưa có thông tin dinh dưỡng</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedIngredient.nutrients.map((nutrient, index) => (
                          <div key={index} className="rounded-lg border bg-gray-50 p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                {nutrient.vietnameseName ||
                                  nutrient.name ||
                                  `Dinh dưỡng ${index + 1}`}
                              </span>
                              {nutrient.unit && (
                                <span className="text-muted-foreground text-xs">
                                  ({nutrient.unit})
                                </span>
                              )}
                            </div>
                            <div className="mt-1 space-y-1 text-xs">
                              {nutrient.minValue !== undefined && (
                                <div>
                                  <span className="text-muted-foreground">Min: </span>
                                  <span className="font-medium">{nutrient.minValue}</span>
                                </div>
                              )}
                              {nutrient.medianValue !== undefined && (
                                <div>
                                  <span className="text-muted-foreground">Median: </span>
                                  <span className="font-medium text-lime-700">
                                    {nutrient.medianValue}
                                  </span>
                                </div>
                              )}
                              {nutrient.maxValue !== undefined && (
                                <div>
                                  <span className="text-muted-foreground">Max: </span>
                                  <span className="font-medium">{nutrient.maxValue}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Search recipes button */}
                  <div className="border-t pt-4">
                    <Button
                      className="w-full bg-[#99b94a] hover:bg-[#7a8f3a]"
                      onClick={() => {
                        router.push(`/search?q=${encodeURIComponent(selectedIngredient.name)}`);
                        setIsDetailDialogOpen(false);
                      }}
                    >
                      Tìm công thức với {selectedIngredient.name}
                    </Button>
                  </div>
                </div>
              )
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
