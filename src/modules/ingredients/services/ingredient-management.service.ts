import { HttpClient } from '@/base/lib';

export interface Nutrient {
  id: string;
  vietnameseName?: string;
  unit?: string;
  min?: number;
  max?: number;
  median?: number;
}

export interface NutrientResponse {
  id: string;
  vietnameseName: string;
  unit: string;
  minValue?: number;
  maxValue?: number;
  medianValue?: number;
}

export interface NutrientInfo {
  id: string;
  vietnameseName: string;
  name?: string;
  unit: string;
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
  calories?: number;
  ingredientCategoryIds: string[];
  categoryNames?: string[];
  nutrients: Nutrient[];
  lastUpdatedUtc: string;
  createdAtUtc?: string;
  isNew?: boolean; // Indicates USDA-fetched ingredients needing moderator review
}

export interface IngredientApiResponse {
  id: string;
  name: string;
  description?: string;
  calories?: number;
  imageUrl?: string;
  lastUpdatedUtc: string;
  categories: IngredientCategory[];
  nutrients: NutrientResponse[];
  isNew?: boolean;
}

export interface IngredientDetectionResult {
  ingredient: string;
  confidence: number;
}

/**
 * Simple ingredient name response from USDA search
 */
export interface IngredientNameResponse {
  id: string;
  name: string;
}

/**
 * Capitalize the first letter of a string (for ingredient naming convention)
 * @example "quả táo" -> "Quả táo"
 */
export function capitalizeFirstLetter(text: string): string {
  if (!text || text.length === 0) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export interface IngredientListItemResponse {
  id: string;
  name: string;
  description?: string;
  calories?: number;
  lastUpdatedUtc: string;
  categoryNames: IngredientCategory[];
  isNew?: boolean; // Indicates USDA-fetched ingredients needing moderator review
}

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}

export interface IngredientsResponse {
  items: IngredientListItemResponse[];
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
   * Map API response to Ingredient interface
   */
  private mapApiResponse(apiResponse: IngredientApiResponse): Ingredient {
    return {
      id: apiResponse.id,
      name: apiResponse.name,
      description: apiResponse.description,
      image: apiResponse.imageUrl || '',
      ingredientCategoryIds: apiResponse.categories.map((c) => c.id),
      categoryNames: apiResponse.categories.map((c) => c.name),
      nutrients: apiResponse.nutrients.map((n) => ({
        id: n.id,
        vietnameseName: n.vietnameseName,
        unit: n.unit,
        min: n.minValue,
        max: n.maxValue,
        median: n.medianValue,
      })),
      lastUpdatedUtc: apiResponse.lastUpdatedUtc,
    };
  }

