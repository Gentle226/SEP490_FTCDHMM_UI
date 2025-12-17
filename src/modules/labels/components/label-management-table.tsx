'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ChevronDown, Edit, Plus, Search, Trash, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { ConflictDialog } from '@/base/components/conflict-dialog';
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
  CreateLabelRequest,
  Label,
  PaginationParams,
  labelManagementService,
} from '../services/label-management.service';

interface ApiErrorResponse {
  code?: string;
  statusCode?: number;
  message?: string;
}

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

export function LabelManagementTable() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSearch = searchParams.get('search') || '';
  const currentPageSize = parseInt(searchParams.get('pageSize') || '10', 10);

  const [page, setPage] = useState(currentPage);
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [pageSize, setPageSize] = useState(currentPageSize);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editColorDialogOpen, setEditColorDialogOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);
  const [editColorValue, setEditColorValue] = useState('#99b94a');
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);

  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#99b94a');

  const queryClient = useQueryClient();
  const queryKey = ['labels', { page, search: debouncedSearchTerm, pageSize }];

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

  // Fetch labels
  const { data: labelsData, isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      const params: PaginationParams = {
        pageNumber: page,
        pageSize: pageSize,
        keyword: debouncedSearchTerm || undefined,
      };
      return labelManagementService.getLabels(params);
    },
  });

  // Create label mutation
  const createLabelMutation = useMutation({
    mutationFn: (request: CreateLabelRequest) => labelManagementService.createLabel(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      setCreateDialogOpen(false);
      setNewLabelName('');
      setNewLabelColor('#99b94a');
      toast.success('Nhãn đã được tạo thành công.');
    },
    onError: (error: AxiosError) => {
      console.warn('Create error:', error);
      // Check if error is due to duplicate name (EXISTS error code)
      const responseData = error?.response?.data as ApiErrorResponse;
      if (responseData?.code === 'EXISTS' || responseData?.statusCode === 415) {
        toast.error(`Nhãn ${newLabelName} đã tồn tại`);
      } else {
        toast.error(error?.message || 'Không thể thêm nhãn mới.');
      }
    },
  });

  // Delete label mutation
  const deleteLabelMutation = useMutation({
    mutationFn: (id: string) => labelManagementService.deleteLabel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      setDeleteDialogOpen(false);
      setSelectedLabel(null);
      toast.success('Nhãn đã được xóa thành công.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể xóa nhãn.');
    },
  });

  // Update color mutation
  const updateColorMutation = useMutation({
    mutationFn: ({
      id,
      colorCode,
      lastUpdatedUtc,
    }: {
      id: string;
      colorCode: string;
      lastUpdatedUtc: string;
    }) => labelManagementService.updateColorCode(id, { colorCode, lastUpdatedUtc }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      setEditColorDialogOpen(false);
      setSelectedLabel(null);
      setEditColorValue('#99b94a');
      toast.success('Màu nhãn đã được cập nhật thành công.');
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 409) {
        setEditColorDialogOpen(false);
        setConflictDialogOpen(true);
      } else {
        toast.error(error.message || 'Không thể cập nhật màu nhãn.');
      }
    },
  });

  const handleCreateLabel = () => {
    // Validate name
    if (!newLabelName.trim()) {
      toast.error('Tên nhãn không được để trống');
      return;
    }

    if (newLabelName.length > 255) {
      toast.error('Tên nhãn không được vượt quá 255 ký tự');
      return;
    }

    // Validate color code (hex format)
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(newLabelColor)) {
      toast.error('Mã màu phải là hex format hợp lệ (ví dụ: #ffffff hoặc #fff)');
      return;
    }

    createLabelMutation.mutate({
      name: newLabelName.trim(),
      colorCode: newLabelColor,
    });
  };

  const handleEditColor = (label: Label) => {
    setSelectedLabel(label);
    setEditColorValue(label.colorCode);
    setEditColorDialogOpen(true);
  };

  const handleDeleteLabel = (label: Label) => {
    setSelectedLabel(label);
    setDeleteDialogOpen(true);
  };

  const confirmUpdateColor = () => {
    // Validate color code (hex format)
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(editColorValue)) {
      toast.error('Mã màu phải là hex format hợp lệ (ví dụ: #ffffff hoặc #fff)');
      return;
    }

    if (selectedLabel) {
      updateColorMutation.mutate({
        id: selectedLabel.id,
        colorCode: editColorValue,
        lastUpdatedUtc: selectedLabel.lastUpdatedUtc,
      });
    }
  };

  const confirmDelete = () => {
    if (selectedLabel) {
      deleteLabelMutation.mutate(selectedLabel.id);
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
    <div className="space-y-4 px-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1" />
        <div className="flex w-1/4 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm kiếm nhãn..."
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
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#99b94a] hover:bg-[#7a8f3a]">
              <Plus className="mr-2 h-4 w-4" />
              Thêm Nhãn Mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-[#99b94a]">Tạo Nhãn Mới</DialogTitle>
              <DialogDescription>Nhập tên và chọn màu cho nhãn mới.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <div className="mb-3 flex h-6 items-center justify-between">
                  <UILabel htmlFor="name" className="text-[#99b94a]">
                    Tên Nhãn <span className="text-red-500">*</span>
                  </UILabel>
                  <span className="text-muted-foreground text-xs">{newLabelName.length}/100</span>
                </div>
                <Input
                  id="name"
                  type="text"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value.slice(0, 100))}
                  placeholder="Nhập tên nhãn..."
                  maxLength={100}
                />
              </div>
              <div>
                <UILabel htmlFor="color" className="mb-3 text-[#99b94a]">
                  Mã Màu <span className="text-red-500">*</span>
                </UILabel>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={newLabelColor}
                    onChange={(e) => setNewLabelColor(e.target.value)}
                    className="h-10 w-20 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={newLabelColor}
                    onChange={(e) => setNewLabelColor(e.target.value)}
                    placeholder="#99b94a"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button
                className="bg-[#99b94a] hover:bg-[#7a8f3a]"
                onClick={handleCreateLabel}
                disabled={!newLabelName.trim() || createLabelMutation.isPending}
              >
                {createLabelMutation.isPending ? 'Đang tạo...' : 'Tạo Nhãn'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="w-full overflow-hidden rounded-md border">
        {labelsData?.items?.length === 0 ? (
          <div className="flex h-24 items-center justify-center">
            {debouncedSearchTerm ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <Search className="size-8 text-gray-400" />
                <p className="text-gray-500">
                  Không tìm thấy nhãn nào với từ khóa &ldquo;{debouncedSearchTerm}&rdquo;
                </p>
              </div>
            ) : (
              <p className="text-gray-500">{isLoading ? 'Đang tải...' : 'Không có nhãn nào'}</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-2">
            {labelsData?.items?.map((label) => (
              <div
                key={label.id}
                className="flex items-center justify-between gap-3 border-r border-b px-4 py-3 transition-colors hover:bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3">
                    <div className="text-base font-bold text-gray-900">{label.name}</div>
                    <div
                      className="flex w-fit cursor-pointer items-center gap-2 rounded p-1 transition-opacity hover:opacity-75"
                      onClick={() => handleEditColor(label)}
                    >
                      <div
                        className="size-5 rounded border"
                        style={{ backgroundColor: label.colorCode }}
                        aria-label={`Color: ${label.colorCode}`}
                      />
                      <span className="font-mono text-xs">{label.colorCode}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditColor(label)}
                    title="Sửa màu"
                    className="h-8 w-8 p-0 text-[#99b94a] hover:bg-[#f0f5f2]"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLabel(label)}
                    title="Xóa"
                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search Results Info */}
      {labelsData && (
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="text-sm text-gray-500">
            {debouncedSearchTerm ? (
              <>
                Tìm thấy <span className="font-medium">{labelsData?.totalCount || 0}</span> kết quả
                cho &ldquo;{debouncedSearchTerm}&rdquo;
              </>
            ) : (
              <>
                Hiển thị <span className="font-medium">{labelsData.items.length}</span> trên tổng số{' '}
                <span className="font-medium">{labelsData.totalCount}</span> nhãn
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
      {labelsData && labelsData.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination pagination={convertToPaginationType(labelsData)} />
        </div>
      )}

      {/* Edit Color Dialog */}
      <Dialog open={editColorDialogOpen} onOpenChange={setEditColorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#99b94a]">Sửa Màu Nhãn</DialogTitle>
            <DialogDescription>
              Chọn màu mới cho nhãn &ldquo;{selectedLabel?.name}&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <UILabel htmlFor="edit-color" className="mb-3 text-[#99b94a]">
                Mã Màu <span className="text-red-500">*</span>
              </UILabel>
              <div className="flex gap-2">
                <Input
                  id="edit-color"
                  type="color"
                  value={editColorValue}
                  onChange={(e) => setEditColorValue(e.target.value)}
                  className="h-10 w-20 cursor-pointer"
                />
                <Input
                  type="text"
                  value={editColorValue}
                  onChange={(e) => setEditColorValue(e.target.value)}
                  placeholder="#99b94a"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditColorDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              className="bg-[#99b94a] hover:bg-[#7a8f3a]"
              onClick={confirmUpdateColor}
              disabled={updateColorMutation.isPending}
            >
              {updateColorMutation.isPending ? 'Đang cập nhật...' : 'Cập Nhật Màu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Label Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa Nhãn</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa nhãn &ldquo;{selectedLabel?.name}&rdquo;? Hành động này
              không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={deleteLabelMutation.isPending}
            >
              {deleteLabelMutation.isPending ? 'Đang xóa...' : 'Xóa Nhãn'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conflict Dialog */}
      <ConflictDialog
        open={conflictDialogOpen}
        onOpenChange={setConflictDialogOpen}
        description="Nhãn này đã được cập nhật bởi người khác. Vui lòng tải lại trang để xem thông tin mới nhất và thử lại."
        onReload={() => {
          queryClient.invalidateQueries({ queryKey: ['labels'] });
          window.location.reload();
        }}
      />
    </div>
  );
}
