import { HttpClient } from '@/base/lib';

export interface IngredientListItem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  categoryNames: Array<{ id: string; name: string }>;
  lastUpdatedUtc: string;
  isNew: boolean;
}

export interface IngredientsPublicResponse {
  items: IngredientListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface IngredientDetailsResponse {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  lastUpdatedUtc: string;
  isNew: boolean;
  categories: Array<{ id: string; name: string }>;
  nutrients: Array<{
    name: string;
    vietnameseName?: string;
    unit: string;
    minValue?: number;
    maxValue?: number;
    medianValue?: number;
  }>;
}

export interface IngredientSearchParams {
  pageNumber?: number;
  pageSize?: number;
  keyword?: string;
  categoryIds?: string[];
  updatedFrom?: string;
  updatedTo?: string;
}

class IngredientPublicService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Get paginated ingredients for public display
   */
  public async getIngredients(params: IngredientSearchParams = {}) {
    const queryParams = new URLSearchParams();
    if (params.pageNumber)
      queryParams.append('PaginationParams.PageNumber', params.pageNumber.toString());
    if (params.pageSize)
      queryParams.append('PaginationParams.PageSize', params.pageSize.toString());
    if (params.keyword) queryParams.append('Keyword', params.keyword);
    if (params.categoryIds) {
      params.categoryIds.forEach((id) => queryParams.append('CategoryIds', id));
    }
    if (params.updatedFrom) queryParams.append('UpdatedFrom', params.updatedFrom);
    if (params.updatedTo) queryParams.append('UpdatedTo', params.updatedTo);

    return await this.get<IngredientsPublicResponse>(`api/Ingredient?${queryParams.toString()}`, {
      isPrivateRoute: false,
    });
  }

  /**
   * Get ingredient details by ID (includes imageUrl)
   */
  public async getIngredientById(id: string) {
    return await this.get<IngredientDetailsResponse>(`api/Ingredient/${id}`, {
      isPrivateRoute: false,
    });
  }

  /**
   * Get ingredients with details (including imageUrl) for featured display
   */
  public async getIngredientDetailsForHomepage(ingredientIds: string[]) {
    try {
      const detailedIngredients = await Promise.all(
        ingredientIds.map((id) => this.getIngredientById(id)),
      );
      return detailedIngredients;
    } catch (error) {
      console.warn('Error fetching ingredient details:', error);
      return [];
    }
  }
}

export const ingredientPublicService = new IngredientPublicService();
