'use client';

import { Reply, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/base/components/ui/button';

import { Comment } from '../types/comment.types';

interface CommentItemProps {
  comment: Comment;
  recipeId: string;
  currentUserId?: string;
  isRecipeAuthor?: boolean;
  isAdmin?: boolean;
  onDelete: (commentId: string) => Promise<void>;
  onReplyClick?: (parentCommentId: string) => void;
  isDeleting?: boolean;
  level?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  recipeId,
  currentUserId,
  isRecipeAuthor,
  isAdmin,
  onDelete,
  onReplyClick,
  isDeleting = false,
  level = 0,
}) => {
  const [deleting, setDeleting] = useState(false);
  const canDelete = currentUserId === comment.userId || isRecipeAuthor || isAdmin;

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Bạn chắc chắn muốn xóa bình luận này?')) {
      return;
    }

    setDeleting(true);
    try {
      await onDelete(comment.id);
    } finally {
      setDeleting(false);
    }
  };

  const handleReplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onReplyClick?.(comment.id);
  };

  const indentClass =
    {
      0: 'ml-0',
      1: 'ml-4 sm:ml-6 md:ml-8',
      2: 'ml-8 sm:ml-12 md:ml-16',
      3: 'ml-12 sm:ml-16 md:ml-24',
    }[Math.min(level, 3)] || 'ml-0';

  return (
    <div className={`space-y-3 border-l-2 border-gray-200 py-3 pl-3 sm:pl-4 ${indentClass}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-gray-900">
            {comment.firstName} {comment.lastName}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(comment.createdAtUtc).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm break-words whitespace-pre-wrap text-gray-700">{comment.content}</p>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        {onReplyClick && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs text-gray-600 hover:text-green-600"
            onClick={handleReplyClick}
          >
            <Reply className="h-3 w-3" />
            Trả lời
          </Button>
        )}

        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs text-gray-600 hover:bg-red-50 hover:text-red-600"
            onClick={handleDeleteClick}
            disabled={deleting || isDeleting}
          >
            <Trash2 className="h-3 w-3" />
            {deleting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2 pt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              recipeId={recipeId}
              currentUserId={currentUserId}
              isRecipeAuthor={isRecipeAuthor}
              isAdmin={isAdmin}
              onDelete={onDelete}
              onReplyClick={onReplyClick}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
