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

// Response DTOs
export interface ReportResponse {
  id: string;
  targetId: string;
  targetType: ReportTargetType;
  targetName: string;
  description: string;
  reporterId: string;
  reporterName: string;
  status: ReportStatus;
  createdAtUtc: string;
  rejectReason?: string;
}

export interface ReportSummaryResponse {
  targetType: ReportTargetType;
  targetId: string;
  targetName: string;
  count: number;
  latestReportAtUtc: string;
}

export interface ReportSummaryPagedResult {
  items: ReportSummaryResponse[];
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
