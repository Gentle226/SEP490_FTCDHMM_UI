import { HttpClient } from '@/base/lib';

import type {
  ApproveReportResponse,
  CreateReportRequest,
  ReportFilterRequest,
  ReportMessageResponse,
  ReportResponse,
  ReportSummaryPagedResult,
} from '../types';

const httpClient = new HttpClient();

const REPORT_BASE_URL = '/api/report';

/**
 * Create a new report
 */
export async function createReport(request: CreateReportRequest): Promise<ReportMessageResponse> {
  return httpClient.post<ReportMessageResponse>(REPORT_BASE_URL, request, {
    isPrivateRoute: true,
  });
}

/**
 * Get report by ID (Admin only)
 */
export async function getReportById(id: string): Promise<ReportResponse> {
  return httpClient.get<ReportResponse>(`${REPORT_BASE_URL}/${id}`, {
    isPrivateRoute: true,
  });
}

/**
 * Get report summary with pagination and filters (Admin only)
 */
export async function getReportSummary(
  request: ReportFilterRequest = {},
): Promise<ReportSummaryPagedResult> {
  const params = new URLSearchParams();

  if (request.paginationParams?.pageNumber) {
    params.append('PaginationParams.PageNumber', request.paginationParams.pageNumber.toString());
  }
  if (request.paginationParams?.pageSize) {
    params.append('PaginationParams.PageSize', request.paginationParams.pageSize.toString());
  }
  if (request.type) {
    params.append('Type', request.type);
  }
  if (request.status) {
    params.append('Status', request.status);
  }
  if (request.keyword) {
    params.append('Keyword', request.keyword);
  }

  const queryString = params.toString();
  const url = queryString
    ? `${REPORT_BASE_URL}/summary?${queryString}`
    : `${REPORT_BASE_URL}/summary`;

  return httpClient.get<ReportSummaryPagedResult>(url, {
    isPrivateRoute: true,
  });
}

/**
 * Approve a report (Admin only)
 */
export async function approveReport(id: string): Promise<ApproveReportResponse> {
  return httpClient.post<ApproveReportResponse>(`${REPORT_BASE_URL}/${id}/approve`, undefined, {
    isPrivateRoute: true,
  });
}

/**
 * Reject a report with reason (Admin only)
 */
export async function rejectReport(id: string, reason: string): Promise<ReportMessageResponse> {
  return httpClient.post<ReportMessageResponse>(
    `${REPORT_BASE_URL}/${id}/reject`,
    { reason },
    {
      isPrivateRoute: true,
    },
  );
}

export const reportService = {
  createReport,
  getReportById,
  getReportSummary,
  approveReport,
  rejectReport,
};
