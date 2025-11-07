export interface Comment {
  id: string;
  content: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  createdAtUtc: string;
  updatedAtUtc?: string;
  parentCommentId?: string | null;
  replies?: Comment[];
  userId?: string;
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: string | null;
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
