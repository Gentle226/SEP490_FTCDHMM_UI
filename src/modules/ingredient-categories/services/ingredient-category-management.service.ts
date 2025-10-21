import { HttpClient } from '@/base/lib';

export interface IngredientCategory {
  id: string;
  name: string;
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

export interface CreateIngredientCategoryRequest {
  name: string;
}

class IngredientCategoryManagementService extends HttpClient {
  constructor() {
    super();
  }

  public async getCategories(params: PaginationParams = {}) {
    const queryParams = new URLSearchParams();
    if (params.pageNumber)
      queryParams.append('PaginationParams.PageNumber', params.pageNumber.toString());
    if (params.pageSize)
      queryParams.append('PaginationParams.PageSize', params.pageSize.toString());
    if (params.keyword) queryParams.append('Keyword', params.keyword);

    return this.get<PaginatedResponse<IngredientCategory>>(
      `api/IngredientCategory/getListFilter?${queryParams}`,
      {
        isPrivateRoute: true,
      },
    );
  }

  public async createCategory(request: CreateIngredientCategoryRequest) {
    return this.post<void>('api/IngredientCategory', request, {
      isPrivateRoute: true,
    });
  }

  public async deleteCategory(id: string) {
    return this.delete<void>(`api/IngredientCategory/${id}`, {
      isPrivateRoute: true,
    });
  }
}

export const ingredientCategoryManagementService = new IngredientCategoryManagementService();
