import { NotificationType } from '../types/notification.types';

/**
 * Generate a link URL based on notification type and target ID
 */
export const getNotificationLink = (type: NotificationType, targetId?: string): string => {
  if (!targetId) {
    return '/';
  }

  switch (type) {
    case NotificationType.Comment:
    case NotificationType.Reply:
      // Link to the recipe with the comment highlighted
      // The targetId is the commentId, we need to extract recipeId from context
      // For now, return a generic link - can be enhanced later
      return `/recipes?commentId=${targetId}`;
    case NotificationType.System:
    default:
      return '/';
  }
};

/**
 * Check if notification should be clickable
 */
export const isNotificationClickable = (type: NotificationType, targetId?: string): boolean => {
  return !!targetId && (type === NotificationType.Comment || type === NotificationType.Reply);
};
