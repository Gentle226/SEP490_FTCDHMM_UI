import { HttpClient } from '@/base/lib';

export interface Label {
  id: string;
  name: string;
  colorCode: string;
}

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  keyword?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export interface CreateLabelRequest {
  name: string;
  colorCode: string;
}

export interface UpdateColorCodeRequest {
  colorCode: string;
}

class LabelManagementService extends HttpClient {
  constructor() {
    super();
  }

  public async getLabels(params: PaginationParams = {}) {
    const queryParams = new URLSearchParams();
    if (params.pageNumber)
      queryParams.append('PaginationParams.PageNumber', params.pageNumber.toString());
    if (params.pageSize)
      queryParams.append('PaginationParams.PageSize', params.pageSize.toString());
    if (params.keyword) queryParams.append('Keyword', params.keyword);

    return this.get<PaginatedResponse<Label>>(`api/Label/getListFilter?${queryParams}`, {
      isPrivateRoute: true,
    });
  }

  public async createLabel(request: CreateLabelRequest) {
    return this.post<void>('api/Label', request, {
      isPrivateRoute: true,
    });
  }

  public async deleteLabel(id: string) {
    return this.delete<void>(`api/Label/${id}`, {
      isPrivateRoute: true,
    });
  }

  public async updateColorCode(id: string, request: UpdateColorCodeRequest) {
    return this.put<void>(`api/Label/${id}/colorCode`, request, {
      isPrivateRoute: true,
    });
  }

  public async updateLabel(id: string, request: CreateLabelRequest) {
    return this.put<void>(`api/Label/${id}`, request, {
      isPrivateRoute: true,
    });
  }
}

export const labelManagementService = new LabelManagementService();
