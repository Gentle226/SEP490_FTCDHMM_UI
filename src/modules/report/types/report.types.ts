// Report Target Types
export const ReportTargetType = {
  RECIPE: 'RECIPE',
  USER: 'USER',
  COMMENT: 'COMMENT',
  RATING: 'RATING',
} as const;

export type ReportTargetType = (typeof ReportTargetType)[keyof typeof ReportTargetType];

// Report Status
export const ReportStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

// Request DTOs
export interface CreateReportRequest {
  targetId: string;
  targetType: ReportTargetType;
  description?: string;
}

export interface RejectReportRequest {
  reason: string;
}

export interface ReportFilterRequest {
  paginationParams?: {
    pageNumber?: number;
    pageSize?: number;
  };
  type?: ReportTargetType | null;
  status?: ReportStatus | null;
  keyword?: string | null;
}

// Response DTOs - Individual report detail item
export interface ReportDetailItem {
  reportId: string;
  reporterName: string;
  description: string;
  status: ReportStatus;
  createdAtUtc: string;
  rejectReason?: string;
}

// Response DTOs - Detail list response from GET /api/report/details/{targetId}
export interface ReportDetailListResponse {
  targetId: string;
  targetUserName?: string;
  targetType: string;
  targetName: string;
  reports: ReportDetailItem[];
}

// Response DTOs - Summary response for list views
export interface ReportsResponse {
  targetType: ReportTargetType;
  targetId: string;
  targetUserName?: string;
  recipeId?: string;
  targetName: string;
  count: number;
  latestReportAtUtc: string;
}

export interface ReportSummaryPagedResult {
  items: ReportsResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface ApproveReportResponse {
  targetType: ReportTargetType;
  targetId: string;
}

export interface ReportMessageResponse {
  message: string;
}
