'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Plus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
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
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const [page, setPage] = useState(currentPage);

  // Sync state with URL params
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

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
  const queryKey = ['roles', { page }];

  // Fetch roles
  const { data: rolesData, isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      const params: PaginationParams = { pageNumber: page, pageSize: 10 };
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
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể cập nhật trạng thái vai trò.');
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
              <DialogTitle>Tạo Vai Trò Mới</DialogTitle>
              <DialogDescription>
                Nhập tên cho vai trò mới. Bạn có thể cấu hình quyền sau khi tạo.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="mb-2" htmlFor="roleName">
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
                    />
                    <span className="w-8 text-sm text-gray-600">
                      {role.isActive ? 'Bật' : 'Tắt'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="w-36">
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
      {rolesData && rolesData.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination pagination={convertToPaginationType(rolesData)} />
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
  );
}
