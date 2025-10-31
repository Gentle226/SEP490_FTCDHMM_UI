'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, MoreHorizontal, Plus, Search, Trash, X } from 'lucide-react';
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
  CreateLabelRequest,
  Label,
  PaginationParams,
  labelManagementService,
} from '../services/label-management.service';

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

  const [page, setPage] = useState(currentPage);
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);

  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#99b94a');
  const [editLabelColor, setEditLabelColor] = useState('#99b94a');

  const queryClient = useQueryClient();
  const queryKey = ['labels', { page, search: debouncedSearchTerm }];

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

  // Fetch labels
  const { data: labelsData, isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      const params: PaginationParams = {
        pageNumber: page,
        pageSize: 10,
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
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể tạo nhãn.');
    },
  });

  // Update label color mutation
  const updateColorMutation = useMutation({
    mutationFn: ({ id, colorCode }: { id: string; colorCode: string }) =>
      labelManagementService.updateColorCode(id, { colorCode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] });
      setEditDialogOpen(false);
      setSelectedLabel(null);
      toast.success('Màu nhãn đã được cập nhật thành công.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể cập nhật màu nhãn.');
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

  const handleCreateLabel = () => {
    if (newLabelName.trim()) {
      createLabelMutation.mutate({
        name: newLabelName.trim(),
        colorCode: newLabelColor,
      });
    }
  };

  const handleEditLabel = (label: Label) => {
    setSelectedLabel(label);
    setEditLabelColor(label.colorCode);
    setEditDialogOpen(true);
  };

  const handleDeleteLabel = (label: Label) => {
    setSelectedLabel(label);
    setDeleteDialogOpen(true);
  };

  const confirmUpdateColor = () => {
    if (selectedLabel) {
      updateColorMutation.mutate({
        id: selectedLabel.id,
        colorCode: editLabelColor,
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[#99b94a]">Quản Lý Nhãn Món Ăn</h2>
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
                <UILabel htmlFor="name" className="mb-3 text-[#99b94a]">
                  Tên Nhãn
                </UILabel>
                <Input
                  id="name"
                  type="text"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="Nhập tên nhãn..."
                />
              </div>
              <div>
                <UILabel htmlFor="color" className="mb-3 text-[#99b94a]">
                  Mã Màu
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

      {/* Search Bar */}
      <div className="flex w-full justify-end">
        <div className="flex w-1/4 items-center space-x-2">
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
      </div>
      <div className="w-full rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[45%] pl-12">Tên</TableHead>
              <TableHead className="w-[45%]">Mã Màu</TableHead>
              <TableHead className="w-[10%]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {labelsData?.items?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  {debouncedSearchTerm ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Search className="size-8 text-gray-400" />
                      <p className="text-gray-500">
                        Không tìm thấy nhãn nào với từ khóa &ldquo;{debouncedSearchTerm}&rdquo;
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      {isLoading ? 'Đang tải...' : 'Không có nhãn nào'}
                    </p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              labelsData?.items?.map((label) => (
                <TableRow key={label.id}>
                  <TableCell className="pl-12 font-medium">{label.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="size-6 rounded border"
                        style={{ backgroundColor: label.colorCode } as React.CSSProperties}
                        aria-label={`Color: ${label.colorCode}`}
                      />
                      <span className="font-mono text-sm">{label.colorCode}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditLabel(label)}>
                          <Edit className="mr-2 h-4 w-4 text-[#99b94a]" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteLabel(label)}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4 text-red-600" />
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
      {labelsData && (
        <div className="flex items-center justify-between">
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
        </div>
      )}

      {/* Pagination */}
      {labelsData && labelsData.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination pagination={convertToPaginationType(labelsData)} />
        </div>
      )}

      {/* Edit Label Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Màu Nhãn</DialogTitle>
            <DialogDescription>
              Cập nhật màu cho nhãn &ldquo;{selectedLabel?.name}&rdquo;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <UILabel htmlFor="edit-color" className="mb-3">
                Mã Màu
              </UILabel>
              <div className="flex gap-2">
                <Input
                  id="edit-color"
                  type="color"
                  value={editLabelColor}
                  onChange={(e) => setEditLabelColor(e.target.value)}
                  className="h-10 w-20 cursor-pointer"
                />
                <Input
                  type="text"
                  value={editLabelColor}
                  onChange={(e) => setEditLabelColor(e.target.value)}
                  placeholder="#99b94a"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={confirmUpdateColor}
              disabled={updateColorMutation.isPending}
              className="bg-[#99b94a] hover:bg-[#7a8f3a]"
            >
              {updateColorMutation.isPending ? 'Đang cập nhật...' : 'Cập Nhật'}
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
    </div>
  );
}
