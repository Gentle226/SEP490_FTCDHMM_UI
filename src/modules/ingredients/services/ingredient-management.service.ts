import { HttpClient } from '@/base/lib';

export interface Nutrient {
  name: string;
  min?: number;
  max?: number;
  median?: number;
}

export interface IngredientCategory {
  id: string;
  name: string;
}

export interface Ingredient {
  id: string;
  name: string;
  description?: string;
  image?: string;
  ingredientCategoryIds: string[];
  categoryNames?: string[]; // Populated from categories
  nutrients: Nutrient[];
  lastUpdatedUtc: string;
  createdAtUtc: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface IngredientsResponse {
  items: Ingredient[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class IngredientManagementService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Get paginated ingredients
   */
  public async getIngredients(params: PaginationParams = {}) {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      pageSize: (params.pageSize || 10).toString(),
      ...(params.search && { search: params.search }),
    });

    return this.get<IngredientsResponse>(`api/Ingredient?${queryParams.toString()}`, {
      isPrivateRoute: true,
    });
  }

  /**
   * Get ingredient by ID
   */
  public async getIngredientById(id: string) {
    return this.get<Ingredient>(`api/Ingredient/${id}`, {
      isPrivateRoute: true,
    });
  }

  /**
   * Get all ingredient categories
   */
  public async getCategories() {
    return this.get<IngredientCategory[]>('api/IngredientCategory', {
      isPrivateRoute: true,
    });
  }
}

export const ingredientManagementService = new IngredientManagementService();
