import { Notification } from '../types/notification.types';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7116').replace(
  /\/$/,
  '',
);

/**
 * NotificationService để quản lý thông báo
 * Sử dụng fetch API trực tiếp để kiểm soát tốt hơn việc xử lý request
 */
class NotificationService {
  private readonly TIMEOUT_MS = 60000; // 60 seconds timeout

  /**
   * Lấy tất cả thông báo của người dùng hiện tại
   */
  async getMyNotifications(
    token: string,
    pageNumber: number = 1,
    pageSize: number = 50,
  ): Promise<Notification[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

      const queryParams = new URLSearchParams({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
      });

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/myNotifications?${queryParams}`,
        {
          method: 'GET',
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
        throw new Error(`Lỗi khi lấy thông báo: ${response.statusText}`);
      }

      const data = await response.json();

      // Handle paginated response
      if (data && typeof data === 'object') {
        // If response has items property (paginated response)
        if ('items' in data && Array.isArray(data.items)) {
          return data.items;
        }
        // If response is already an array (backward compatibility)
        if (Array.isArray(data)) {
          return data;
        }
      }

      return [];
    } catch (err) {
      console.error('[NotificationService] Lỗi getMyNotifications:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack',
      });
      throw err;
    }
  }

  /**
   * Đánh dấu thông báo là đã đọc
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
        throw new Error(`Lỗi khi đánh dấu thông báo là đã đọc: ${response.statusText}`);
      }
    } catch (err) {
      console.error('[NotificationService] Lỗi markAsRead:', {
        notificationId,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack',
      });
      throw err;
    }
  }
}

export const notificationService = new NotificationService();
