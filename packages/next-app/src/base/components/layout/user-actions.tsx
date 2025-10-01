'use client';

import { LogOut, UserIcon } from 'lucide-react';
import Link from 'next/link';

import { Role, User } from '@/modules/auth/types';

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
  user: Pick<User, 'id' | 'fullName' | 'role' | 'firstName' | 'lastName'> | undefined;
  onLogout?: () => void;
}

export function UserActions({ user, onLogout }: UserActionsProps) {
  const displayName =
    user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.id;

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="text-gray-500">
            {displayName}
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
              {(user?.role === Role.ADMIN || user?.role === Role.MODERATOR) && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard">Bảng điều khiển</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="danger" onClick={onLogout}>
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