  /**
   * Get paginated ingredients
   */
  public async getIngredients(params: PaginationParams = {}) {
    const queryParams = new URLSearchParams();
    if (params.pageNumber)
      queryParams.append('PaginationParams.PageNumber', params.pageNumber.toString());
    if (params.pageSize)
      queryParams.append('PaginationParams.PageSize', params.pageSize.toString());
    if (params.search) queryParams.append('Keyword', params.search);

    const apiResponse = await this.get<IngredientsResponse>(
      `api/Ingredient?${queryParams.toString()}`,
      {
        isPrivateRoute: true,
      },
    );

    // Map API response to frontend interface
    return {
      ...apiResponse,
      items: apiResponse.items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        calories: item.calories,
        image: undefined, // List response doesn't include images
        ingredientCategoryIds: item.categoryNames?.map((cat) => cat.id) || [],
        categoryNames: item.categoryNames?.map((cat) => cat.name) || [],
        nutrients: [],
        lastUpdatedUtc: item.lastUpdatedUtc,
        isNew: item.isNew, // USDA-fetched ingredients needing moderator review
      })),
    };
  }

  /**
   * Get ingredient by ID
   */
  public async getIngredientById(id: string) {
    try {
      const apiResponse = await this.get<IngredientApiResponse>(`api/Ingredient/${id}`, {
        isPrivateRoute: true,
      });

      // Map API response to our interface
      return this.mapApiResponse(apiResponse);
    } catch (error) {
      console.warn('Error fetching ingredient:', error);
      throw error;
    }
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
      ingredientCategoryIds?: string[];
    },
  ) {
    const formData = new FormData();

    if (data.description !== undefined) {
      formData.append('Description', data.description);
    }

    // Only append image if it's a File object (new upload) or if we want to clear it
    if (data.image instanceof File) {
      formData.append('Image', data.image);
    } else if (data.image === null) {
      // If image is explicitly null, we might need to handle clearing it
      // This depends on backend implementation - for now we skip it
    }

    if (data.nutrients && data.nutrients.length > 0) {
      data.nutrients.forEach((nutrient, index) => {
        formData.append(`Nutrients[${index}].NutrientId`, nutrient.id);
        if (nutrient.min !== undefined && nutrient.min !== null) {
          formData.append(`Nutrients[${index}].Min`, nutrient.min.toString());
        }
        if (nutrient.max !== undefined && nutrient.max !== null) {
          formData.append(`Nutrients[${index}].Max`, nutrient.max.toString());
        }
        if (nutrient.median !== undefined && nutrient.median !== null) {
          formData.append(`Nutrients[${index}].Median`, nutrient.median.toString());
        }
      });
    }

    if (data.ingredientCategoryIds && data.ingredientCategoryIds.length > 0) {
      data.ingredientCategoryIds.forEach((categoryId) => {
        formData.append('IngredientCategoryIds', categoryId);
      });
    }

    return this.put<Ingredient>(`api/Ingredient/${id}`, formData, {
      isPrivateRoute: true,
    });
  }

  /**
   * Create new ingredient
   */
  public async createIngredient(data: {
    name: string;
    description?: string;
    image: File;
    nutrients: Nutrient[];
    ingredientCategoryIds: string[];
  }) {
    const formData = new FormData();

    formData.append('Name', data.name);

    if (data.description) {
      formData.append('Description', data.description);
    }

    if (data.image) {
      formData.append('Image', data.image);
    }

    if (data.nutrients && data.nutrients.length > 0) {
      data.nutrients.forEach((nutrient, index) => {
        formData.append(`Nutrients[${index}].NutrientId`, nutrient.id);
        if (nutrient.min !== undefined && nutrient.min !== null) {
          formData.append(`Nutrients[${index}].Min`, nutrient.min.toString());
        }
        if (nutrient.max !== undefined && nutrient.max !== null) {
          formData.append(`Nutrients[${index}].Max`, nutrient.max.toString());
        }
        if (nutrient.median !== undefined && nutrient.median !== null) {
          formData.append(`Nutrients[${index}].Median`, nutrient.median.toString());
        }
      });
    }

    if (data.ingredientCategoryIds && data.ingredientCategoryIds.length > 0) {
      data.ingredientCategoryIds.forEach((categoryId) => {
        formData.append('IngredientCategoryIds', categoryId);
      });
    }

    return this.post<Ingredient>(`api/Ingredient`, formData, {
      isPrivateRoute: true,
    });
  }

  async deleteIngredient(id: string): Promise<void> {
    return this.delete<void>(`api/Ingredient/${id}`, {
      isPrivateRoute: true,
    });
  }

  async detectIngredientsFromImage(imageFile: File): Promise<IngredientDetectionResult[]> {
    const formData = new FormData();
    formData.append('Image', imageFile);

    return this.post<IngredientDetectionResult[]>(`api/Ingredient/detect-gemini`, formData, {
      isPrivateRoute: true,
    });
  }

  /**
   * Search ingredients for recipe creation (includes USDA fetching if not found locally)
   * This endpoint will search local database first, and if not found,
   * it will fetch from USDA, translate to Vietnamese, and create the ingredient
   * @param keyword - Search keyword (will be capitalized on the frontend)
   */
  async searchForRecipe(keyword: string): Promise<IngredientNameResponse[]> {
    if (!keyword || keyword.trim().length < 2) {
      return [];
    }

    // Capitalize the first letter to match naming convention
    const normalizedKeyword = capitalizeFirstLetter(keyword.trim());

    return this.get<IngredientNameResponse[]>(
      `api/Ingredient/getForRecipe?keyword=${encodeURIComponent(normalizedKeyword)}`,
      {
        isPrivateRoute: true,
      },
    );
  }
}

export const ingredientManagementService = new IngredientManagementService();
