'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/base/components/ui/button';
import { Checkbox } from '@/base/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/base/components/ui/dialog';
import { Label } from '@/base/components/ui/label';
import { ScrollArea } from '@/base/components/ui/scroll-area';

import {
  PermissionDomain,
  PermissionToggle,
  roleManagementService,
} from '../services/role-management.service';

interface EditPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId: string;
  roleName: string;
}

export function EditPermissionsDialog({
  open,
  onOpenChange,
  roleId,
  roleName,
}: EditPermissionsDialogProps) {
  const [permissions, setPermissions] = useState<Map<string, boolean>>(new Map());
  const queryClient = useQueryClient();

  // Fetch role permissions
  const { data: permissionsData, isLoading } = useQuery({
    queryKey: ['rolePermissions', roleId],
    queryFn: () => roleManagementService.getRolePermissions(roleId),
    enabled: open,
  });

  // Initialize permissions state when data is loaded
  useEffect(() => {
    if (permissionsData) {
      const permMap = new Map<string, boolean>();
      permissionsData.forEach((domain) => {
        domain.actions.forEach((action) => {
          permMap.set(action.actionId, action.isActive);
        });
      });
      setPermissions(permMap);
    }
  }, [permissionsData]);

  // Update permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: (permissionToggles: PermissionToggle[]) =>
      roleManagementService.updateRolePermissions(roleId, { permissions: permissionToggles }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['rolePermissions', roleId] });
      onOpenChange(false);
      toast.success('Quyền đã được cập nhật thành công.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể cập nhật quyền.');
    },
  });

  const handleTogglePermission = (actionId: string, isActive: boolean) => {
    setPermissions((prev) => new Map(prev).set(actionId, isActive));
  };

  const handleSave = () => {
    const permissionToggles: PermissionToggle[] = Array.from(permissions.entries()).map(
      ([actionId, isActive]) => ({
        permissionActionId: actionId,
        isActive,
      }),
    );
    updatePermissionsMutation.mutate(permissionToggles);
  };

  const getActionDisplayName = (actionName: string) => {
    const actionMap: Record<string, string> = {
      Create: 'Tạo',
      View: 'Xem',
      Update: 'Cập nhật',
      Delete: 'Xóa',
    };
    return actionMap[actionName] || actionName;
  };

  const getDomainDisplayName = (domainName: string) => {
    const domainMap: Record<string, string> = {
      ModeratorManagement: 'Quản lý Moderator',
      CustomerManagement: 'Quản lý Khách hàng',
    };
    return domainMap[domainName] || domainName;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chỉnh Sửa Quyền - {roleName}</DialogTitle>
          <DialogDescription>
            Chọn các quyền cho vai trò này. Thay đổi sẽ được áp dụng ngay lập tức.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          {isLoading ? (
            <div className="flex justify-center p-8">Đang tải...</div>
          ) : (
            <div className="space-y-6">
              {permissionsData?.map((domain) => (
                <div key={domain.domainName} className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {getDomainDisplayName(domain.domainName)}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 pl-4">
                    {domain.actions.map((action) => (
                      <div key={action.actionId} className="flex items-center space-x-2">
                        <Checkbox
                          id={action.actionId}
                          checked={permissions.get(action.actionId) || false}
                          onCheckedChange={(checked) =>
                            handleTogglePermission(action.actionId, checked === true)
                          }
                        />
                        <Label
                          htmlFor={action.actionId}
                          className="cursor-pointer text-sm font-normal"
                        >
                          {getActionDisplayName(action.actionName)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={updatePermissionsMutation.isPending}>
            {updatePermissionsMutation.isPending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
