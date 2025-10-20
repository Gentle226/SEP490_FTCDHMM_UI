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
  categoryNames?: string[];
  nutrients: Nutrient[];
  lastUpdatedUtc: string;
  createdAtUtc: string;
}

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}

export interface IngredientsResponse {
  items: Ingredient[];
  totalCount: number;
  pageNumber: number;
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
    const queryParams = new URLSearchParams();
    if (params.pageNumber) queryParams.append('PaginationParams.PageNumber', params.pageNumber.toString());
    if (params.pageSize)
      queryParams.append('PaginationParams.PageSize', params.pageSize.toString());
    if (params.search) queryParams.append('Keyword', params.search);

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

  /**
   * Update ingredient
   */
  public async updateIngredient(
    id: string,
    data: {
      description?: string;
      image?: File | string;
      nutrients?: Nutrient[];
    },
  ) {
    const formData = new FormData();

    if (data.description !== undefined) {
      formData.append('Description', data.description);
    }

    if (data.image instanceof File) {
      formData.append('Image', data.image);
    }

    if (data.nutrients && data.nutrients.length > 0) {
      data.nutrients.forEach((nutrient, index) => {
        formData.append(`Nutrients[${index}].name`, nutrient.name);
        if (nutrient.min !== undefined) {
          formData.append(`Nutrients[${index}].min`, nutrient.min.toString());
        }
        if (nutrient.max !== undefined) {
          formData.append(`Nutrients[${index}].max`, nutrient.max.toString());
        }
        if (nutrient.median !== undefined) {
          formData.append(`Nutrients[${index}].median`, nutrient.median.toString());
        }
      });
    }

    return this.put<Ingredient>(`api/Ingredient/${id}`, formData, {
      isPrivateRoute: true,
    });
  }
}

export const ingredientManagementService = new IngredientManagementService();
