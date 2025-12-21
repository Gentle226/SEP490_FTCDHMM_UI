export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  userName?: string;
  avatarUrl?: string;
}

export interface MentionedUser {
  commentId: string; // Added in backend commit 498d540
  mentionedUserId: string;
  firstName: string;
  lastName: string;
  mentionedUserName?: string;
  avatarUrl?: string;
}

export interface Comment {
  id: string;
  content: string;
  user: UserInfo;
  createdAtUtc: string;
  updatedAtUtc?: string;
  isEdited?: boolean;
  parentCommentId?: string | null;
  replies?: Comment[];
  userId?: string;
  mentions?: MentionedUser[];
}

export interface CreateCommentRequest {
  content: string; // Max 2048 characters
  parentCommentId?: string | null;
  mentionedUserIds?: string[]; // New field for mentions
}

export interface UpdateCommentRequest {
  content: string; // Max 2048 characters
  mentionedUserIds?: string[]; // New field for mentions
}

export interface DeletedCommentEvent {
  commentId: string;
  recipeId: string;
  deletedAt: string;
}

export interface CommentDeletedData {
  commentId: string;
  recipeId: string;
  deletedAt: string;
}
