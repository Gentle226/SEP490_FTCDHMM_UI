'use client';

import { Button } from '@/base/components/ui/button';
import { ScrollArea } from '@/base/components/ui/scroll-area';

import { Notification } from '../types/notification.types';
import { NotificationItem } from './notification-item';

// Giao diện cho props của NotificationList
interface NotificationListProps {
  notifications: Notification[];
  isLoading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onNotificationClick?: () => void;
}

export const NotificationList = ({
  notifications,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
}: NotificationListProps) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground text-sm">Đang tải thông báo...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-2">
        <p className="text-muted-foreground text-sm">Chưa có thông báo</p>
        <p className="text-muted-foreground text-xs">
          Chúng tôi sẽ thông báo cho bạn khi có điều gì mới xảy ra
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header với nút Đánh dấu tất cả là đã đọc */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-medium">{unreadCount} thông báo chưa đọc</p>
          {onMarkAllAsRead && (
            <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
              Đánh dấu tất cả là đã đọc
            </Button>
          )}
        </div>
      )}

      {/* Danh sách thông báo */}
      <ScrollArea className="h-[400px]">
        <div className="divide-y">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onClick={onNotificationClick}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
