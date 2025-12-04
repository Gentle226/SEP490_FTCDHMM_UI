'use client';

import { Bell, MessageCircle, Reply } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/base/components/ui/avatar';
import { cn } from '@/base/lib';

import { Notification, NotificationType } from '../types/notification.types';
import { getNotificationLink, isNotificationClickable } from '../utils/notification-link.utils';
import { formatNotificationMessage } from '../utils/notification-message.utils';
import { formatNotificationTime } from '../utils/notification-time.utils';

// Giao diện cho props của NotificationItem
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onClick?: () => void;
}

export const NotificationItem = ({
  notification,
  onMarkAsRead,
  onClick,
}: NotificationItemProps) => {
  const message = formatNotificationMessage(notification);
  const timeAgo = formatNotificationTime(notification.createdAtUtc);
  const link = getNotificationLink(notification.type, notification.targetId);
  const isClickable = isNotificationClickable(notification.type, notification.targetId);

  // Lấy biểu tượng dựa trên loại thông báo
  const getNotificationIcon = () => {
    const typeName = notification.type?.name?.toUpperCase() ?? NotificationType.System;
    switch (typeName) {
      case NotificationType.Comment:
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case NotificationType.Reply:
        return <Reply className="h-4 w-4 text-green-500" />;
      case NotificationType.System:
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    onClick?.();
  };

  const content = (
    <div
      className={cn(
        'hover:bg-accent flex gap-3 p-4 transition-colors',
        !notification.isRead && 'bg-blue-50/50 dark:bg-blue-950/20',
        isClickable && 'cursor-pointer',
      )}
      onClick={handleClick}
    >
      {/* Avatar của người gửi */}
      <div className="relative flex-shrink-0">
        {notification.senders.length > 0 ? (
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={notification.senders[0].avatarUrl} />
              <AvatarFallback>
                {notification.senders[0].firstName.charAt(0)}
                {notification.senders[0].lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {notification.senders.length > 1 && (
              <div className="bg-primary text-primary-foreground absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px]">
                +{notification.senders.length - 1}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
            {getNotificationIcon()}
          </div>
        )}
      </div>

      {/* Nội dung thông báo */}
      <div className="flex-1 space-y-1">
        <p className={cn('text-sm', !notification.isRead && 'font-medium')}>{message}</p>
        <p className="text-muted-foreground text-xs">{timeAgo}</p>
      </div>

      {/* Chỉ báo chưa đọc */}
      {!notification.isRead && (
        <div className="flex-shrink-0">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
        </div>
      )}
    </div>
  );

  if (isClickable) {
    return (
      <Link href={link} className="block">
        {content}
      </Link>
    );
  }

  return content;
};
