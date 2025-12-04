export enum NotificationType {
  System = 'System',
  Comment = 'Comment',
  Reply = 'Reply',
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  email?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message?: string;
  targetId?: string;
  isRead: boolean;
  createdAtUtc: string;
  senders: UserResponse[];
}

export interface NotificationListResponse {
  notifications: Notification[];
  unreadCount: number;
}
