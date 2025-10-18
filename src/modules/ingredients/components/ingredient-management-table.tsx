'use client';

import { useQuery } from '@tanstack/react-query';
import { MoreVertical, Search, X } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

import { Pagination } from '@/base/components/layout/pagination';
import { Badge } from '@/base/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/base/components/ui/table';
import { Pagination as PaginationType } from '@/base/types';

import {
  Ingredient,
  PaginationParams,
  ingredientManagementService,
} from '../services/ingredient-management.service';

// Custom debounce hook
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

interface IngredientManagementTableProps {
  title: ReactNode;
}

export function IngredientManagementTable({ title }: IngredientManagementTableProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSearch = searchParams.get('search') || '';

  const [page, setPage] = useState(currentPage);
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    setPage(currentPage);
    setSearchTerm(currentSearch);
  }, [currentPage, currentSearch]);

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

  // Fetch categories for mapping
  const { data: categories } = useQuery({
    queryKey: ['ingredient-categories'],
    queryFn: () => ingredientManagementService.getCategories(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Helper function to convert API response to PaginationType
  const convertToPaginationType = (data: {
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }): PaginationType => ({
    total: data.totalCount,
    currentPage: data.page,
    pageSize: data.pageSize,
    totalPage: data.totalPages,
    hasNextPage: data.page < data.totalPages,
    hasPreviousPage: data.page > 1,
  });

  // Fetch ingredients
  const {
    data: ingredientsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['ingredients', page, debouncedSearchTerm],
    queryFn: async () => {
      const params: PaginationParams = {
        page,
        pageSize: 10,
        search: debouncedSearchTerm || undefined,
      };
      return ingredientManagementService.getIngredients(params);
    },
  });

  // Map category IDs to names
  const getCategoryNames = (categoryIds: string[] | undefined | null): string[] => {
    if (!categories || !categoryIds) return [];
    return categoryIds
      .map((id) => categories.find((cat) => cat.id === id)?.name)
      .filter((name): name is string => !!name);
  };

  // Format date
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) return 'N/A';

    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleViewDetails = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setDetailDialogOpen(true);
  };

  const handleEdit = (_ingredient: Ingredient) => {
    // TODO: Navigate to edit page or open edit dialog
    // router.push(`/moderator/ingredient/${ingredient.id}/edit`);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
        <p className="text-red-600">
          Đã xảy ra lỗi khi tải danh sách nguyên liệu. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>{title}</div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
          <Input
            placeholder="Tìm kiếm nguyên liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-8 pl-8"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="text-muted-foreground hover:text-foreground absolute top-2.5 right-2.5"
              aria-label="Clear search"
              title="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%] pl-6">Tên nguyên liệu</TableHead>
              <TableHead className="w-[30%]">Phân loại</TableHead>
              <TableHead className="w-[25%]">Cập nhật</TableHead>
              <TableHead className="w-[15%] pr-6 text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <div className="flex items-center justify-center">
                    <div className="text-muted-foreground">Đang tải...</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : !ingredientsData?.items || ingredientsData.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-muted-foreground">Không tìm thấy nguyên liệu nào.</p>
                    {searchTerm && (
                      <Button variant="link" onClick={handleClearSearch} className="text-[#99b94a]">
                        Xóa bộ lọc
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              ingredientsData.items.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell className="pl-6 font-medium">
                    <div className="flex items-center gap-2">
                      {ingredient.image && (
                        <Image
                          src={ingredient.image}
                          alt={ingredient.name}
                          width={40}
                          height={40}
                          className="size-10 rounded object-cover"
                        />
                      )}
                      <div>
                        <div>{ingredient.name}</div>
                        {ingredient.description && (
                          <div className="text-muted-foreground line-clamp-1 text-xs">
                            {ingredient.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {ingredient.ingredientCategoryIds &&
                      ingredient.ingredientCategoryIds.length > 0 ? (
                        getCategoryNames(ingredient.ingredientCategoryIds).map((category) => (
                          <Badge key={category} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">Chưa phân loại</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(ingredient.lastUpdatedUtc)}</TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(ingredient)}>
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(ingredient)}>
                          Chỉnh sửa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {ingredientsData && ingredientsData.items.length > 0 && (
        <div className="flex justify-center">
          <Pagination pagination={convertToPaginationType(ingredientsData)} />
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-[#99b94a]">Chi tiết nguyên liệu</DialogTitle>
            <DialogDescription>Thông tin chi tiết và hàm lượng dinh dưỡng</DialogDescription>
          </DialogHeader>

          {selectedIngredient && (
            <div className="space-y-4">
              {/* Image */}
              {selectedIngredient.image && (
                <div className="flex justify-center">
                  <Image
                    src={selectedIngredient.image}
                    alt={selectedIngredient.name}
                    width={192}
                    height={192}
                    className="h-48 w-48 rounded-lg object-cover"
                  />
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-2">
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

                <div>
                  <span className="font-semibold">Phân loại: </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedIngredient.ingredientCategoryIds &&
                    selectedIngredient.ingredientCategoryIds.length > 0 ? (
                      getCategoryNames(selectedIngredient.ingredientCategoryIds).map((category) => (
                        <Badge key={category} variant="secondary">
                          {category}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">Chưa phân loại</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="font-semibold">Cập nhật lần cuối: </span>
                  <span>{formatDate(selectedIngredient.lastUpdatedUtc)}</span>
                </div>
              </div>

              {/* Nutrients */}
              <div className="space-y-2">
                <h4 className="font-semibold text-[#99b94a]">Hàm lượng dinh dưỡng</h4>
                {!selectedIngredient.nutrients || selectedIngredient.nutrients.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Chưa có thông tin dinh dưỡng</p>
                ) : (
                  <div className="space-y-2">
                    {selectedIngredient.nutrients.map((nutrient, index) => (
                      <div key={index} className="rounded-lg border bg-gray-50 p-3">
                        <div className="font-medium">{nutrient.name}</div>
                        <div className="mt-1 grid grid-cols-3 gap-2 text-sm">
                          {nutrient.min !== undefined && (
                            <div>
                              <span className="text-muted-foreground">Min: </span>
                              <span className="font-medium">{nutrient.min}</span>
                            </div>
                          )}
                          {nutrient.max !== undefined && (
                            <div>
                              <span className="text-muted-foreground">Max: </span>
                              <span className="font-medium">{nutrient.max}</span>
                            </div>
                          )}
                          {nutrient.median !== undefined && (
                            <div>
                              <span className="text-muted-foreground">Median: </span>
                              <span className="font-medium">{nutrient.median}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
