'use client';

import { Check, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/base/components/ui/button';
import { ReportTargetType, ReportTrigger } from '@/modules/report';

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
  onEdit?: (commentId: string, content: string) => Promise<void>;
  onReplyClick?: (parentCommentId: string) => void;
  onCreateComment?: (
    parentCommentId: string | undefined,
    content: string,
    mentionedUserIds?: string[],
  ) => Promise<void>;
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
  onEdit,
  onReplyClick,
  onCreateComment,
  isDeleting = false,
  level = 0,
  index = 0,
  siblingsCount = 1,
  replyingTo = null,
}) => {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const canDelete = currentUserId === comment.userId || isRecipeAuthor || isAdmin;
  const canEdit = currentUserId === comment.userId;
  const isLastChild = index === siblingsCount - 1;

  // Auto-focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length,
      );
      // Auto-expand textarea to fit content
      autoResizeTextarea();
    }
  }, [isEditing]);

  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        Math.min(
          textareaRef.current.scrollHeight,
          400, // max-height
        ) + 'px';
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value);
    autoResizeTextarea();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleEditSave();
    }
    // Escape to cancel
    if (e.key === 'Escape') {
      e.preventDefault();
      handleEditCancel();
    }
  };

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

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleEditSave = async () => {
    if (!editContent.trim()) {
      toast.error('Nội dung bình luận không được để trống');
      return;
    }

    if (editContent === comment.content) {
      setIsEditing(false);
      return;
    }

    setIsSavingEdit(true);
    try {
      await onEdit?.(comment.id, editContent);
      toast.success('Bình luận đã được cập nhật');
      setIsEditing(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi khi cập nhật bình luận';
      toast.error(errorMessage);
    } finally {
      setIsSavingEdit(false);
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
          {/* Comment Bubble or Edit Form */}
          {isEditing ? (
            <div className="w-full space-y-2 rounded-lg bg-gray-100 p-4">
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                maxLength={2048}
                rows={1}
                className="scrollbar-hide w-full resize-none rounded-lg border border-[#99b94a] bg-white p-3 text-sm font-normal text-gray-900 placeholder-gray-500 transition-colors focus:border-[#99b94a] focus:ring-1 focus:ring-[#99b94a] focus:outline-none"
                placeholder="Chỉnh sửa bình luận..."
                disabled={isSavingEdit}
              />
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-gray-500">{editContent.length}/2048</span>
                <span className="text-xs text-gray-400">Ctrl+Enter để lưu, Esc để hủy</span>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  onClick={handleEditCancel}
                  disabled={isSavingEdit}
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                >
                  <X className="h-4 w-4" />
                  Hủy
                </Button>
                <Button
                  onClick={handleEditSave}
                  disabled={isSavingEdit || !editContent.trim()}
                  size="sm"
                  variant="default"
                  className="gap-1.5 bg-[#99b94a] hover:bg-[#7a8f3a]"
                >
                  <Check className="h-4 w-4" />
                  {isSavingEdit ? 'Đang lưu...' : 'Lưu'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="inline-block max-w-full rounded-2xl bg-gray-100 px-3 py-2 sm:px-4">
              {/* User Name */}
              <button
                onClick={handleProfileClick}
                disabled={!comment.userId}
                className="text-left text-xs font-semibold text-gray-900 transition-colors hover:text-[#99b94a] disabled:cursor-default disabled:hover:text-gray-900 sm:text-sm"
              >
                {comment.firstName} {comment.lastName}
              </button>

              {/* Content - Display with mentions */}
              <div className="mt-0.5 flex flex-wrap items-baseline gap-1">
                {/* Mentioned Users - Show as inline badges with content */}
                {comment.mentions && comment.mentions.length > 0 && (
                  <>
                    {comment.mentions.map((mention) => (
                      <button
                        key={mention.mentionedUserId}
                        onClick={() => {
                          if (mention.mentionedUserId) {
                            router.push(`/profile/${mention.mentionedUserId}`);
                          }
                        }}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-[#99b94a] px-2 py-0.5 text-xs font-medium text-white transition-opacity hover:opacity-80"
                      >
                        @{mention.lastName} {mention.firstName}
                      </button>
                    ))}
                  </>
                )}
                {/* Content */}
                <p className="text-sm break-words whitespace-pre-wrap text-gray-800 sm:text-[15px]">
                  {comment.content}
                </p>
              </div>
            </div>
          )}

          {/* Actions Row */}
          <div className="flex flex-wrap items-center gap-3 px-3 pt-2 text-xs text-gray-600">
            {/* Timestamp with hover tooltip */}
            <span
              className="cursor-default font-medium hover:text-gray-800"
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

            {/* Edit Button */}
            {canEdit && !isEditing && (
              <button
                onClick={handleEditClick}
                className="font-semibold transition-colors hover:text-[#99b94a] hover:underline"
              >
                Sửa
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

            {/* Report Button - Only show for non-owner comments */}
            {currentUserId && currentUserId !== comment.userId && (
              <ReportTrigger
                targetId={comment.id}
                targetType={ReportTargetType.COMMENT}
                targetName={`Bình luận của ${comment.firstName} ${comment.lastName}`}
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-semibold text-gray-600 hover:bg-transparent hover:text-red-500"
                showLabel
              />
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
              onEdit={onEdit}
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
