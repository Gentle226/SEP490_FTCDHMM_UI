import { Comment } from '../types/comment.types';

/**
 * Flattens deeply nested comments to a maximum of 2 levels
 * If a comment has replies that are deeper than level 2, they are moved to level 2
 * This ensures all deeply nested comments display at level 2 (same indentation)
 *
 * Structure:
 * Level 0: Top-level comments
 * Level 1: Replies to level 0
 * Level 2: Replies to level 1 (shown as siblings at level 2)
 */
export function flattenDeepNestedComments(comments: Comment[]): Comment[] {
  return comments.map((comment) => {
    if (!comment.replies || comment.replies.length === 0) {
      return comment;
    }

    // Flatten the replies to max 2 levels
    const flattenedReplies = flattenRepliesToLevel2(comment.replies);

    return {
      ...comment,
      replies: flattenedReplies,
    };
  });
}

/**
 * Recursively flattens replies to max 2 levels
 * Any replies deeper than level 2 are moved as siblings at level 2
 */
function flattenRepliesToLevel2(replies: Comment[], currentLevel: number = 1): Comment[] {
  // If we're at level 2, flatten any deeper replies to this level
  if (currentLevel >= 2) {
    const flattened: Comment[] = [];

    for (const reply of replies) {
      // Add this reply without its nested replies
      flattened.push({
        ...reply,
        replies: [], // Clear any nested replies
      });

      // Add any nested replies as siblings at this level
      if (reply.replies && reply.replies.length > 0) {
        const nestedFlattened = flattenRepliesToLevel2(reply.replies, currentLevel);
        flattened.push(...nestedFlattened);
      }
    }

    return flattened;
  }

  // Otherwise, recurse deeper (we're at level 1, so next level is level 2)
  return replies.map((reply) => ({
    ...reply,
    replies: reply.replies ? flattenRepliesToLevel2(reply.replies, currentLevel + 1) : [],
  }));
}
