import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { UpdateRoleUserSchema, userService } from '..';

export function useUserMutations(options?: {
  onUpdateSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onRestoreSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  const updateUser = useMutation({
    mutationFn: (data: { id: string } & UpdateRoleUserSchema) => {
      const { id, role } = data;
      return userService.updateRoleUser(id)({ role });
    },
    onSuccess: () => {
      toast.success('Cập nhật vai trò thành công');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      options?.onUpdateSuccess?.();
    },
    onError: (error) => {
      toast.error('Có lỗi xảy ra khi cập nhật người dùng');
      console.error(error);
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => userService.softDeleteUser(id),
    onSuccess: () => {
      toast.success('Xóa người dùng thành công');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      options?.onDeleteSuccess?.();
    },
    onError: (error) => {
      toast.error('Có lỗi xảy ra khi xóa người dùng');
      console.error(error);
    },
  });
  const restoreUser = useMutation({
    mutationFn: (id: string) => userService.restoreUser(id),
    onSuccess: () => {
      toast.success('Khôi phục người dùng thành công');
      queryClient.invalidateQueries({ queryKey: ['deleted-users'] });
      options?.onRestoreSuccess?.();
    },
    onError: (error) => {
      toast.error('Có lỗi xảy ra khi khôi phục người dùng');
      console.error(error);
    },
  });

  return { updateUser, deleteUser, restoreUser };
}
