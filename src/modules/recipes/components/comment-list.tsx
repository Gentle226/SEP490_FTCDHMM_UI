'use client';

import { MessageSquare } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/base/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/base/components/ui/card';
import { Skeleton } from '@/base/components/ui/skeleton';

import { Comment } from '../types/comment.types';
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

  const topLevelComments = useMemo(
    () => comments.filter((comment) => !comment.parentCommentId),
    [comments],
  );

  const handleReplyClick = (parentCommentId: string) => {
    setReplyingTo(parentCommentId);
  };

  const handleFormClose = () => {
    setReplyingTo(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Bình luận
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Bình luận ({topLevelComments.length})
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Comment Form - Always visible */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
          <CommentForm
            parentCommentId={replyingTo || undefined}
            onSuccess={handleFormClose}
            onCancel={replyingTo ? handleFormClose : undefined}
            onCreateComment={onCreateComment}
          />
        </div>

        {/* Comments List */}
        {topLevelComments.length > 0 ? (
          <div className="space-y-2 divide-y divide-gray-200">
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
                isDeleting={isDeleting}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <MessageSquare className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">
              Chưa có bình luận nào. Hãy trở thành người đầu tiên nào!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
