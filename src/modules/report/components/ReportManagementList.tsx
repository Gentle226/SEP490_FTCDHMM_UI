'use client';

import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  History,
  Loader2,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/base/components/ui/badge';
import { Button } from '@/base/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/base/components/ui/card';
import { Skeleton } from '@/base/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/base/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/base/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/base/components/ui/tooltip';
import { getRelativeTime } from '@/modules/recipes/utils/time.utils';

import { useApproveReport, useReportHistory, useReportSummary } from '../hooks';
import { reportService } from '../services';
import {
  ReportFilterRequest,
  ReportStatus,
  type ReportSummaryResponse,
  ReportTargetType,
} from '../types';
import { RejectReasonModal } from './RejectReasonModal';
import { ReportDetailsModal } from './ReportDetailsModal';
import { type ReportFilters, ReportFiltersComponent } from './ReportFilters';

const PAGE_SIZE = 10;

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

function getTargetTypeBadgeStyle(type: ReportTargetType) {
  switch (type) {
    case ReportTargetType.RECIPE:
      return 'bg-blue-500 hover:bg-blue-600';
    case ReportTargetType.USER:
      return 'bg-purple-500 hover:bg-purple-600';
    case ReportTargetType.COMMENT:
      return 'bg-orange-500 hover:bg-orange-600';
    case ReportTargetType.RATING:
      return 'bg-yellow-500 hover:bg-yellow-600';
    default:
      return 'bg-gray-500 hover:bg-gray-600';
  }
}

interface ReportTableProps {
  data: ReportSummaryResponse[];
  isLoading: boolean;
  showActions?: boolean;
  onViewDetails: (item: ReportSummaryResponse) => void;
  onNavigateToTarget: (item: ReportSummaryResponse) => void;
  onApproveAll?: (item: ReportSummaryResponse) => void;
  onRejectAll?: (item: ReportSummaryResponse) => void;
  processingId?: string | null;
}

