import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

import { authService } from '../services/auth.service';
import { ChangePasswordSchema } from '../types';

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordSchema) => authService.changePassword(data),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công!');
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          toast.error('Mật khẩu hiện tại không đúng!');
          return;
        }
      }
    },
  });
}
