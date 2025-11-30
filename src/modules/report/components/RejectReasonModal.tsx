'use client';

import { Loader2, X } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';

import { Button } from '@/base/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/base/components/ui/dialog';
import { Label } from '@/base/components/ui/label';
import { Textarea } from '@/base/components/ui/textarea';

import { reportService } from '../services';

export interface RejectReasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string | null;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function RejectReasonModal({
  open,
  onOpenChange,
  reportId,
  onSuccess,
  onError,
}: RejectReasonModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportId) return;

    if (!reason.trim()) {
      setError('Vui lòng nhập lý do từ chối');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await reportService.rejectReport(reportId, reason.trim());
      setReason('');
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể từ chối báo cáo';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <X className="text-danger size-5" />
            Từ chối báo cáo
          </DialogTitle>
          <DialogDescription>
            Vui lòng cung cấp lý do từ chối báo cáo này. Thông tin sẽ được lưu lại để tham khảo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reject-reason">
              Lý do <span className="text-danger">*</span>
            </Label>
            <Textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              rows={4}
              disabled={isSubmitting}
              required
            />
          </div>

          {error && <div className="text-danger bg-danger/10 rounded-md p-3 text-sm">{error}</div>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" variant="danger" disabled={isSubmitting || !reason.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <X className="size-4" />
                  Từ chối
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