function ReportTable({
  data,
  isLoading,
  showActions = true,
  onViewDetails,
  onNavigateToTarget,
  onApproveAll,
  onRejectAll,
  processingId,
}: ReportTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="bg-muted mb-4 rounded-full p-4">
          <Clock className="text-muted-foreground size-12" />
        </div>
        <p className="text-foreground mb-2 text-lg font-semibold">Không có báo cáo nào</p>
        <p className="text-muted-foreground max-w-md text-center text-sm">
          Không có báo cáo nào phù hợp với tiêu chí tìm kiếm của bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[140px] pl-6 text-left">Loại</TableHead>
            <TableHead className="w-[36%] truncate">Tên đối tượng</TableHead>
            <TableHead className="w-[120px] text-center">Số báo cáo</TableHead>
            <TableHead className="w-[150px] text-center">Cập nhật lần cuối</TableHead>
            <TableHead className="w-[180px] pr-5 text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            const isProcessing = processingId === `${item.targetType}-${item.targetId}`;

            return (
              <TableRow
                key={`${item.targetType}-${item.targetId}`}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell className="pl-6">
                  <Badge className={`text-white ${getTargetTypeBadgeStyle(item.targetType)}`}>
                    {getTargetTypeLabel(item.targetType)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-0">
                  <span className="truncate font-medium" title={item.targetName}>
                    {item.targetName}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={item.count >= 5 ? 'danger' : item.count >= 3 ? 'warning' : 'secondary'}
                  >
                    {item.count}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-muted-foreground text-sm">
                    {(() => {
                      const relativeTime = getRelativeTime(item.latestReportAtUtc);
                      return relativeTime === 'Vừa xong' ? relativeTime : `${relativeTime} trước`;
                    })()}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* View Details Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground transition-colors hover:bg-[#99b94a]/10 hover:text-[#99b94a]"
                            onClick={() => onViewDetails(item)}
                          >
                            <Eye className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#99b94a] text-white [--tooltip-fill:#99b94a]">
                          Xem chi tiết báo cáo
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Navigate to Target Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground transition-colors hover:bg-[#99b94a]/10 hover:text-[#99b94a]"
                            onClick={() => onNavigateToTarget(item)}
                          >
                            <ExternalLink className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#99b94a] text-white [--tooltip-fill:#99b94a]">
                          {item.targetType === ReportTargetType.USER
                            ? 'Xem hồ sơ người dùng'
                            : 'Xem công thức'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Action Buttons - Only show for pending reports */}
                    {showActions && onApproveAll && onRejectAll && (
                      <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-[#99b94a] transition-colors hover:bg-[#99b94a]/10 hover:text-[#99b94a]"
                                onClick={() => onApproveAll(item)}
                                disabled={isProcessing}
                              >
                                {isProcessing ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <Check className="size-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#99b94a] text-white [--tooltip-fill:#99b94a]">
                              Duyệt tất cả báo cáo
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-danger hover:bg-danger/10 hover:text-danger transition-colors"
                                onClick={() => onRejectAll(item)}
                                disabled={isProcessing}
                              >
                                <X className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#99b94a] text-white [--tooltip-fill:#99b94a]">
                              Từ chối tất cả báo cáo
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, totalCount, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t px-4 py-3">
      <span className="text-muted-foreground text-sm">
        Tổng cộng <strong>{totalCount}</strong> mục
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm">
          Trang <strong>{currentPage}</strong> / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function ReportManagementList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [filters, setFilters] = useState<ReportFilters>({});
  const [pendingPage, setPendingPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modal states
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<ReportSummaryResponse | null>(null);
  const [bulkRejectTarget, setBulkRejectTarget] = useState<{
    targetId: string;
    targetType: ReportTargetType;
  } | null>(null);

  // API filters
  const pendingFilters: ReportFilterRequest = {
    ...filters,
    paginationParams: { pageNumber: pendingPage, pageSize: PAGE_SIZE },
  };

  const historyFilters: ReportFilterRequest = {
    ...filters,
    paginationParams: { pageNumber: historyPage, pageSize: PAGE_SIZE },
  };

  const {
    data: pendingData,
    isLoading: pendingLoading,
    refetch: refetchPending,
  } = useReportSummary(pendingFilters);
  const {
    data: historyData,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useReportHistory(historyFilters);
  const approveReport = useApproveReport();

  const handleFilterChange = useCallback((newFilters: ReportFilters) => {
    setFilters(newFilters);
    setPendingPage(1);
    setHistoryPage(1);
  }, []);

  const handleFilterReset = useCallback(() => {
    setFilters({});
    setPendingPage(1);
    setHistoryPage(1);
  }, []);

  const handleViewDetails = useCallback((item: ReportSummaryResponse) => {
    setSelectedTarget(item);
    setIsDetailsOpen(true);
  }, []);

  const handleNavigateToTarget = useCallback(
    (item: ReportSummaryResponse) => {
      if (item.targetType === ReportTargetType.USER) {
        router.push(`/profile/${item.targetId}`);
      } else {
        // For RECIPE, COMMENT, RATING - navigate to recipe details
        // Comments and Ratings are associated with recipes
        router.push(`/recipes/${item.targetId}`);
      }
    },
    [router],
  );

  const handleApproveAll = useCallback(
    async (item: ReportSummaryResponse) => {
      const key = `${item.targetType}-${item.targetId}`;
      setProcessingId(key);

      try {
        const details = await reportService.getReportDetails(item.targetId, item.targetType);
        const pendingReports = details.reports.filter((r) => r.status === ReportStatus.PENDING);

        if (pendingReports.length === 0) {
          toast.warning('Không có báo cáo nào đang chờ xử lý');
          return;
        }

        await Promise.all(
          pendingReports.map((report) => reportService.approveReport(report.reportId)),
        );

        toast.success(`Đã duyệt ${pendingReports.length} báo cáo thành công`);
        refetchPending();
        refetchHistory();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể duyệt báo cáo');
      } finally {
        setProcessingId(null);
      }
    },
    [refetchPending, refetchHistory],
  );

  const handleRejectAll = useCallback((item: ReportSummaryResponse) => {
    setBulkRejectTarget({ targetId: item.targetId, targetType: item.targetType });
    setIsRejectOpen(true);
  }, []);

  const handleRejectSuccess = useCallback(() => {
    toast.success('Đã từ chối báo cáo thành công');
    setIsRejectOpen(false);
    setBulkRejectTarget(null);
    refetchPending();
    refetchHistory();
  }, [refetchPending, refetchHistory]);

  const pendingTotalPages = Math.ceil((pendingData?.totalCount ?? 0) / PAGE_SIZE);
  const historyTotalPages = Math.ceil((historyData?.totalCount ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-6 px-3">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#99b94a] to-[#8aab3b] shadow-lg">
            <AlertTriangle className="size-6 text-white" />
          </div>
          <div>
            <h2 className="bg-gradient-to-r from-[#99b94a] to-[#7a9a35] bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              Quản Lý Báo Cáo
            </h2>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Xem và xử lý các báo cáo từ người dùng
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <ReportFiltersComponent
        filters={filters}
        onFiltersChange={handleFilterChange}
        onReset={handleFilterReset}
        showStatusFilter={activeTab === 'history'}
      />

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'pending' | 'history')}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="size-4" />
            Chờ xử lý
            {pendingData?.totalCount ? (
              <Badge variant="secondary" className="ml-1">
                {pendingData.totalCount}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="size-4" />
            Lịch sử
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Báo cáo chờ xử lý</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ReportTable
                data={pendingData?.items ?? []}
                isLoading={pendingLoading}
                showActions={true}
                onViewDetails={handleViewDetails}
                onNavigateToTarget={handleNavigateToTarget}
                onApproveAll={handleApproveAll}
                onRejectAll={handleRejectAll}
                processingId={processingId}
              />
              <Pagination
                currentPage={pendingPage}
                totalPages={pendingTotalPages}
                totalCount={pendingData?.totalCount ?? 0}
                onPageChange={setPendingPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Lịch sử xử lý</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ReportTable
                data={historyData?.items ?? []}
                isLoading={historyLoading}
                showActions={false}
                onViewDetails={handleViewDetails}
                onNavigateToTarget={handleNavigateToTarget}
              />
              <Pagination
                currentPage={historyPage}
                totalPages={historyTotalPages}
                totalCount={historyData?.totalCount ?? 0}
                onPageChange={setHistoryPage}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ReportDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        targetId={selectedTarget?.targetId ?? null}
        targetType={selectedTarget?.targetType ?? null}
        targetName={selectedTarget?.targetName}
        onApprove={async (reportId) => {
          await approveReport.mutateAsync(reportId);
          toast.success('Đã duyệt báo cáo');
          refetchPending();
          refetchHistory();
        }}
        onReject={(reportId) => {
          setBulkRejectTarget(null);
          setSelectedTarget((prev) =>
            prev ? { ...prev, targetId: reportId, targetType: prev.targetType } : null,
          );
          // We need a single report reject - use existing modal
        }}
      />

      <RejectReasonModal
        open={isRejectOpen}
        onOpenChange={setIsRejectOpen}
        reportId={null}
        isBulk={true}
        bulkTarget={bulkRejectTarget}
        onSuccess={handleRejectSuccess}
        onError={(error) => toast.error(error.message)}
      />
    </div>
  );
}
