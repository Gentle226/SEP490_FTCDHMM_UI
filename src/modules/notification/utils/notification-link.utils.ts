import { NotificationType, NotificationTypeResponse } from '../types/notification.types';

/**
 * Tạo URL liên kết dựa trên loại thông báo và ID đích
 */
export const getNotificationLink = (type: NotificationTypeResponse, targetId?: string): string => {
  if (!targetId) {
    return '/';
  }

  const typeName = type?.name?.toUpperCase() ?? NotificationType.System;

  switch (typeName) {
    case NotificationType.Comment:
    case NotificationType.Reply:
    case NotificationType.Mention:
      // Liên kết đến trang chi tiết công thức
      // targetId là recipeId cho thông báo comment/reply/mention
      return `/recipe/${targetId}`;
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
      typeName === NotificationType.Mention)
  );
};
