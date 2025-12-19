'use client';

import { useCallback, useEffect, useState } from 'react';

import { getToken } from '@/base/lib/get-token.lib';

import { notificationService } from '../services/notification.service';
import { Notification } from '../types/notification.types';
import { useNotificationSignalR } from './use-notification-signalr';

interface UseNotificationsOptions {
  userId?: string | null;
  autoFetch?: boolean;
}

/**
 * Hook để quản lý trạng thái thông báo và các hoạt động
 * Xử lý tìm nạp, cập nhật thời gian thực và đánh dấu đã đọc
 */
export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const { userId, autoFetch = true } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Kết nối đến SignalR
  const connection = useNotificationSignalR(userId || null);

  // Tính số thông báo chưa đọc
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /**
   * Tìm nạp tất cả thông báo
   */
  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await notificationService.getMyNotifications(token);

      if (!Array.isArray(data)) {
        throw new Error('Invalid notifications response format');
      }

      setNotifications(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Lỗi khi tìm nạp thông báo');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Đánh dấu thông báo là đã đọc
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    const token = getToken();
    if (!token) {
      console.warn('[useNotifications] Không có token sẵn để đánh dấu đã đọc');
      return;
    }

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    );

    try {
      await notificationService.markAsRead(notificationId, token);
    } catch (err) {
      // Hoàn nguyên cập nhật lạc quan nếu có lỗi
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: false } : n)),
      );
      console.error('[useNotifications] Lỗi khi đánh dấu thông báo là đã đọc:', err);
    }
  }, []);

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);

    // Mark all unread notifications
    await Promise.all(unreadNotifications.map((n) => markAsRead(n.id)));
  }, [notifications, markAsRead]);

  /**
   * Xử lý thông báo mới từ SignalR
   * Backend chỉ gửi tín hiệu "notification_created", không gửi object
   * Khi nhận được tín hiệu, refetch toàn bộ danh sách từ API
   */
  const handleNewNotification = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /**
   * Xử lý sự kiện đánh dấu đã đọc từ SignalR
   * Cập nhật UI khi người dùng đánh dấu thông báo là đã đọc từ thiết bị khác
   */
  const handleNotificationRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    );
  }, []);

  // Setup SignalR listeners
  useEffect(() => {
    if (!connection) {
      return;
    }

    // Lắng nghe thông báo mới - backend gửi string "notification_created"
    connection.on('NOTIFICATION', handleNewNotification);

    // Lắng nghe sự kiện đánh dấu đã đọc
    connection.on('READNOTIFICATION', handleNotificationRead);

    return () => {
      connection.off('NOTIFICATION', handleNewNotification);
      connection.off('READNOTIFICATION', handleNotificationRead);
    };
  }, [connection, handleNewNotification, handleNotificationRead]);

  // Tự động tìm nạp khi mount
  useEffect(() => {
    if (autoFetch && userId) {
      fetchNotifications();
    }
  }, [autoFetch, userId, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
};
