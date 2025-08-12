'use client';

import { LogOut, UserIcon } from 'lucide-react';
import Link from 'next/link';

import { Role, useConfirmLogoutDialog } from '@/modules/auth';
import { User } from '@/modules/users';

import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface UserActionsProps {
  user: Pick<User, 'id' | 'fullName' | 'role' | 'gender'> | undefined;
}

export function UserActions({ user }: UserActionsProps) {
  const { setOpen } = useConfirmLogoutDialog();

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="text-gray-500">
            {user.fullName}
            <UserIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <>
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/profile">Thông tin cá nhân</Link>
              </DropdownMenuItem>
              {(user?.role === Role.ADMIN || user?.role === Role.HOTEL_OWNER) && (
                <DropdownMenuItem asChild>
                  <Link href="/manager/dashboard">Bảng điều khiển</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/history-booking">Lịch sử đặt phòng</Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="danger" onClick={() => setOpen(true)}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Link href="/auth/login">
        <Button variant="ghost" size="lg">
          Đăng nhập
        </Button>
      </Link>
      <Link href="/auth/register">
        <Button variant="outline" size="lg">
          Tạo tài khoản
        </Button>
      </Link>
    </>
  );
}
