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
 * Hook to manage notification state and operations
 * Handles fetching, real-time updates, and mark as read
 */
export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const { userId, autoFetch = true } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Connect to SignalR
  const connection = useNotificationSignalR(userId || null);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /**
   * Fetch all notifications
   */
  const fetchNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) {
      console.warn('[useNotifications] No token available, skipping fetch');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await notificationService.getMyNotifications(token);
      setNotifications(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch notifications');
      setError(error);
      console.error('[useNotifications] Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Mark a notification as read
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    const token = getToken();
    if (!token) {
      console.warn('[useNotifications] No token available for mark as read');
      return;
    }

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    );

    try {
      await notificationService.markAsRead(notificationId, token);
    } catch (err) {
      // Revert optimistic update on error
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: false } : n)),
      );
      console.error('[useNotifications] Error marking notification as read:', err);
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);

    // Mark all unread notifications
    await Promise.all(unreadNotifications.map((n) => markAsRead(n.id)));
  }, [notifications, markAsRead]);

  /**
   * Handle new notification from SignalR
   */
  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      // Check if notification already exists to prevent duplicates
      const exists = prev.some((n) => n.id === notification.id);
      if (exists) {
        return prev;
      }

      // Add new notification at the beginning
      return [notification, ...prev];
    });
  }, []);

  // Setup SignalR listeners
  useEffect(() => {
    if (!connection) {
      return;
    }

    // Listen for new notifications
    connection.on('ReceiveNotification', handleNewNotification);

    return () => {
      connection.off('ReceiveNotification', handleNewNotification);
    };
  }, [connection, handleNewNotification]);

  // Auto-fetch on mount
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
