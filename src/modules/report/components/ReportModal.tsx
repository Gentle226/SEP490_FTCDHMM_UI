'use client';

import { Flag, Loader2 } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';

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
import { Select, type SelectOption } from '@/base/components/ui/select';
import { Textarea } from '@/base/components/ui/textarea';

import { reportService } from '../services';
import { type CreateReportRequest, ReportTargetType } from '../types';

export interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetId: string;
  targetType: ReportTargetType;
  targetName?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const TARGET_TYPE_OPTIONS: SelectOption[] = [
  { value: ReportTargetType.RECIPE, label: 'Công thức' },
  { value: ReportTargetType.USER, label: 'Người dùng' },
  { value: ReportTargetType.COMMENT, label: 'Bình luận' },
  { value: ReportTargetType.RATING, label: 'Đánh giá' },
];

export function ReportModal({
  open,
  onOpenChange,
  targetId,
  targetType,
  targetName,
  onSuccess,
  onError,
}: ReportModalProps) {
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const request: CreateReportRequest = {
        targetId,
        targetType,
        description: description.trim() || undefined,
      };

      await reportService.createReport(request);

      setDescription('');
      onOpenChange(false);
      toast.success('Báo cáo đã được gửi thành công');
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể gửi báo cáo';
      setError(errorMessage);
      toast.error(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setDescription('');
      setError(null);
      onOpenChange(false);
    }
  };

  const getTargetTypeLabel = (type: ReportTargetType) => {
    return TARGET_TYPE_OPTIONS.find((opt) => opt.value === type)?.label || type;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="text-danger size-5" />
            Báo cáo {getTargetTypeLabel(targetType)}
          </DialogTitle>
          <DialogDescription>
            {targetName ? (
              <>
                Bạn đang báo cáo: <strong>{targetName}</strong>
              </>
            ) : (
              'Vui lòng cung cấp chi tiết về lý do bạn báo cáo nội dung này.'
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-type">Loại báo cáo</Label>
            <Select
              options={TARGET_TYPE_OPTIONS}
              value={targetType}
              disabled
              placeholder="Chọn loại"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-description">
              Mô tả <span className="text-muted-foreground">(không bắt buộc)</span>
            </Label>
            <Textarea
              id="report-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Vui lòng mô tả lý do bạn báo cáo nội dung này..."
              rows={4}
              maxLength={2000}
              disabled={isSubmitting}
            />
            <p className="text-muted-foreground text-right text-xs">{description.length}/2000</p>
          </div>

          {error && <div className="text-danger bg-danger/10 rounded-md p-3 text-sm">{error}</div>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" variant="danger" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Flag className="size-4" />
                  Gửi báo cáo
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
