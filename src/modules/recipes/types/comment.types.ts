export interface MentionedUser {
  mentionedUserId: string;
  firstName: string;
  lastName: string;
  mentionedUserUserName: string;
  avatarUrl?: string;
}

export interface Comment {
  id: string;
  content: string;
  firstName: string;
  lastName: string;
  userUserName: string;
  avatarUrl?: string;
  createdAtUtc: string;
  updatedAtUtc?: string;
  isEdited?: boolean;
  parentCommentId?: string | null;
  replies?: Comment[];
  userId?: string;
  mentions?: MentionedUser[]; // New field for mentions
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
