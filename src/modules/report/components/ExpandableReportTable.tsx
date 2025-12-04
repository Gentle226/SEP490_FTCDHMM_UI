'use client';

import {
  AlertCircle,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  User,
  X,
} from 'lucide-react';
import * as React from 'react';
import { useMemo, useState } from 'react';

import { Badge } from '@/base/components/ui/badge';
import { Button } from '@/base/components/ui/button';
import { Skeleton } from '@/base/components/ui/skeleton';
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
import { getRelativeTime } from '@/modules/recipes/utils/time.utils';

import { useReportDetails } from '../hooks';
import { ReportStatus, type ReportSummaryResponse, ReportTargetType } from '../types';

export interface ExpandableReportTableProps {
  data: ReportSummaryResponse[];
  isLoading?: boolean;
  onApproveReport: (reportId: string) => Promise<void>;
  onRejectReport: (reportId: string) => void;
  onApproveAll: (targetId: string, targetType: ReportTargetType) => Promise<void>;
  onRejectAll: (targetId: string, targetType: ReportTargetType) => void;
}

function getStatusBadgeVariant(status: ReportStatus) {
  switch (status) {
    case ReportStatus.PENDING:
      return 'warning';
    case ReportStatus.APPROVED:
      return null; // Custom styling applied inline
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

function formatDate(dateString: string) {
  // Ensure the date string is interpreted as UTC by appending 'Z' if not present
  const utcDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
  const date = new Date(utcDateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

interface ExpandedRowProps {
  targetId: string;
  targetType: string;
  onApproveReport: (reportId: string) => Promise<void>;
  onRejectReport: (reportId: string) => void;
}

function ExpandedRow({ targetId, targetType, onApproveReport, onRejectReport }: ExpandedRowProps) {
  const { data: reportDetails, isLoading } = useReportDetails(
    targetId,
    targetType as ReportTargetType,
  );
  const reports = reportDetails?.reports ?? [];
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (reportId: string) => {
    setProcessingId(reportId);
    try {
      await onApproveReport(reportId);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="bg-muted/50">
          <div className="flex items-center justify-center py-4">
            <Skeleton className="h-20 w-full" />
          </div>
        </TableCell>
      </TableRow>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="bg-muted/50">
          <div className="text-muted-foreground py-4 text-center text-sm">Không có báo cáo nào</div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {reports.map((report, index) => (
        <TableRow
          key={report.reportId}
          className="bg-muted/40 hover:bg-muted/50 from-muted/40 to-muted/20 hover:from-muted/50 hover:to-muted/30 animate-in fade-in slide-in-from-top-2 border-l-4 border-[#99b94a] transition-all duration-300 ease-in-out"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <TableCell className="w-12">
            <div className="flex items-center justify-center">
              <div className="flex size-6 items-center justify-center rounded-full bg-[#99b94a]/10 text-[#99b94a]">
                <span className="text-xs font-semibold">#{index + 1}</span>
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Badge
                  variant={getStatusBadgeVariant(report.status as ReportStatus)}
                  className={`shadow-sm transition-all duration-200 hover:shadow ${
                    report.status === ReportStatus.APPROVED
                      ? 'border-transparent bg-[#99b94a] text-white hover:bg-[#8aab3b]'
                      : ''
                  }`}
                >
                  {getStatusLabel(report.status as ReportStatus)}
                </Badge>
                <div className="flex size-6 items-center justify-center rounded-full bg-[#99b94a]/10">
                  <User className="size-3.5 text-[#99b94a]" />
                </div>
                <span className="text-sm font-semibold">{report.reporterName}</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {report.description || (
                  <span className="text-muted-foreground/60 italic">Không có mô tả</span>
                )}
              </p>
              {report.rejectReason && (
                <div className="bg-danger/5 border-danger/20 rounded-md border p-2.5 pl-8">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="text-danger mt-0.5 size-3.5 flex-shrink-0" />
                    <div className="text-xs">
                      <strong className="text-danger font-semibold">Lý do từ chối:</strong>
                      <span className="text-danger/90 ml-1">{report.rejectReason}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TableCell>
          <TableCell className="text-center">
            <span className="text-muted-foreground/40">—</span>
          </TableCell>
          <TableCell>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-[#99b94a]/60" />
              <span>{formatDate(report.createdAtUtc)}</span>
            </div>
          </TableCell>
          <TableCell className="pr-6 text-right">
            {report.status === ReportStatus.PENDING && (
              <div className="flex items-center justify-end gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 border border-transparent px-3 text-[#99b94a] shadow-sm transition-all duration-200 hover:scale-105 hover:border-[#99b94a]/30 hover:bg-[#99b94a]/15 hover:text-[#99b94a] hover:shadow active:scale-95"
                        onClick={() => handleApprove(report.reportId)}
                        disabled={processingId === report.reportId}
                      >
                        {processingId === report.reportId ? (
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

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger hover:bg-danger/15 hover:text-danger hover:border-danger/30 h-9 border border-transparent px-3 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow active:scale-95"
                        onClick={() => onRejectReport(report.reportId)}
                        disabled={processingId === report.reportId}
                      >
                        <X className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#99b94a] text-white [--tooltip-fill:#99b94a]">
                      Từ chối báo cáo
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            {report.status !== ReportStatus.PENDING && (
              <div className="flex justify-end">
                {report.status === ReportStatus.APPROVED ? (
                  <Badge className="border-transparent bg-[#99b94a] text-xs text-white">
                    Đã duyệt
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-danger text-danger text-xs">
                    Đã từ chối
                  </Badge>
                )}
              </div>
            )}
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function ExpandableReportTable({
  data,
  isLoading = false,
  onApproveReport,
  onRejectReport,
  onApproveAll,
  onRejectAll,
}: ExpandableReportTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [processingBulk, setProcessingBulk] = useState<string | null>(null);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.count - a.count);
  }, [data]);

  const toggleRow = (key: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleApproveAll = async (targetId: string, targetType: ReportTargetType) => {
    const key = `${targetType}-${targetId}`;
    setProcessingBulk(key);
    try {
      await onApproveAll(targetId, targetType);
    } finally {
      setProcessingBulk(null);
    }
  };

  const handleRejectAll = (targetId: string, targetType: ReportTargetType) => {
    onRejectAll(targetId, targetType);
  };

  if (isLoading) {
    return (
      <div className="bg-card animate-in fade-in flex flex-col items-center justify-center rounded-lg border py-12 duration-300">
        <Loader2 className="mb-3 size-8 animate-spin text-[#99b94a]" />
        <p className="text-muted-foreground animate-pulse text-sm">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-card animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center justify-center rounded-lg border px-4 py-16 duration-500">
        <div className="bg-muted animate-in zoom-in mb-4 rounded-full p-4 delay-150 duration-300">
          <Clock className="text-muted-foreground size-12" />
        </div>
        <p className="text-foreground animate-in fade-in slide-in-from-bottom-2 mb-2 text-lg font-semibold delay-200 duration-500">
          Không tìm thấy báo cáo
        </p>
        <p className="text-muted-foreground animate-in fade-in slide-in-from-bottom-2 max-w-md text-center text-sm delay-300 duration-500">
          Không có báo cáo nào phù hợp với tiêu chí của bạn. Hãy thử điều chỉnh bộ lọc hoặc kiểm tra
          lại sau.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card animate-in fade-in slide-in-from-bottom-2 rounded-lg border shadow-sm duration-500">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-12"></TableHead>
            <TableHead className="font-semibold">Đối tượng</TableHead>
            <TableHead className="text-center font-semibold">Số báo cáo</TableHead>
            <TableHead className="font-semibold">Báo cáo gần nhất</TableHead>
            <TableHead className="pr-6 text-right font-semibold">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item) => {
            const rowKey = `${item.targetType}-${item.targetId}`;
            const isExpanded = expandedRows.has(rowKey);
            const isProcessing = processingBulk === rowKey;

            return (
              <React.Fragment key={rowKey}>
                <TableRow className="border-border/50 border-b bg-[#99b94a]/5 transition-all duration-200 ease-in-out hover:bg-[#99b94a]/10 hover:shadow-sm">
                  <TableCell className="w-12">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRow(rowKey)}
                      className="size-8 p-0 transition-all duration-200 hover:scale-110 hover:bg-[#99b94a]/10 hover:text-[#99b94a]"
                    >
                      {isExpanded ? (
                        <ChevronDown className="size-4 transition-transform duration-300 ease-out" />
                      ) : (
                        <ChevronRight className="size-4 transition-transform duration-300 ease-out" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-gradient-to-r from-[#99b94a] to-[#8aab3b] text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md">
                        {getTargetTypeLabel(item.targetType)}
                      </Badge>
                      <span className="text-sm font-semibold" title={item.targetName}>
                        {item.targetName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        item.count >= 5 ? 'danger' : item.count >= 3 ? 'warning' : 'secondary'
                      }
                      className="font-semibold shadow-sm transition-all duration-200 hover:scale-105 hover:shadow"
                    >
                      {item.count} báo cáo
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-muted-foreground flex items-center gap-2">
                      <Clock className="size-4 text-[#99b94a]/60" />
                      <span className="text-sm">
                        {getRelativeTime(item.latestReportAtUtc)}
                        {getRelativeTime(item.latestReportAtUtc) !== 'Vừa xong' && ' trước'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 border-[#99b94a] text-[#99b94a] shadow-sm transition-all duration-200 hover:scale-105 hover:bg-[#99b94a] hover:text-white hover:shadow-md active:scale-95"
                              onClick={() =>
                                handleApproveAll(item.targetId, item.targetType as ReportTargetType)
                              }
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                              ) : (
                                <Check className="mr-1.5 size-3.5" />
                              )}
                              <span className="font-medium">Duyệt tất cả</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#99b94a] text-white [--tooltip-fill:#99b94a]">
                            Duyệt tất cả báo cáo chờ xử lý
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-danger text-danger hover:bg-danger h-9 shadow-sm transition-all duration-200 hover:scale-105 hover:text-white hover:shadow-md active:scale-95"
                              onClick={() =>
                                handleRejectAll(item.targetId, item.targetType as ReportTargetType)
                              }
                              disabled={isProcessing}
                            >
                              <X className="mr-1.5 size-3.5" />
                              <span className="font-medium">Từ chối tất cả</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#99b94a] text-white [--tooltip-fill:#99b94a]">
                            Từ chối tất cả báo cáo chờ xử lý
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>

                {isExpanded && (
                  <ExpandedRow
                    targetId={item.targetId}
                    targetType={item.targetType}
                    onApproveReport={onApproveReport}
                    onRejectReport={onRejectReport}
                  />
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
