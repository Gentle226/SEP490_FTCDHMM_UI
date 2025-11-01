'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Edit, Plus } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Pagination } from '@/base/components/layout/pagination';
import { Badge } from '@/base/components/ui/badge';
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
import { Label } from '@/base/components/ui/label';
import { Switch } from '@/base/components/ui/switch';
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
  CreateRoleRequest,
  PaginationParams,
  Role,
  roleManagementService,
} from '../services/role-management.service';
import { EditPermissionsDialog } from './edit-permissions-dialog';

export function PermissionManagementTable() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentPageSize = parseInt(searchParams.get('pageSize') || '10', 10);

  const [page, setPage] = useState(currentPage);
  const [pageSize, setPageSize] = useState(currentPageSize);

  // Sync state with URL params
  useEffect(() => {
    setPage(currentPage);
    setPageSize(currentPageSize);
  }, [currentPage, currentPageSize]);

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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editPermissionsDialogOpen, setEditPermissionsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState('');

  const queryClient = useQueryClient();
  const queryKey = ['roles', { page, pageSize }];

  // Fetch roles
  const { data: rolesData, isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      const params: PaginationParams = { pageNumber: page, pageSize: pageSize };
      return roleManagementService.getRoles(params);
    },
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: (request: CreateRoleRequest) => roleManagementService.createRole(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setCreateDialogOpen(false);
      setNewRoleName('');
      toast.success('Vai trò đã được tạo thành công.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể tạo vai trò.');
    },
  });

  const getErrorMessage = (error: Error, isDeactivating: boolean): string => {
    const errorMessage = error.message;

    // Check for INVALID_ACTION error code from backend
    if (errorMessage.includes('INVALID_ACTION')) {
      if (isDeactivating) {
        return 'Không thể vô hiệu hóa vai trò này vì có người dùng đang sử dụng nó. Vui lòng chuyển tất cả người dùng sang vai trò khác trước khi vô hiệu hóa.';
      }
      return 'Không thể thực hiện hành động này. Vai trò có thể đã ở trạng thái này rồi.';
    }

    return errorMessage || 'Không thể cập nhật trạng thái vai trò.';
  };

  // Toggle role active status mutation
  const toggleRoleActiveMutation = useMutation({
    mutationFn: ({ roleId, isActive }: { roleId: string; isActive: boolean }) => {
      return isActive
        ? roleManagementService.deactiveRole(roleId)
        : roleManagementService.activeRole(roleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Trạng thái vai trò đã được cập nhật.');
    },
    onError: (error: Error, variables) => {
      const isDeactivating = variables.isActive;
      const message = getErrorMessage(error, isDeactivating);
      toast.error(message);
    },
  });

  const handleCreateRole = () => {
    if (newRoleName.trim()) {
      createRoleMutation.mutate({
        name: newRoleName.trim(),
      });
    }
  };

  const handleToggleActive = (role: Role) => {
    toggleRoleActiveMutation.mutate({
      roleId: role.id,
      isActive: role.isActive,
    });
  };

  const handleEditPermissions = (role: Role) => {
    setSelectedRole(role);
    setEditPermissionsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Đang tải...</div>;
  }

  return (
    <>
      <style>{`
        [data-permissions-switch][data-state="checked"] {
          background-color: #99b94a;
        }
        [data-permissions-switch][data-state="unchecked"] {
          background-color: #f0f0f0;
        }
        [data-permissions-switch][data-state="checked"] [data-slot="switch-thumb"] {
          background-color: white;
        }
        [data-permissions-switch][data-state="unchecked"] [data-slot="switch-thumb"] {
          background-color: #99b94a;
        }
      `}</style>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-[#99b94a]">Quản Lý Phân Quyền</h2>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#99b94a] hover:bg-[#7a8f3a]">
                <Plus className="mr-2 h-4 w-4" />
                Tạo Vai Trò
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-[#99b94a]">Tạo Vai Trò Mới</DialogTitle>
                <DialogDescription>
                  Nhập tên cho vai trò mới. Bạn có thể cấu hình quyền sau khi tạo.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 text-[#99b94a]" htmlFor="roleName">
                    Tên Vai Trò
                  </Label>
                  <Input
                    id="roleName"
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Nhập tên vai trò"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button
                  className="bg-[#99b94a]"
                  onClick={handleCreateRole}
                  disabled={!newRoleName.trim() || createRoleMutation.isPending}
                >
                  {createRoleMutation.isPending ? 'Đang tạo...' : 'Tạo Vai Trò'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-36 pl-6">Vai Trò</TableHead>
                <TableHead className="w-36">Trạng Thái</TableHead>
                <TableHead className="w-36">Hành Động</TableHead>
                <TableHead className="w-36">Quyền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rolesData?.items?.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="w-36 pl-6 font-medium">{role.name}</TableCell>
                  <TableCell className="w-36">
                    {role.isActive ? (
                      <Badge className="w-32 justify-center bg-[#99b94a]">Hoạt động</Badge>
                    ) : (
                      <Badge variant="danger" className="w-32 justify-center">
                        Không hoạt động
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="w-36">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={role.isActive}
                        onCheckedChange={() => handleToggleActive(role)}
                        disabled={toggleRoleActiveMutation.isPending}
                        data-permissions-switch
                      />
                      <span className="w-8 text-sm text-gray-600">
                        {role.isActive ? 'Bật' : 'Tắt'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="w-36 text-[#99b94a]">
                    <Button variant="outline" size="sm" onClick={() => handleEditPermissions(role)}>
                      <Edit className="mr-1 h-3 w-3" />
                      Chỉnh Sửa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {rolesData && (
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="text-sm text-gray-500">
              Hiển thị <span className="font-medium">{rolesData.items.length}</span> trên tổng số{' '}
              <span className="font-medium">{rolesData.totalCount}</span> vai trò
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

            {/* Pagination */}
            {rolesData.totalPages > 1 && (
              <Pagination pagination={convertToPaginationType(rolesData)} />
            )}
          </div>
        )}

        {/* Edit Permissions Dialog */}
        {selectedRole && (
          <EditPermissionsDialog
            open={editPermissionsDialogOpen}
            onOpenChange={setEditPermissionsDialogOpen}
            roleId={selectedRole.id}
            roleName={selectedRole.name}
          />
        )}
      </div>
    </>
  );
}
