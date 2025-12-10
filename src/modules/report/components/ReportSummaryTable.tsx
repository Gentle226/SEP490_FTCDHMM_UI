'use client';

import { Check, Clock, Eye, X } from 'lucide-react';
import * as React from 'react';
import { useMemo } from 'react';

import { Badge } from '@/base/components/ui/badge';
import { Button } from '@/base/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/base/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/base/components/ui/tooltip';

import { ReportTargetType, type ReportsResponse } from '../types';

export interface ReportSummaryTableProps {
  data: ReportsResponse[];
  isLoading?: boolean;
  onView?: (targetId: string, targetType: ReportTargetType, targetName: string) => void;
  onApprove?: (targetId: string, targetType: ReportTargetType) => void;
  onReject?: (targetId: string, targetType: ReportTargetType) => void;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getTargetTypeLabel(type: ReportTargetType) {
  switch (type) {
    case ReportTargetType.RECIPE:
      return 'Công thức';
    case ReportTargetType.USER:
      return 'Người dùng';
    case ReportTargetType.COMMENT:
      return 'Bình luận';
    case ReportTargetType.RATING:
      return 'Đánh giá';
    default:
      return type;
  }
}

export function ReportSummaryTable({
  data,
  isLoading = false,
  onView,
  onApprove,
  onReject,
}: ReportSummaryTableProps) {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.count - a.count);
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#99b94a]" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
        <Clock className="mb-4 size-12" />
        <p className="text-lg font-medium">Không tìm thấy báo cáo</p>
        <p className="text-sm">Không có báo cáo nào phù hợp với tiêu chí của bạn.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Loại</TableHead>
          <TableHead>Tên đối tượng</TableHead>
          <TableHead className="text-center">Số báo cáo</TableHead>
          <TableHead>Báo cáo gần nhất</TableHead>
          <TableHead className="text-right">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((item) => (
          <TableRow key={`${item.targetType}-${item.targetId}`}>
            <TableCell>
              <Badge className="bg-[#99b94a] text-white hover:bg-[#8aab3b]">
                {getTargetTypeLabel(item.targetType)}
              </Badge>
            </TableCell>
            <TableCell className="max-w-xs truncate font-medium" title={item.targetName}>
              {item.targetName}
            </TableCell>
            <TableCell className="text-center">
              <Badge
                variant={item.count >= 5 ? 'danger' : item.count >= 3 ? 'warning' : 'secondary'}
              >
                {item.count} báo cáo
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {formatDate(item.latestReportAtUtc)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          onView?.(
                            item.targetId,
                            item.targetType as ReportTargetType,
                            item.targetName,
                          )
                        }
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      className="bg-[#99b94a] text-white"
                      style={{ '--tooltip-fill': '#99b94a' } as React.CSSProperties}
                    >
                      Xem chi tiết
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#99b94a] hover:bg-[#99b94a]/10 hover:text-[#99b94a]"
                        onClick={() =>
                          onApprove?.(item.targetId, item.targetType as ReportTargetType)
                        }
                      >
                        <Check className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      className="bg-[#99b94a] text-white"
                      style={{ '--tooltip-fill': '#99b94a' } as React.CSSProperties}
                    >
                      Duyệt báo cáo
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-danger hover:text-danger hover:bg-danger/10"
                        onClick={() =>
                          onReject?.(item.targetId, item.targetType as ReportTargetType)
                        }
                      >
                        <X className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      className="bg-[#99b94a] text-white"
                      style={{ '--tooltip-fill': '#99b94a' } as React.CSSProperties}
                    >
                      Từ chối báo cáo
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
