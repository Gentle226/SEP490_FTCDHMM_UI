export enum NotificationType {
  System = 'SYSTEM',
  Comment = 'COMMENT',
  Reply = 'REPLY',
}

export interface NotificationTypeResponse {
  name: string;
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  email?: string;
}

// Giao diện cho thông báo
export interface Notification {
  id: string;
  type: NotificationTypeResponse;
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
