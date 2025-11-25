'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Key } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

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
import { ChangePasswordSchema, changePasswordSchema, useChangePassword } from '@/modules/auth';

interface ChangePasswordDialogProps {
  trigger?: React.ReactNode;
}

export function ChangePasswordDialog({ trigger }: ChangePasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const changePasswordMutation = useChangePassword();

  const form = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      rePassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordSchema) => {
    try {
      await changePasswordMutation.mutateAsync(data);
      form.reset();
      setOpen(false);
    } catch (_error) {
      // Error is handled by the mutation
    }
  };

  const handleClose = () => {
    form.reset();
    setOpen(false);
  };

  const defaultTrigger = (
    <Button variant="outline" className="flex items-center gap-2 text-[#99b94a]">
      <Key className="size-4" />
      Đổi mật khẩu
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-[#99b94a]">
          <DialogTitle className="flex items-center gap-2">
            <Key className="size-5" />
            Đổi mật khẩu
          </DialogTitle>
          <DialogDescription>
            Nhập mật khẩu hiện tại và mật khẩu mới để thay đổi mật khẩu của bạn.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label className="text-[#99b94a]" htmlFor="currentPassword">
              Mật khẩu hiện tại <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu hiện tại"
                {...form.register('currentPassword')}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="size-4 text-gray-400" />
                ) : (
                  <Eye className="size-4 text-gray-400" />
                )}
              </button>
            </div>
            {form.formState.errors.currentPassword && (
              <p className="text-sm text-red-600">
                {form.formState.errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label className="text-[#99b94a]" htmlFor="newPassword">
              Mật khẩu mới <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu mới"
                {...form.register('newPassword')}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="size-4 text-gray-400" />
                ) : (
                  <Eye className="size-4 text-gray-400" />
                )}
              </button>
            </div>
            {form.formState.errors.newPassword && (
              <p className="text-sm text-red-600">{form.formState.errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label className="text-[#99b94a]" htmlFor="rePassword">
              Xác nhận mật khẩu mới <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="rePassword"
                type={showRePassword ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu mới"
                {...form.register('rePassword')}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowRePassword(!showRePassword)}
              >
                {showRePassword ? (
                  <EyeOff className="size-4 text-gray-400" />
                ) : (
                  <Eye className="size-4 text-gray-400" />
                )}
              </button>
            </div>
            {form.formState.errors.rePassword && (
              <p className="text-sm text-red-600">{form.formState.errors.rePassword.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              className="bg-[#99b94a] hover:bg-[#88a43a]"
              type="submit"
              loading={changePasswordMutation.isPending}
            >
              Đổi mật khẩu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
