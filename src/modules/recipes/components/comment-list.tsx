'use client';

import { MessageSquare } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Skeleton } from '@/base/components/ui/skeleton';

import { Comment } from '../types/comment.types';
import { flattenDeepNestedComments } from '../utils/comment.utils';
import { CommentForm } from './comment-form';
import { CommentItem } from './comment-item';

interface CommentListProps {
  comments: Comment[];
  recipeId: string;
  currentUserId?: string;
  isRecipeAuthor?: boolean;
  isAdmin?: boolean;
  onDelete: (commentId: string) => Promise<void>;
  onCreateComment?: (parentCommentId: string | undefined, content: string) => Promise<void>;
  loading?: boolean;
  isDeleting?: boolean;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  recipeId,
  currentUserId,
  isRecipeAuthor,
  isAdmin,
  onDelete,
  onCreateComment,
  loading = false,
  isDeleting = false,
}) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Flatten deeply nested comments to max 2 levels and filter top-level
  const topLevelComments = useMemo(() => {
    const flattened = flattenDeepNestedComments(comments);
    return flattened.filter((comment) => !comment.parentCommentId);
  }, [comments]);

  const handleReplyClick = (parentCommentId: string) => {
    // If empty string, close the reply form
    if (parentCommentId === '') {
      setReplyingTo(null);
    } else {
      setReplyingTo(parentCommentId);
    }
  };

  const handleFormClose = () => {
    setReplyingTo(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Comment count header */}
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <MessageSquare className="h-5 w-5 text-gray-600" />
          <span>Bình luận</span>
        </div>

        {/* Loading skeletons */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-16 w-3/4 rounded-2xl" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment count header */}
      <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
        <MessageSquare className="h-5 w-5 text-gray-600" />
        <span>Bình luận ({topLevelComments.length})</span>
      </div>

      {/* Comment Form - Only show for top-level comments (not replying) */}
      {!replyingTo && (
        <div className="pb-4">
          <CommentForm onSuccess={handleFormClose} onCreateComment={onCreateComment} />
        </div>
      )}

      {/* Comments List */}
      {topLevelComments.length > 0 ? (
        <div className="space-y-1">
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              recipeId={recipeId}
              currentUserId={currentUserId}
              isRecipeAuthor={isRecipeAuthor}
              isAdmin={isAdmin}
              onDelete={onDelete}
              onReplyClick={handleReplyClick}
              onCreateComment={onCreateComment}
              isDeleting={isDeleting}
              replyingTo={replyingTo}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <MessageSquare className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-sm text-gray-500">
            Chưa có bình luận nào. Hãy trở thành người đầu tiên nào!
          </p>
        </div>
      )}
    </div>
  );
};
