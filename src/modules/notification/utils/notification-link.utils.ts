import {
  Notification,
  NotificationType,
  NotificationTypeResponse,
} from '../types/notification.types';

/**
 * Tạo URL liên kết dựa trên loại thông báo và ID đích
 * Cho Follow notifications, sử dụng username của sender
 */
export const getNotificationLink = (
  type: NotificationTypeResponse,
  targetId?: string,
  notification?: Notification,
): string => {
  if (!targetId) {
    return '/';
  }

  const typeName = type?.name?.toUpperCase() ?? NotificationType.System;

  switch (typeName) {
    case NotificationType.Comment:
    case NotificationType.Reply:
    case NotificationType.Mention:
    case NotificationType.NewRecipe:
    case NotificationType.LockRecipe:
    case NotificationType.DeleteRecipe:
    case NotificationType.ApproveRecipe:
    case NotificationType.RejectRecipe:
      return `/recipe/${targetId}`;
    case NotificationType.Follow:
      // Use username from sender for profile link
      if (notification?.senders?.[0]?.userName) {
        return `/profile/${notification.senders[0].userName}`;
      }
      return `/profile/${targetId}`;
    case NotificationType.Like:
    case NotificationType.System:
    default:
      return '/';
  }
};

/**
 * Kiểm tra xem thông báo có nên bấm được không
 */
export const isNotificationClickable = (
  type: NotificationTypeResponse,
  targetId?: string,
): boolean => {
  const typeName = type?.name?.toUpperCase() ?? NotificationType.System;
  return (
    !!targetId &&
    (typeName === NotificationType.Comment ||
      typeName === NotificationType.Reply ||
      typeName === NotificationType.Mention ||
      typeName === NotificationType.NewRecipe ||
      typeName === NotificationType.LockRecipe ||
      typeName === NotificationType.DeleteRecipe ||
      typeName === NotificationType.ApproveRecipe ||
      typeName === NotificationType.RejectRecipe ||
      typeName === NotificationType.Follow)
  );
};
