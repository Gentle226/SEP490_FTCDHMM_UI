'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { Skeleton } from '@/base/components/ui/skeleton';

import { useApproveReport, useReportSummary } from '../hooks';
import { ReportFilterRequest } from '../types';
import { RejectReasonModal } from './RejectReasonModal';
import { ReportDetailModal } from './ReportDetailModal';
import { type ReportFilters, ReportFiltersComponent } from './ReportFilters';
import { ReportSummaryTable } from './ReportSummaryTable';

export function ReportManagementList() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [pendingRejectId, setPendingRejectId] = useState<string | null>(null);

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

  const handleViewReport = useCallback((id: string) => {
    setSelectedReportId(id);
    setIsDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedReportId(null);
  }, []);

  const handleApprove = useCallback(
    async (id: string) => {
      try {
        await approveReport.mutateAsync(id);
        toast.success('Đã duyệt báo cáo thành công');
        handleCloseDetail();
        refetch();
      } catch (_error) {
        toast.error('Không thể duyệt báo cáo');
      }
    },
    [approveReport, handleCloseDetail, refetch],
  );

  const handleRejectClick = useCallback((id: string) => {
    setPendingRejectId(id);
    setIsRejectOpen(true);
    setIsDetailOpen(false);
  }, []);

  const handleRejectSuccess = useCallback(() => {
    toast.success('Đã từ chối báo cáo thành công');
    setIsRejectOpen(false);
    setPendingRejectId(null);
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#99b94a]">Quản Lý Báo Cáo</h2>
          <p className="text-muted-foreground">Xem và xử lý các báo cáo từ người dùng</p>
        </div>
      </div>

      <ReportFiltersComponent
        filters={filters}
        onFiltersChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      <ReportSummaryTable
        data={reportSummary?.items ?? []}
        onView={(targetId) => handleViewReport(targetId)}
      />

      <ReportDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        reportId={selectedReportId}
        onApprove={handleApprove}
        onReject={handleRejectClick}
      />

      <RejectReasonModal
        open={isRejectOpen}
        onOpenChange={setIsRejectOpen}
        reportId={pendingRejectId}
        onSuccess={handleRejectSuccess}
      />
    </div>
  );
}
