'use client';

import { LogOut } from 'lucide-react';
import Link from 'next/link';

import { Role, User } from '@/modules/auth/types';
import { useProfile } from '@/modules/profile';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
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
  user: Pick<User, 'id' | 'fullName' | 'role' | 'firstName' | 'lastName' | 'email'> | undefined;
  onLogout?: () => void;
}

export function UserActions({ user, onLogout }: UserActionsProps) {
  const { data: profile } = useProfile();

  // Prioritize profile data over user data for names
  const firstName = profile?.firstName || user?.firstName;
  const lastName = profile?.lastName || user?.lastName;

  const displayName =
    (firstName && lastName ? `${firstName} ${lastName}` : null) || user?.fullName || user?.email;

  const avatarUrl =
    profile?.avatar ||
    (firstName && lastName
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}&background=random`
      : undefined);

  const initials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : (user?.email?.[0] || 'U').toUpperCase();

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 text-gray-500">
            <Avatar className="size-10">
              <AvatarImage src={avatarUrl} alt={displayName || 'User avatar'} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            {/* <span className="hidden sm:inline">{displayName}</span> */}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm leading-none font-medium">{displayName}</p>
                <p className="text-muted-foreground text-xs leading-none">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/profile">Bếp cá nhân</Link>
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
