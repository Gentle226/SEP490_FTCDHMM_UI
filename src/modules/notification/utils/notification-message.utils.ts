import { Notification, NotificationType } from '../types/notification.types';

/**
 * Format notification message based on type and senders
 */
export const formatNotificationMessage = (notification: Notification): string => {
  const { type, senders, message } = notification;
  const senderCount = senders.length;

  // If custom message exists (for System notifications), use it
  if (type === NotificationType.System && message) {
    return message;
  }

  // No senders, use default message
  if (senderCount === 0) {
    return message || 'You have a new notification';
  }

  // Format sender names
  const firstName = senders[0]?.firstName || 'Someone';
  const lastName = senders[0]?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();

  // Single sender
  if (senderCount === 1) {
    switch (type) {
      case NotificationType.Comment:
        return `${fullName} commented on your recipe`;
      case NotificationType.Reply:
        return `${fullName} replied to your comment`;
      default:
        return message || `${fullName} interacted with your content`;
    }
  }

  // Multiple senders
  const othersCount = senderCount - 1;
  const othersText = othersCount === 1 ? '1 other' : `${othersCount} others`;

  switch (type) {
    case NotificationType.Comment:
      return `${fullName} and ${othersText} commented on your recipe`;
    case NotificationType.Reply:
      return `${fullName} and ${othersText} replied to your comment`;
    default:
      return message || `${fullName} and ${othersText} interacted with your content`;
  }
};

/**
 * Get a short summary of sender names
 */
export const getSendersSummary = (notification: Notification): string => {
  const { senders } = notification;
  const senderCount = senders.length;

  if (senderCount === 0) {
    return 'Unknown';
  }

  if (senderCount === 1) {
    return `${senders[0].firstName} ${senders[0].lastName}`.trim();
  }

  const firstName = senders[0]?.firstName || 'Someone';
  const othersCount = senderCount - 1;
  return `${firstName} and ${othersCount} ${othersCount === 1 ? 'other' : 'others'}`;
};
