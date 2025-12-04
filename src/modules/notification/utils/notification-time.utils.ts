import { formatDistanceToNow } from 'date-fns';

/**
 * Format notification timestamp as relative time
 */
export const formatNotificationTime = (createdAtUtc: string): string => {
  try {
    const date = new Date(createdAtUtc);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'recently';
  }
};

/**
 * Format notification timestamp as full date
 */
export const formatNotificationDate = (createdAtUtc: string): string => {
  try {
    const date = new Date(createdAtUtc);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Unknown date';
  }
};
