'use client';

import { Calendar, Loader2, User } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/base/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/base/components/ui/dialog';
import { ScrollArea } from '@/base/components/ui/scroll-area';
import { Separator } from '@/base/components/ui/separator';

import { useReportDetails } from '../hooks';
import { ReportStatus } from '../types';

export interface ReportListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetId: string | null;
  targetType: string | null;
  targetName?: string;
}

function getStatusBadgeVariant(status: ReportStatus) {
  switch (status) {
    case ReportStatus.PENDING:
      return 'warning';
    case ReportStatus.APPROVED:
      return 'default';
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
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function ReportListModal({
  open,
  onOpenChange,
  targetId,
  targetType,
  targetName,
}: ReportListModalProps) {
  const { data, isLoading, error } = useReportDetails(targetId || '', targetType || '');

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#99b94a]">Danh sách báo cáo</DialogTitle>
          <DialogDescription>
            {data?.targetName || targetName ? (
              <>
                Tất cả báo cáo cho: <strong>{data?.targetName || targetName}</strong>
              </>
            ) : (
              'Xem tất cả báo cáo cho đối tượng này'
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground size-8 animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-danger bg-danger/10 rounded-md p-4 text-sm">
            Không thể tải danh sách báo cáo
          </div>
        )}

        {data && !isLoading && (
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-4">
              {data.reports.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center">Không có báo cáo nào</div>
              ) : (
                data.reports.map((report, index) => (
                  <div key={report.reportId}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={getStatusBadgeVariant(report.status as ReportStatus)}>
                          {getStatusLabel(report.status as ReportStatus)}
                        </Badge>
                        <span className="text-muted-foreground text-xs">#{index + 1}</span>
                      </div>

                      <div>
                        <h4 className="text-muted-foreground mb-1 text-sm font-medium">Mô tả</h4>
                        <p className="text-sm">
                          {report.description || (
                            <span className="text-muted-foreground italic">Không có mô tả</span>
                          )}
                        </p>
                      </div>

                      <div className="text-muted-foreground flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <User className="size-4" />
                          <span>{report.reporterName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-4" />
                          <span>{formatDate(report.createdAtUtc)}</span>
                        </div>
                      </div>

                      {report.rejectReason && (
                        <div>
                          <h4 className="text-muted-foreground mb-1 text-sm font-medium">
                            Lý do từ chối
                          </h4>
                          <p className="text-danger text-sm">{report.rejectReason}</p>
                        </div>
                      )}
                    </div>
                    {index < data.reports.length - 1 && <Separator className="my-4" />}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
