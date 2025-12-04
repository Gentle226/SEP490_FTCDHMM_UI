'use client';

import { Button } from '@/base/components/ui/button';
import { ScrollArea } from '@/base/components/ui/scroll-area';

import { Notification } from '../types/notification.types';
import { NotificationItem } from './notification-item';

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
        <p className="text-muted-foreground text-sm">Loading notifications...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-2">
        <p className="text-muted-foreground text-sm">No notifications yet</p>
        <p className="text-muted-foreground text-xs">
          We&apos;ll notify you when something new happens
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header with Mark All as Read */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-medium">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
          {onMarkAllAsRead && (
            <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
      )}

      {/* Notification List */}
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
