import { Notification } from '../types/notification.types';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7116').replace(
  /\/$/,
  '',
);

/**
 * NotificationService for managing notifications
 * Uses fetch API directly for better control over request handling
 */
class NotificationService {
  private readonly TIMEOUT_MS = 60000; // 60 seconds timeout

  /**
   * Get all notifications for the current user
   */
  async getMyNotifications(token: string): Promise<Notification[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

      const response = await fetch(`${API_BASE_URL}/api/notifications/myNotifications`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('[NotificationService] getMyNotifications error:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack',
      });
      throw err;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string, token: string): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${notificationId}/mark-read`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.statusText}`);
      }
    } catch (err) {
      console.error('[NotificationService] markAsRead error:', {
        notificationId,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack',
      });
      throw err;
    }
  }
}

export const notificationService = new NotificationService();
