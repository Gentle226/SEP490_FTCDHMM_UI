'use client';

import { Bell } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/base/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/base/components/ui/dropdown-menu';
import { cn } from '@/base/lib';

import { useNotifications } from '../hooks/use-notifications';
import { NotificationList } from './notification-list';

// Giao diện cho props của NotificationBell
interface NotificationBellProps {
  userId?: string | null;
  className?: string;
}

export const NotificationBell = ({ userId, className }: NotificationBellProps) => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications({
    userId,
    autoFetch: true,
  });

  const [open, setOpen] = useState(false);

  // Xử lý thay đổi trạng thái mở/đóng
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  // Đóng dropdown khi nhấp vào thông báo
  const handleNotificationClick = () => {
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn('relative', className)}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Thông báo</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        <div className="border-b px-4 py-3">
          <h3 className="font-semibold">Thông báo</h3>
        </div>
        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onNotificationClick={handleNotificationClick}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
