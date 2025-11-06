'use client';

import { useCallback, useEffect, useState } from 'react';

import { commentService } from '../services/comment.service';
import { Comment, CommentDeletedData, CreateCommentRequest } from '../types/comment.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useCommentManager = (recipeId: string, connection: any | null) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments on mount
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await commentService.getComments(recipeId);
        setComments(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch comments';
        setError(errorMessage);
        console.error('Error fetching comments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [recipeId]);

  // Handle real-time comment deletion
  const removeDeletedComment = useCallback(
    (commentList: Comment[], deletedCommentId: string): Comment[] => {
      return commentList
        .filter((comment) => comment.id !== deletedCommentId)
        .map((comment) => ({
          ...comment,
          replies: comment.replies
            ? removeDeletedComment(comment.replies, deletedCommentId)
            : undefined,
        }));
    },
    [],
  );

  // Handle real-time comment creation
  const addNewComment = useCallback((newComment: Comment) => {
    setComments((prev) => {
      // If it's a top-level comment
      if (!newComment.replies || newComment.replies.length === 0) {
        return [...prev, newComment];
      }
      return prev;
    });
  }, []);

  // Setup real-time event listeners
  useEffect(() => {
    if (!connection) return;

    // Handle new comment event
    connection.on('ReceiveComment', (newComment: Comment) => {
      addNewComment(newComment);
    });

    // Handle deleted comment event
    connection.on('CommentDeleted', (data: CommentDeletedData) => {
      setComments((prev) => removeDeletedComment(prev, data.commentId));
    });

    // Cleanup listeners on unmount
    return () => {
      connection.off('ReceiveComment');
      connection.off('CommentDeleted');
    };
  }, [connection, addNewComment, removeDeletedComment]);

  // Create comment
  const createComment = useCallback(
    async (request: CreateCommentRequest, token: string): Promise<Comment> => {
      try {
        const newComment = await commentService.createComment(recipeId, request, token);
        // Don't manually add - let SignalR handle it for real-time sync
        return newComment;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create comment';
        setError(errorMessage);
        throw err;
      }
    },
    [recipeId],
  );

  // Delete comment (own comment)
  const deleteComment = useCallback(
    async (commentId: string, token: string): Promise<void> => {
      try {
        await commentService.deleteComment(recipeId, commentId, token);
        // Don't manually remove - let SignalR handle it for real-time sync
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete comment';
        setError(errorMessage);
        throw err;
      }
    },
    [recipeId],
  );

  // Delete comment as recipe author
  const deleteCommentAsAuthor = useCallback(
    async (commentId: string, token: string): Promise<void> => {
      try {
        await commentService.deleteCommentAsAuthor(recipeId, commentId, token);
        // Don't manually remove - let SignalR handle it for real-time sync
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete comment';
        setError(errorMessage);
        throw err;
      }
    },
    [recipeId],
  );

  // Delete comment as admin/moderator
  const deleteCommentAsAdmin = useCallback(
    async (commentId: string, token: string): Promise<void> => {
      try {
        await commentService.deleteCommentAsAdmin(recipeId, commentId, token);
        // Don't manually remove - let SignalR handle it for real-time sync
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete comment';
        setError(errorMessage);
        throw err;
      }
    },
    [recipeId],
  );

  return {
    comments,
    loading,
    error,
    createComment,
    deleteComment,
    deleteCommentAsAuthor,
    deleteCommentAsAdmin,
  };
};
