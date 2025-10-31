'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Eye, Search, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { toast } from 'sonner';

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
import { CreateIngredientDialog } from './create-ingredient-dialog';
import { EditIngredientDialog } from './edit-ingredient-dialog';

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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

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

  // Fetch full ingredient details when detail dialog opens
  const { data: detailedIngredient } = useQuery({
    queryKey: ['ingredient-detail', selectedIngredient?.id],
    queryFn: () => {
      if (!selectedIngredient?.id) throw new Error('No ingredient ID');
      return ingredientManagementService.getIngredientById(selectedIngredient.id);
    },
    enabled: detailDialogOpen && !!selectedIngredient?.id,
  });

  const queryClient = useQueryClient();

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (ingredientId: string) => {
      return ingredientManagementService.deleteIngredient(ingredientId);
    },
    onSuccess: () => {
      toast.success('Xóa nguyên liệu thành công');
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
    onError: (error: Error) => {
      console.warn('Delete error:', error);
      toast.error(error.message || 'Không thể xóa nguyên liệu');
    },
  });

  // Helper function to convert API response to PaginationType
  const convertToPaginationType = (data: {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  }): PaginationType => ({
    total: data.totalCount,
    currentPage: data.pageNumber,
    pageSize: data.pageSize,
    totalPage: data.totalPages,
    hasNextPage: data.pageNumber < data.totalPages,
    hasPreviousPage: data.pageNumber > 1,
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
        pageNumber: page,
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

    try {
      // Parse ISO 8601 format: "2025-10-02T06:31:14.042026"
      // Create date by parsing the string - date-fns will handle it
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) return 'N/A';

      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
    } catch {
      return 'N/A';
    }
  };

  const handleViewDetails = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setDetailDialogOpen(true);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setEditDialogOpen(true);
  };

  const handleDelete = (ingredientId: string) => {
    if (confirm('Bạn có chắc muốn xóa nguyên liệu này?')) {
      deleteMutation.mutate(ingredientId);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(1);
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

        {/* Actions */}
        <div className="flex w-full gap-2 sm:w-auto sm:flex-row-reverse">
          {/* Create button */}
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="flex bg-[#99b94a] hover:bg-[#88a839] sm:flex-initial"
          >
            + Thêm nguyên liệu mới
          </Button>

          {/* Search */}
          <div className="relative flex-1 sm:w-64">
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
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[23%] pl-12">Tên nguyên liệu</TableHead>
              <TableHead className="w-[15%]">Phân loại</TableHead>
              <TableHead className="w-[22%] text-center">Năng Lượng (kcal)</TableHead>
              <TableHead className="w-[20%] text-center">Cập nhật Lần Cuối</TableHead>
              <TableHead className="w-[7%] text-center">Chi Tiết</TableHead>
              <TableHead className="w-[7%] text-center">Chỉnh Sửa</TableHead>
              <TableHead className="w-[6%] pr-12 text-center">Xóa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex items-center justify-center">
                    <div className="text-muted-foreground">Đang tải...</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : !ingredientsData?.items || ingredientsData.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-muted-foreground">Không tìm thấy nguyên liệu nào.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              ingredientsData.items.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell className="pl-12 font-medium">
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
                  <TableCell className="text-center">
                    <span className="text-sm font-medium">-</span>
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {formatDate(ingredient.lastUpdatedUtc)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(ingredient)}
                      title="Xem chi tiết"
                    >
                      <Eye className="size-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(ingredient)}
                      title="Chỉnh sửa"
                    >
                      <Edit className="size-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="pr-12 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(ingredient.id)}
                      disabled={deleteMutation.isPending}
                      title="Xóa"
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </Button>
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
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="text-3xl text-[#99b94a]">Chi tiết nguyên liệu</DialogTitle>
            <DialogDescription>Thông tin chi tiết và hàm lượng dinh dưỡng</DialogDescription>
          </DialogHeader>

          {(detailedIngredient || selectedIngredient) && (
            <div className="space-y-4">
              {/* Use detailedIngredient if available, otherwise fall back to selectedIngredient */}
              {(() => {
                const ingredient = detailedIngredient || selectedIngredient;
                return (
                  <>
                    {/* Image and Basic Info - Side by Side Layout */}
                    <div className="flex flex-col gap-4 sm:flex-row">
                      {/* Image on the left */}
                      <div className="flex-shrink-0">
                        {ingredient?.image ? (
                          <div className="flex justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={ingredient.image}
                              alt={ingredient.name}
                              className="h-48 w-48 rounded-lg object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-gray-100">
                            <span className="text-muted-foreground text-sm">Không có hình ảnh</span>
                          </div>
                        )}
                      </div>

                      {/* Info on the right */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <span className="font-semibold">Tên: </span>
                          <span>{ingredient?.name}</span>
                        </div>

                        {ingredient?.description && (
                          <div>
                            <span className="font-semibold">Mô tả: </span>
                            <span>{ingredient.description}</span>
                          </div>
                        )}

                        <div>
                          <span className="font-semibold">Phân loại: </span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {ingredient?.ingredientCategoryIds &&
                            ingredient.ingredientCategoryIds.length > 0 ? (
                              getCategoryNames(ingredient.ingredientCategoryIds).map((category) => (
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
                          <span>{formatDate(ingredient?.lastUpdatedUtc)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Nutrients */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-[#99b94a]">
                        Hàm lượng dinh dưỡng (trên 100g)
                      </h4>
                      {!ingredient?.nutrients || ingredient.nutrients.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                          Chưa có thông tin dinh dưỡng
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {ingredient.nutrients.map((nutrient, index) => {
                            // Find nutrient details to get name
                            const nutrientDetails = nutrient.vietnameseName ? nutrient : null;
                            return (
                              <div key={index} className="rounded-lg border bg-gray-50 p-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    {nutrientDetails?.vietnameseName || `Dinh dưỡng ${index + 1}`}
                                  </span>
                                  {nutrient.unit && (
                                    <span className="text-muted-foreground text-xs">
                                      ({nutrient.unit})
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1 space-y-1 text-xs">
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
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <EditIngredientDialog
        ingredient={selectedIngredient}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {/* Create Dialog */}
      <CreateIngredientDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}
