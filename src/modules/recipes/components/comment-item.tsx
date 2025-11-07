'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Comment } from '../types/comment.types';
import { getFullDateTimeVN, getRelativeTime } from '../utils/time.utils';
import { CommentForm } from './comment-form';

interface CommentItemProps {
  comment: Comment;
  recipeId: string;
  currentUserId?: string;
  isRecipeAuthor?: boolean;
  isAdmin?: boolean;
  onDelete: (commentId: string) => Promise<void>;
  onReplyClick?: (parentCommentId: string) => void;
  onCreateComment?: (parentCommentId: string | undefined, content: string) => Promise<void>;
  isDeleting?: boolean;
  level?: number;
  index?: number;
  siblingsCount?: number;
  replyingTo?: string | null;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  recipeId,
  currentUserId,
  isRecipeAuthor,
  isAdmin,
  onDelete,
  onReplyClick,
  onCreateComment,
  isDeleting = false,
  level = 0,
  index = 0,
  siblingsCount = 1,
  replyingTo = null,
}) => {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const canDelete = currentUserId === comment.userId || isRecipeAuthor || isAdmin;
  const isLastChild = index === siblingsCount - 1;

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
    <div className={`relative py-3 ${indentClass}`}>
      {/* Tree connector lines for nested replies */}
      {level > 0 && (
        <>
          {/* Vertical line - shorter for last child */}
          <div
            className={`pointer-events-none absolute -left-6 flex justify-center ${
              isLastChild ? 'top-0 h-6' : 'top-0 bottom-0'
            }`}
          >
            <div className="w-px bg-gray-400" />
          </div>

          {/* Elbow connector to avatar */}
          <div className="pointer-events-none absolute top-4 -left-6 h-4 w-5 rounded-bl-md border-b border-l border-gray-400" />
        </>
      )}

      <div className="flex gap-3">
        {/* Avatar */}
        <button
          onClick={handleProfileClick}
          className="relative z-10 flex flex-shrink-0 cursor-pointer items-start transition-opacity hover:opacity-80"
          disabled={!comment.userId}
          title={`Avatar URL: ${comment.avatarUrl ? 'Present' : 'Missing'}`}
        >
          {comment.avatarUrl ? (
            <div className="relative h-8 w-8 overflow-hidden rounded-full sm:h-9 sm:w-9">
              <Image
                src={comment.avatarUrl}
                alt={`${comment.firstName} ${comment.lastName}`}
                fill
                sizes="36px"
                className="object-cover"
                onError={() => {
                  console.error('[CommentItem] Image failed to load from URL:', comment.avatarUrl);
                }}
              />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-white sm:h-9 sm:w-9 sm:text-sm">
              {(comment.firstName?.charAt(0) || 'U').toUpperCase()}
            </div>
          )}
        </button>

        {/* Comment Content Container */}
        <div className="flex-1 space-y-1">
          {/* Comment Bubble */}
          <div className="inline-block max-w-full rounded-2xl bg-gray-100 px-3 py-2 sm:px-4">
            {/* User Name */}
            <button
              onClick={handleProfileClick}
              disabled={!comment.userId}
              className="text-left text-xs font-semibold text-gray-900 transition-colors hover:text-[#99b94a] disabled:cursor-default disabled:hover:text-gray-900 sm:text-sm"
            >
              {comment.firstName} {comment.lastName}
            </button>

            {/* Content */}
            <p className="mt-0.5 text-sm break-words whitespace-pre-wrap text-gray-800 sm:text-[15px]">
              {comment.content}
            </p>
          </div>

          {/* Actions Row */}
          <div className="flex items-center gap-3 px-3 text-xs text-gray-600">
            {/* Timestamp with hover tooltip */}
            <span
              className="cursor-default font-medium"
              title={getFullDateTimeVN(comment.createdAtUtc)}
            >
              {getRelativeTime(comment.createdAtUtc)}
            </span>

            {/* Reply Button */}
            {onReplyClick && (
              <button
                onClick={handleReplyClick}
                className="font-semibold transition-colors hover:text-[#99b94a] hover:underline"
              >
                Trả lời
              </button>
            )}

            {/* Delete Button */}
            {canDelete && (
              <button
                onClick={handleDeleteClick}
                disabled={deleting || isDeleting}
                className="font-semibold text-red-600 transition-colors hover:text-red-700 hover:underline disabled:opacity-50"
              >
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline Reply Form */}
      {replyingTo === comment.id && onCreateComment && (
        <div className="mt-3 ml-10 sm:ml-11">
          <CommentForm
            parentCommentId={comment.id}
            onSuccess={() => onReplyClick?.('')}
            onCancel={() => onReplyClick?.('')}
            onCreateComment={onCreateComment}
          />
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-1">
          {comment.replies.map((reply, i) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              recipeId={recipeId}
              currentUserId={currentUserId}
              isRecipeAuthor={isRecipeAuthor}
              isAdmin={isAdmin}
              onDelete={onDelete}
              onReplyClick={onReplyClick}
              onCreateComment={onCreateComment}
              level={level + 1}
              index={i}
              siblingsCount={comment.replies?.length ?? 0}
              replyingTo={replyingTo}
            />
          ))}
        </div>
      )}
    </div>
  );
};
