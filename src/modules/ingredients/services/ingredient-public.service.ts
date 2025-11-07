import { HttpClient } from '@/base/lib';

export interface IngredientListItem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  categoryNames: Array<{ id: string; name: string }>;
  lastUpdatedUtc: string;
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
  categories: Array<{ id: string; name: string }>;
  nutrients: Array<{
    name: string;
    unit: string;
    minValue?: number;
    maxValue?: number;
    medianValue?: number;
  }>;
}

class IngredientPublicService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Get paginated ingredients for public display
   */
  public async getIngredients(
    params: {
      pageNumber?: number;
      pageSize?: number;
      search?: string;
    } = {},
  ) {
    const queryParams = new URLSearchParams();
    if (params.pageNumber)
      queryParams.append('PaginationParams.PageNumber', params.pageNumber.toString());
    if (params.pageSize)
      queryParams.append('PaginationParams.PageSize', params.pageSize.toString());
    if (params.search) queryParams.append('Keyword', params.search);

    return await this.get<IngredientsPublicResponse>(`api/Ingredient?${queryParams.toString()}`, {
      isPrivateRoute: true,
    });
  }

  /**
   * Get ingredient details by ID (includes imageUrl)
   */
  public async getIngredientById(id: string) {
    return await this.get<IngredientDetailsResponse>(`api/Ingredient/${id}`, {
      isPrivateRoute: true,
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
