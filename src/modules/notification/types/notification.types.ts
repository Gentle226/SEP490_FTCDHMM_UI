export enum NotificationType {
  System = 'SYSTEM',
  Comment = 'COMMENT',
  Reply = 'REPLY',
  Mention = 'MENTION',
  Like = 'LIKE',
  Follow = 'FOLLOW',
  NewRecipe = 'NEWRECIPE',
  LockRecipe = 'LOCKRECIPE',
  DeleteRecipe = 'DELETERECIPE',
  ApproveRecipe = 'APPROVERECIPE',
  RejectRecipe = 'REJECTRECIPE',
  Achievement = 'ACHIEVEMENT',
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
  userName?: string;
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
  recipeImageUrl?: string; // For system notifications about recipes
}

export interface NotificationListResponse {
  notifications: Notification[];
  unreadCount: number;
}
