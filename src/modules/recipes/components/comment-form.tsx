'use client';

import { SendHorizontal } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/base/components/ui/button';
import { useAuth } from '@/modules/auth/contexts/auth.context';

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
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={parentCommentId ? 'Viết trả lời...' : 'Viết bình luận của bạn...'}
            disabled={submitting}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none disabled:bg-gray-100"
            rows={2}
            maxLength={1000}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="mt-1 text-right text-xs text-gray-500">{content.length} / 1000 ký tự</div>
        </div>
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="mb-5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#99b94a] text-white transition-all hover:bg-[#8aa83f] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:opacity-50"
          title="Gửi (Ctrl + Enter)"
        >
          <SendHorizontal className="h-5 w-5" />
        </button>
      </div>
      {parentCommentId && onCancel && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={submitting}
            className="text-xs"
          >
            Hủy
          </Button>
        </div>
      )}
    </form>
  );
};
