'use client';

import { SendHorizontal } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/modules/auth/contexts/auth.context';
import { useProfile } from '@/modules/profile';

interface CommentFormProps {
  parentCommentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onCreateComment?: (parentCommentId: string | undefined, content: string) => Promise<void>;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  parentCommentId,
  onSuccess,
  onCancel,
  onCreateComment,
}) => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Get avatar URL from profile
  const avatarUrl = profile?.avatarUrl ? profile.avatarUrl : null;

  if (!user) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">
        Vui lòng đăng nhập để thêm bình luận
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Vui lòng nhập bình luận');
      return;
    }

    if (content.length > 1000) {
      toast.error('Bình luận không được vượt quá 1000 ký tự');
      return;
    }

    setSubmitting(true);
    try {
      if (onCreateComment) {
        await onCreateComment(parentCommentId, content.trim());
      }

      setContent('');
      toast.success(parentCommentId ? 'Đã trả lời bình luận' : 'Bình luận đã được gửi');
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi khi gửi bình luận';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        {/* User Avatar - stays at top left */}
        <div className="mt-0 flex flex-shrink-0">
          <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-300 text-xs font-semibold text-white sm:h-9 sm:w-9 sm:text-sm">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={user?.firstName || user?.email}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>
                {(user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Input Container */}
        <div className="relative flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={parentCommentId ? 'Viết trả lời...' : 'Viết bình luận của bạn...'}
            disabled={submitting}
            className="w-full resize-none rounded-lg border-0 bg-gray-100 px-4 py-2 pr-10 text-sm leading-relaxed transition-all focus:bg-white focus:shadow-md focus:ring-2 focus:ring-[#99b94a] focus:outline-none disabled:bg-gray-50 sm:text-[15px]"
            rows={1}
            maxLength={1000}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (content.trim()) {
                  handleSubmit(e);
                }
              }
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
            style={{ minHeight: '36px', maxHeight: '120px' }}
          />

          {/* Send Button - positioned absolutely inside the input */}
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-transparent pb-1.5 text-[#99b94a] transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300 disabled:opacity-50"
            title="Gửi (Enter)"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>

          {/* Character counter - always present to prevent layout shift */}
          <div
            className={`absolute right-2 -bottom-5 text-xs transition-opacity ${content.length > 0 ? 'text-gray-400 opacity-100' : 'text-transparent opacity-0'}`}
          >
            {content.length} / 1000
          </div>
        </div>
      </div>

      {/* Cancel button for replies */}
      {parentCommentId && onCancel && (
        <div className="flex justify-end pl-5 sm:pl-11">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="text-xs font-semibold text-gray-600 transition-colors hover:text-gray-800 hover:underline disabled:opacity-50"
          >
            Hủy
          </button>
        </div>
      )}
    </form>
  );
};
