'use client';

import { Calendar, Flag, Loader2, User } from 'lucide-react';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { Badge } from '@/base/components/ui/badge';
import { Button } from '@/base/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/base/components/ui/dialog';
import { Separator } from '@/base/components/ui/separator';

import { reportService } from '../services';
import { type ReportResponse, ReportStatus, ReportTargetType } from '../types';

export interface ReportDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string | null;
  onApprove?: (reportId: string) => void;
  onReject?: (reportId: string) => void;
}

function getStatusBadgeVariant(status: ReportStatus) {
  switch (status) {
    case ReportStatus.PENDING:
      return 'warning';
    case ReportStatus.APPROVED:
      return 'success';
    case ReportStatus.REJECTED:
      return 'danger';
    default:
      return 'secondary';
  }
}

function getTargetTypeBadgeVariant(type: ReportTargetType) {
  switch (type) {
    case ReportTargetType.RECIPE:
      return 'default';
    case ReportTargetType.USER:
      return 'secondary';
    case ReportTargetType.COMMENT:
      return 'warning';
    case ReportTargetType.RATING:
      return 'outline';
    default:
      return 'outline';
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function ReportDetailModal({
  open,
  onOpenChange,
  reportId,
  onApprove,
  onReject,
}: ReportDetailModalProps) {
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await reportService.getReportById(reportId);
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải chi tiết báo cáo');
      } finally {
        setIsLoading(false);
      }
    };

    if (open && reportId) {
      fetchReport();
    } else {
      setReport(null);
      setError(null);
    }
  }, [open, reportId]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const isPending = report?.status === ReportStatus.PENDING;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="size-5" />
            Chi tiết báo cáo
          </DialogTitle>
          <DialogDescription>Xem đầy đủ thông tin của báo cáo này.</DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground size-8 animate-spin" />
          </div>
        )}

        {error && <div className="text-danger bg-danger/10 rounded-md p-4 text-sm">{error}</div>}

        {report && !isLoading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(report.status as ReportStatus)}>
                {report.status}
              </Badge>
              <Badge variant={getTargetTypeBadgeVariant(report.targetType as ReportTargetType)}>
                {report.targetType}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-3">
              <div>
                <h4 className="text-muted-foreground mb-1 text-sm font-medium">Đối tượng</h4>
                <p className="text-sm font-medium">{report.targetName}</p>
              </div>

              <div>
                <h4 className="text-muted-foreground mb-1 text-sm font-medium">Mô tả</h4>
                <p className="text-sm">
                  {report.description || (
                    <span className="text-muted-foreground italic">Không có mô tả</span>
                  )}
                </p>
              </div>

              <Separator />

              <div className="text-muted-foreground flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <User className="size-4" />
                  <span>Người báo cáo: {report.reporterName}</span>
                </div>
              </div>

              <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <Calendar className="size-4" />
                <span>{formatDate(report.createdAtUtc)}</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Đóng
          </Button>
          {report && isPending && (
            <>
              <Button variant="danger" onClick={() => onReject?.(report.id)}>
                Từ chối
              </Button>
              <Button
                className="bg-[#99b94a] text-white hover:bg-[#8aab3b]"
                onClick={() => onApprove?.(report.id)}
              >
                Duyệt
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
