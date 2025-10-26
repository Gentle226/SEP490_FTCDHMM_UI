'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, Plus, Search, Trash, X } from 'lucide-react';
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

  const [page, setPage] = useState(currentPage);
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  const queryClient = useQueryClient();
  const queryKey = ['ingredient-categories', { page, search: debouncedSearchTerm }];

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

  // Fetch categories
  const { data: categoriesData, isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      const params: PaginationParams = {
        pageNumber: page,
        pageSize: 10,
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
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể tạo danh mục.');
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
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể xóa danh mục.');
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
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[#99b94a]">Quản Lý Nhóm Nguyên Liệu</h2>
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
                  Tên Danh Mục
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

      {/* Search Bar */}
      <div className="flex w-full justify-end">
        <div className="flex w-1/4 items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
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
        </div>
      </div>
      <div className="w-full rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-3/4 pl-32">Tên</TableHead>
              <TableHead className="w-1/4">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoriesData?.items?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  {debouncedSearchTerm ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Search className="size-8 text-gray-400" />
                      <p className="text-gray-500">
                        Không tìm thấy danh mục nào với từ khóa &ldquo;{debouncedSearchTerm}
                        &rdquo;
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      {isLoading ? 'Đang tải...' : 'Không có danh mục nào'}
                    </p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              categoriesData?.items?.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="pl-32 font-medium">{category.name}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDeleteCategory(category)}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Xóa
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

      {/* Search Results Info */}
      {categoriesData && (
        <div className="flex items-center justify-between">
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
