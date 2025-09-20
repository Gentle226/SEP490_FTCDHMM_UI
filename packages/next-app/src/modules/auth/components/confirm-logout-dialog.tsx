'use client';

import { useMutation } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { ComponentProps } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/base/components/ui/alert-dialog';
import { buttonVariantsFn } from '@/base/components/ui/button';
import { RouteUtils } from '@/base/utils';

import { authService } from '../services/auth.service';

export function ConfirmLogoutDialog(props: ComponentProps<typeof AlertDialog>) {
  const pathname = usePathname();

  const { mutate: triggerLogout } = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      if (RouteUtils.isManagerRoute(pathname) || RouteUtils.isManagerRoute(pathname)) {
        window.location.href = '/';
      } else {
        window.location.reload();
      }
    },
  });

  return (
    <AlertDialog {...props}>
      <AlertDialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn đăng xuất hay không?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => triggerLogout()}
            className={buttonVariantsFn({ variant: 'danger' })}
          >
            Tiếp tục
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
