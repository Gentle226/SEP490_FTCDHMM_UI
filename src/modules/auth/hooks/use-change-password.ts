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
        // Handle API error response
        const message = error.response?.data?.message;
        if (message) {
          toast.error(message);
          return;
        }

        // Fallback for specific status codes
        if (error.response?.status === 400) {
          toast.error('Mật khẩu hiện tại không đúng!');
          return;
        }

        if (error.response?.status === 408) {
          toast.error('Mật khẩu mới không được trùng với mật khẩu cũ!');
          return;
        }

        if (error.response?.status === 404) {
          toast.error('Tài khoản không hợp lệ hoặc không tồn tại!');
          return;
        }
      }

      toast.error('Đổi mật khẩu thất bại! Vui lòng thử lại.');
    },
  });
}
