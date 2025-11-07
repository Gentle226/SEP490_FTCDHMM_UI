'use client';

import { Reply, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

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
  const router = useRouter();
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
      toast.success('Bình luận đã được xóa');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi khi xóa bình luận';
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleReplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onReplyClick?.(comment.id);
  };

  const handleProfileClick = () => {
    if (comment.userId) {
      router.push(`/profile/${comment.userId}`);
    }
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
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <button
          onClick={handleProfileClick}
          className="flex-shrink-0 cursor-pointer transition-opacity hover:opacity-80"
          disabled={!comment.userId}
          title={`Avatar URL: ${comment.avatarUrl ? 'Present' : 'Missing'}`}
        >
          {comment.avatarUrl ? (
            <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-gray-200">
              <Image
                src={comment.avatarUrl}
                alt={`${comment.firstName} ${comment.lastName}`}
                fill
                sizes="40px"
                className="object-cover"
                onError={() => {
                  console.error('[CommentItem] Image failed to load from URL:', comment.avatarUrl);
                }}
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100 text-sm font-semibold text-gray-600">
              {(comment.firstName?.charAt(0) || 'U').toUpperCase()}
            </div>
          )}
        </button>

        {/* User Info */}
        <div className="flex flex-1 flex-col gap-1">
          <button
            onClick={handleProfileClick}
            disabled={!comment.userId}
            className="text-left text-sm font-semibold text-gray-900 transition-colors hover:text-[#99b94a] disabled:cursor-default disabled:hover:text-gray-900"
          >
            {comment.firstName} {comment.lastName}
          </button>
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
