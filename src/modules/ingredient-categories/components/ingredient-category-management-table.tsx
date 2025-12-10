'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Plus, Search, Trash, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Pagination } from '@/base/components/layout/pagination';
import { Button } from '@/base/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/base/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/base/components/ui/dropdown-menu';
import { Input } from '@/base/components/ui/input';
import { Label as UILabel } from '@/base/components/ui/label';
import { Pagination as PaginationType } from '@/base/types';

import {
  CreateIngredientCategoryRequest,
  IngredientCategory,
  PaginationParams,
  ingredientCategoryManagementService,
} from '../services/ingredient-category-management.service';

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

// Helper function to convert paginated response to pagination type
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

export function IngredientCategoryManagementTable() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSearch = searchParams.get('search') || '';
  const currentPageSize = parseInt(searchParams.get('pageSize') || '20', 10);

  const [page, setPage] = useState(currentPage);
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [pageSize, setPageSize] = useState(currentPageSize);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const queryClient = useQueryClient();
  const queryKey = ['ingredient-categories', { page, search: debouncedSearchTerm, pageSize }];

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
    params.set('page', '1'); // Reset to page 1 when changing page size
    router.push(`${pathname}?${params.toString()}`);
  }, [pageSize, pathname, router, searchParams]);

  // Fetch categories
  const { data: categoriesData, isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      const params: PaginationParams = {
        pageNumber: page,
        pageSize: pageSize,
        keyword: debouncedSearchTerm || undefined,
      };
      return ingredientCategoryManagementService.getCategories(params);
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (request: CreateIngredientCategoryRequest) =>
      ingredientCategoryManagementService.createCategory(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredient-categories'] });
      setCreateDialogOpen(false);
      setNewCategoryName('');
      toast.success('Danh mục đã được tạo thành công.');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      let errorMessage = 'Không thể tạo danh mục.';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => ingredientCategoryManagementService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredient-categories'] });
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
      toast.success('Danh mục đã được xóa thành công.');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      let errorMessage = 'Không thể xóa danh mục.';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    },
  });

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      createCategoryMutation.mutate({
        name: newCategoryName.trim(),
      });
    }
  };

  const handleDeleteCategory = (category: IngredientCategory) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      deleteCategoryMutation.mutate(selectedCategory.id);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Search Bar + Create Button: flex row, cả hai bên phải */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="relative ml-0 sm:ml-4 sm:w-1/4">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
          <Input
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pr-10 pl-10"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Xóa tìm kiếm"
              title="Xóa tìm kiếm"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#99b94a] hover:bg-[#7a8f3a]">
              <Plus className="mr-2 h-4 w-4" />
              Thêm Danh Mục Mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-[#99b94a]">Tạo Danh Mục Mới</DialogTitle>
              <DialogDescription>Nhập tên cho danh mục nguyên liệu mới.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <UILabel htmlFor="name" className="mb-3 text-[#99b94a]">
                  Tên Danh Mục <span className="text-red-500">*</span>
                </UILabel>
                <Input
                  id="name"
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nhập tên danh mục..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button
                className="bg-[#99b94a] hover:bg-[#7a8f3a]"
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
              >
                {createCategoryMutation.isPending ? 'Đang tạo...' : 'Tạo Danh Mục'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="w-full overflow-hidden rounded-md border">
        {categoriesData?.items?.length === 0 ? (
          <div className="flex h-24 items-center justify-center">
            {debouncedSearchTerm ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <Search className="size-8 text-gray-400" />
                <p className="text-gray-500">
                  Không tìm thấy danh mục nào với từ khóa &ldquo;{debouncedSearchTerm}&rdquo;
                </p>
              </div>
            ) : (
              <p className="text-gray-500">{isLoading ? 'Đang tải...' : 'Không có danh mục nào'}</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-2">
            {categoriesData?.items?.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between gap-3 border-r border-b px-4 py-3 transition-colors hover:bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{category.name}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCategory(category)}
                  className="h-8 w-8 flex-shrink-0 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                  title="Xóa danh mục"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search Results Info */}
      {categoriesData && (
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="text-sm text-gray-500">
            {debouncedSearchTerm ? (
              <>
                Tìm thấy <span className="font-medium">{categoriesData?.totalCount || 0}</span> kết
                quả cho &ldquo;{debouncedSearchTerm}&rdquo;
              </>
            ) : (
              <>
                Hiển thị <span className="font-medium">{categoriesData.items.length}</span> trên
                tổng số <span className="font-medium">{categoriesData.totalCount}</span> danh mục
              </>
            )}
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hiển thị:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="min-w-[100px] gap-2">
                  {pageSize} mục
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
      )}

      {/* Pagination */}
      {categoriesData && categoriesData.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination pagination={convertToPaginationType(categoriesData)} />
        </div>
      )}

      {/* Delete Category Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa Danh Mục</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa danh mục &ldquo;{selectedCategory?.name}&rdquo;? Hành động
              này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending ? 'Đang xóa...' : 'Xóa Danh Mục'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
