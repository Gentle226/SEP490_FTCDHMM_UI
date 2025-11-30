'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { reportService } from '../services';
import { ReportFilterRequest } from '../types';

/**
 * Hook to fetch report summary with filters
 */
export const useReportSummary = (filters?: ReportFilterRequest) => {
  return useQuery({
    queryKey: ['reports', 'summary', filters],
    queryFn: () => reportService.getReportSummary(filters),
  });
};

/**
 * Hook to fetch a specific report by ID
 */
export const useReport = (id: string) => {
  return useQuery({
    queryKey: ['reports', id],
    queryFn: () => reportService.getReportById(id),
    enabled: !!id,
  });
};

/**
 * Hook to fetch reports by target ID
 */
export const useReportsByTargetId = (targetId: string) => {
  return useQuery({
    queryKey: ['reports', 'target', targetId],
    queryFn: () => reportService.getReportsByTargetId(targetId),
    enabled: !!targetId,
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
