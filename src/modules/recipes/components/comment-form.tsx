'use client';

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
      toast.success(parentCommentId ? 'Trả lời đã được gửi' : 'Bình luận đã được gửi');
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Lỗi khi gửi bình luận';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentCommentId ? 'Viết trả lời...' : 'Viết bình luận của bạn...'}
        disabled={submitting}
        className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none disabled:bg-gray-100"
        rows={3}
        maxLength={1000}
      />

      <div className="text-right text-xs text-gray-500">{content.length} / 1000 ký tự</div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={submitting}>
          Hủy
        </Button>
        <Button type="submit" size="sm" disabled={submitting || !content.trim()}>
          {submitting ? 'Đang gửi...' : 'Gửi'}
        </Button>
      </div>
    </form>
  );
};
