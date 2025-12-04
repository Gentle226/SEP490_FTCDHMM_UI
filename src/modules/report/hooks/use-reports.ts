'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { reportService } from '../services';
import { ReportFilterRequest } from '../types';

/**
 * Hook to fetch pending report summary with filters (GET /api/report)
 */
export const useReportSummary = (filters?: ReportFilterRequest) => {
  return useQuery({
    queryKey: ['reports', 'summary', filters],
    queryFn: () => reportService.getReportSummary(filters),
  });
};

/**
 * Hook to fetch report history (approved/rejected) with filters (GET /api/report/history)
 */
export const useReportHistory = (filters?: ReportFilterRequest) => {
  return useQuery({
    queryKey: ['reports', 'history', filters],
    queryFn: () => reportService.getReportHistory(filters),
  });
};

/**
 * Hook to fetch report details by target ID (GET /api/report/details/{targetId})
 */
export const useReportDetails = (targetId: string, targetType: string) => {
  return useQuery({
    queryKey: ['reports', 'details', targetId, targetType],
    queryFn: () => reportService.getReportDetails(targetId, targetType),
    enabled: !!targetId && !!targetType,
  });
};

/**
 * Hook to create a new report
 */
export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reportService.createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

/**
 * Hook to approve a report
 */
export const useApproveReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reportService.approveReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

/**
 * Hook to reject a report
 */
export const useRejectReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rejectReason }: { id: string; rejectReason: string }) =>
      reportService.rejectReport(id, rejectReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};
