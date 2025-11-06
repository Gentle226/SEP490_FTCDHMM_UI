'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/base/components/ui/accordion';
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

import { PermissionToggle, roleManagementService } from '../services/role-management.service';

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
      ModeratorManagement: 'Quản lý Kiểm duyệt viên',
      CustomerManagement: 'Quản lý Khách hàng',
      Label: 'Quản lý Nhãn món ăn',
      IngredientCategory: 'Quản lý Nhóm nguyên liệu',
      Ingredient: 'Quản lý Nguyên liệu',
      Recipe: 'Quản lý Công thức',
      Nutrient: 'Quản lý Chất dinh dưỡng',
      HealthGoal: 'Quản lý Mục tiêu sức khỏe',
      Rating: 'Quản lý Đánh giá',
      Comment: 'Quản lý Bình luận',
    };
    return domainMap[domainName] || domainName;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <style>{`
        [data-permissions-checkbox][data-state="checked"] {
          background-color: #99b94a;
          border-color: #99b94a;
        }
        [data-permissions-checkbox][data-state="checked"] svg {
          color: white;
        }
      `}</style>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#99b94a]">Chỉnh Sửa Quyền - {roleName}</DialogTitle>
          <DialogDescription>
            Chọn các quyền cho vai trò này. Thay đổi sẽ được áp dụng sau khi người dùng đăng nhập
            lại.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          {isLoading ? (
            <div className="flex justify-center p-8">Đang tải...</div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {permissionsData?.map((domain) => (
                <AccordionItem key={domain.domainName} value={domain.domainName}>
                  <AccordionTrigger className="text-sm font-semibold text-[#57701a]">
                    {getDomainDisplayName(domain.domainName)}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-3 pl-4">
                      {domain.actions.map((action) => (
                        <div key={action.actionId} className="flex items-center space-x-2">
                          <Checkbox
                            id={action.actionId}
                            checked={permissions.get(action.actionId) || false}
                            onCheckedChange={(checked) =>
                              handleTogglePermission(action.actionId, checked === true)
                            }
                            data-permissions-checkbox
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
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" className="text-[#99b94a]" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            className="bg-[#99b94a]"
            onClick={handleSave}
            disabled={updatePermissionsMutation.isPending}
          >
            {updatePermissionsMutation.isPending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
