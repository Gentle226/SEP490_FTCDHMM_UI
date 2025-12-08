'use client';

import { AlertCircle, Calendar, Check, ExternalLink, Loader2, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useState } from 'react';

import { Badge } from '@/base/components/ui/badge';
import { Button } from '@/base/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/base/components/ui/dialog';
import { ScrollArea } from '@/base/components/ui/scroll-area';
import { Separator } from '@/base/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/base/components/ui/tooltip';

import { useReportDetails } from '../hooks';
import { type ReportDetailItem, ReportStatus, ReportTargetType } from '../types';

export interface ReportDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetId: string | null;
  targetType: ReportTargetType | null;
  targetName?: string;
  targetUserName?: string;
  onApprove?: (reportId: string) => Promise<void>;
  onReject?: (reportId: string) => void;
}

function getStatusBadgeVariant(status: ReportStatus) {
  switch (status) {
    case ReportStatus.PENDING:
      return 'warning';
    case ReportStatus.APPROVED:
      return null; // Custom styling
    case ReportStatus.REJECTED:
      return 'danger';
    default:
      return 'secondary';
  }
}

function getStatusLabel(status: ReportStatus) {
  switch (status) {
    case ReportStatus.PENDING:
      return 'Chờ xử lý';
    case ReportStatus.APPROVED:
      return 'Đã duyệt';
    case ReportStatus.REJECTED:
      return 'Đã từ chối';
    default:
      return status;
  }
}

function formatDate(dateString: string) {
  const utcDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
  const date = new Date(utcDateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

interface ReportItemProps {
  report: ReportDetailItem;
  index: number;
  onApprove?: (reportId: string) => Promise<void>;
  onReject?: (reportId: string) => void;
}

function ReportItem({ report, index, onApprove, onReject }: ReportItemProps) {
  const [isApproving, setIsApproving] = useState(false);
  const isPending = report.status === ReportStatus.PENDING;

  const handleApprove = async () => {
    if (!onApprove) return;
    setIsApproving(true);
    try {
      await onApprove(report.reportId);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="bg-card hover:bg-muted/30 rounded-lg border p-4 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-[#99b94a]/10 text-xs font-semibold text-[#99b94a]">
              #{index + 1}
            </span>
            <Badge
              variant={getStatusBadgeVariant(report.status as ReportStatus)}
              className={
                report.status === ReportStatus.APPROVED
                  ? 'border-transparent bg-[#99b94a] text-white'
                  : ''
              }
            >
              {getStatusLabel(report.status as ReportStatus)}
            </Badge>
          </div>

          {/* Reporter */}
          <div className="flex items-center gap-2 text-sm">
            <User className="text-muted-foreground size-4" />
            <span className="font-medium">{report.reporterName}</span>
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm">
            {report.description || <span className="italic opacity-60">Không có mô tả</span>}
          </p>

          {/* Reject Reason */}
          {report.rejectReason && (
            <div className="border-danger/20 bg-danger/5 rounded-md border p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-danger mt-0.5 size-4 flex-shrink-0" />
                <div className="text-sm">
                  <strong className="text-danger font-semibold">Lý do từ chối:</strong>
                  <span className="text-danger/90 ml-1">{report.rejectReason}</span>
                </div>
              </div>
            </div>
          )}

          {/* Date */}
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Calendar className="size-3.5" />
            <span>{formatDate(report.createdAtUtc)}</span>
          </div>
        </div>

        {/* Actions */}
        {isPending && (onApprove || onReject) && (
          <div className="flex flex-col gap-1">
            {onApprove && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#99b94a] transition-colors hover:bg-[#99b94a]/10 hover:text-[#99b94a]"
                      onClick={handleApprove}
                      disabled={isApproving}
                    >
                      {isApproving ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Check className="size-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#99b94a] text-white [--tooltip-fill:#99b94a]">
                    Duyệt báo cáo
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {onReject && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-danger hover:bg-danger/10 hover:text-danger transition-colors"
                      onClick={() => onReject(report.reportId)}
                      disabled={isApproving}
                    >
                      <X className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#99b94a] text-white [--tooltip-fill:#99b94a]">
                    Từ chối báo cáo
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ReportDetailsModal({
  open,
  onOpenChange,
  targetId,
  targetType,
  targetName,
  targetUserName,
  onApprove,
  onReject,
}: ReportDetailsModalProps) {
  const router = useRouter();
  const { data, isLoading, error } = useReportDetails(targetId ?? '', targetType ?? '');

  const handleNavigateToTarget = () => {
    if (!targetId || !targetType) return;

    if (targetType === ReportTargetType.USER) {
      router.push(`/profile/${targetUserName}`);
    } else {
      router.push(`/recipe/${targetId}`);
    }
    onOpenChange(false);
  };

  const pendingCount = data?.reports.filter((r) => r.status === ReportStatus.PENDING).length ?? 0;
  const approvedCount = data?.reports.filter((r) => r.status === ReportStatus.APPROVED).length ?? 0;
  const rejectedCount = data?.reports.filter((r) => r.status === ReportStatus.REJECTED).length ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Chi tiết báo cáo</DialogTitle>
          <DialogDescription>Xem tất cả báo cáo cho đối tượng này</DialogDescription>
        </DialogHeader>

        {/* Target Info */}
        {(data || targetName) && (
          <div className="bg-muted/30 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Đối tượng bị báo cáo</p>
                <p className="font-semibold">{data?.targetName || targetName}</p>
                {data?.targetType && (
                  <Badge variant="outline" className="mt-1">
                    {data.targetType}
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleNavigateToTarget}>
                <ExternalLink className="mr-2 size-4" />
                {targetType === ReportTargetType.USER ? 'Xem hồ sơ' : 'Xem chi tiết'}
              </Button>
            </div>

            {/* Stats */}
            {data && (
              <div className="mt-4 flex gap-4 border-t pt-4">
                <div className="text-center">
                  <p className="text-warning text-2xl font-bold">{pendingCount}</p>
                  <p className="text-muted-foreground text-xs">Chờ xử lý</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#99b94a]">{approvedCount}</p>
                  <p className="text-muted-foreground text-xs">Đã duyệt</p>
                </div>
                <div className="text-center">
                  <p className="text-danger text-2xl font-bold">{rejectedCount}</p>
                  <p className="text-muted-foreground text-xs">Đã từ chối</p>
                </div>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground size-8 animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-danger/10 text-danger rounded-md p-4 text-sm">
            Không thể tải chi tiết báo cáo
          </div>
        )}

        {/* Reports List */}
        {data && !isLoading && (
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-3">
              {data.reports.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center">Không có báo cáo nào</div>
              ) : (
                data.reports.map((report, index) => (
                  <ReportItem
                    key={report.reportId}
                    report={report}
                    index={index}
                    onApprove={onApprove}
                    onReject={onReject}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
