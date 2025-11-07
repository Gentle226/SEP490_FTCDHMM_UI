'use client';

import { useCallback, useEffect, useState } from 'react';

import { commentService } from '../services/comment.service';
import { Comment, CommentDeletedData, CreateCommentRequest } from '../types/comment.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useCommentManager = (recipeId: string, connection: any | null) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments on mount with abort support
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      try {
        console.warn(`[CommentManager] Fetching comments for recipe: ${recipeId}`);
        const data = await commentService.getComments(recipeId);

        if (!isMounted) {
          console.warn('[CommentManager] Component unmounted, skipping state update');
          return;
        }

        setComments(data);
        console.warn(`[CommentManager] Successfully loaded ${data.length} comments`);
      } catch (err) {
        if (abortController.signal.aborted) {
          console.warn('[CommentManager] Fetch aborted');
          return;
        }

        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch comments';
        setError(errorMessage);
        console.error('[CommentManager] Error fetching comments:', {
          message: errorMessage,
          stack: err instanceof Error ? err.stack : 'No stack trace',
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchComments();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [recipeId]); // Handle real-time comment deletion
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

  // Helper function to find a comment by ID in the tree
  const findCommentInTree = useCallback((commentList: Comment[], commentId: string): boolean => {
    for (const comment of commentList) {
      if (comment.id === commentId) return true;
      if (comment.replies && comment.replies.length > 0) {
        if (findCommentInTree(comment.replies, commentId)) return true;
      }
    }
    return false;
  }, []);

  // Helper function to add comment to correct place in tree (with deduplication)
  const addCommentToTree = useCallback(
    (
      commentList: Comment[],
      newComment: Comment,
      skipDuplicateCheck: boolean = false,
    ): Comment[] => {
      // Check if comment already exists (to prevent duplicates from optimistic + SignalR)
      if (!skipDuplicateCheck) {
        const commentExists = findCommentInTree(commentList, newComment.id);
        if (commentExists) {
          console.warn('[CommentManager] Comment already exists, skipping:', newComment.id);
          return commentList;
        }
      }

      // If it's a top-level comment (no parent)
      if (!newComment.parentCommentId) {
        console.warn('[CommentManager] Adding top-level comment:', newComment.id);
        return [...commentList, newComment];
      }

      // It's a reply - find the parent and add to its replies
      return commentList.map((comment) => {
        if (comment.id === newComment.parentCommentId) {
          console.warn('[CommentManager] Adding reply to parent:', newComment.parentCommentId);
          return {
            ...comment,
            replies: comment.replies ? [...comment.replies, newComment] : [newComment],
          };
        }

        // Recursively search in nested replies
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: addCommentToTree(comment.replies, newComment, skipDuplicateCheck),
          };
        }

        return comment;
      });
    },
    [findCommentInTree],
  );

  // Handle real-time comment creation
  const addNewComment = useCallback(
    (newComment: Comment) => {
      setComments((prev) => addCommentToTree(prev, newComment));
    },
    [addCommentToTree],
  );

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

        // Optimistic update: immediately add to UI (don't wait for SignalR)
        console.warn('[CommentManager] Optimistic update - adding comment:', newComment.id);
        setComments((prev) => addCommentToTree(prev, newComment));

        return newComment;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create comment';
        setError(errorMessage);
        throw err;
      }
    },
    [recipeId, addCommentToTree],
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
