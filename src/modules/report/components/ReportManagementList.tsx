'use client';

import { AlertTriangle } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Skeleton } from '@/base/components/ui/skeleton';

import { useApproveReport, useReportSummary } from '../hooks';
import { reportService } from '../services';
import { ReportFilterRequest, ReportStatus, ReportTargetType } from '../types';
import { ExpandableReportTable } from './ExpandableReportTable';
import { RejectReasonModal } from './RejectReasonModal';
import { type ReportFilters, ReportFiltersComponent } from './ReportFilters';

export function ReportManagementList() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [pendingRejectId, setPendingRejectId] = useState<string | null>(null);
  const [isBulkReject, setIsBulkReject] = useState(false);
  const [bulkRejectTarget, setBulkRejectTarget] = useState<{
    targetId: string;
    targetType: ReportTargetType;
  } | null>(null);

  // Convert ReportFilters to ReportFilterRequest for the API
  const apiFilters: ReportFilterRequest = {
    type: filters.type,
    status: filters.status,
    keyword: filters.keyword,
  };

  const { data: reportSummary, isLoading, refetch } = useReportSummary(apiFilters);
  const approveReport = useApproveReport();

  const handleFilterChange = useCallback((newFilters: ReportFilters) => {
    setFilters(newFilters);
  }, []);

  const handleFilterReset = useCallback(() => {
    setFilters({});
  }, []);

  const handleApproveReport = useCallback(
    async (reportId: string) => {
      try {
        await approveReport.mutateAsync(reportId);
        toast.success('Đã duyệt báo cáo thành công');
        refetch();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Không thể duyệt báo cáo';
        toast.error(errorMessage);
      }
    },
    [approveReport, refetch],
  );

  const handleRejectReport = useCallback((reportId: string) => {
    setPendingRejectId(reportId);
    setIsBulkReject(false);
    setBulkRejectTarget(null);
    setIsRejectOpen(true);
  }, []);

  const handleApproveAll = useCallback(
    async (targetId: string, _targetType: ReportTargetType) => {
      try {
        toast.info('Đang xử lý duyệt tất cả báo cáo...');

        // Fetch all reports for this target
        const reports = await reportService.getReportsByTargetId(targetId);
        const pendingReports = reports.filter((r) => r.status === ReportStatus.PENDING);

        if (pendingReports.length === 0) {
          toast.warning('Không có báo cáo nào đang chờ xử lý');
          return;
        }

        // Approve all pending reports
        await Promise.all(pendingReports.map((report) => reportService.approveReport(report.id)));

        toast.success(`Đã duyệt ${pendingReports.length} báo cáo thành công`);
        refetch();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Không thể duyệt tất cả báo cáo';
        toast.error(errorMessage);
      }
    },
    [refetch],
  );

  const handleRejectAll = useCallback((targetId: string, targetType: ReportTargetType) => {
    setBulkRejectTarget({ targetId, targetType });
    setIsBulkReject(true);
    setPendingRejectId(null);
    setIsRejectOpen(true);
  }, []);

  const handleRejectSuccess = useCallback(() => {
    toast.success('Đã từ chối báo cáo thành công');
    setIsRejectOpen(false);
    setPendingRejectId(null);
    setIsBulkReject(false);
    setBulkRejectTarget(null);
    refetch();
  }, [refetch]);

  const handleRejectError = useCallback((error: Error) => {
    toast.error(error.message || 'Không thể từ chối báo cáo');
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-3">
      <div className="animate-in fade-in slide-in-from-top-4 flex flex-col gap-2 duration-500">
        <div className="flex items-center gap-3">
          <div className="animate-in zoom-in flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#99b94a] to-[#8aab3b] shadow-lg delay-100 duration-300">
            <AlertTriangle className="size-6 text-white" />
          </div>
          <div className="animate-in fade-in slide-in-from-left-4 delay-150 duration-500">
            <h2 className="bg-gradient-to-r from-[#99b94a] to-[#7a9a35] bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              Quản Lý Báo Cáo
            </h2>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Xem và xử lý các báo cáo từ người dùng
            </p>
          </div>
        </div>
      </div>

      <ReportFiltersComponent
        filters={filters}
        onFiltersChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      <ExpandableReportTable
        data={reportSummary?.items ?? []}
        isLoading={isLoading}
        onApproveReport={handleApproveReport}
        onRejectReport={handleRejectReport}
        onApproveAll={handleApproveAll}
        onRejectAll={handleRejectAll}
      />

      <RejectReasonModal
        open={isRejectOpen}
        onOpenChange={setIsRejectOpen}
        reportId={pendingRejectId}
        isBulk={isBulkReject}
        bulkTarget={bulkRejectTarget}
        onSuccess={handleRejectSuccess}
        onError={handleRejectError}
      />
    </div>
  );
}
