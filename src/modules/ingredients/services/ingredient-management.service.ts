import { HttpClient } from '@/base/lib';

export interface Nutrient {
  id: string; // Nutrient ID from the API
  vietnameseName?: string; // Nutrient name in Vietnamese (from detail API)
  min?: number;
  max?: number;
  median?: number;
}

export interface NutrientResponse {
  name: string;
  unit: string;
  min?: number;
  max?: number;
  median?: number;
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
  ingredientCategoryIds: string[];
  categoryNames?: string[];
  nutrients: Nutrient[];
  lastUpdatedUtc: string;
  createdAtUtc?: string;
}

export interface IngredientApiResponse {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  lastUpdatedUtc: string;
  categories: IngredientCategory[];
  nutrients: NutrientResponse[];
}

export interface IngredientListItemResponse {
  id: string;
  name: string;
  description?: string;
  lastUpdatedUtc: string;
  categoryNames: IngredientCategory[];
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
  private mapApiResponse(
    apiResponse: IngredientApiResponse,
    allNutrients: NutrientInfo[] = [],
  ): Ingredient {
    // Create a mapping from English nutrient names to Vietnamese names
    const englishToVietnameseName: { [key: string]: string } = {
      Protein: 'Chất đạm',
      Calories: 'Năng lượng',
      Fat: 'Tổng chất béo',
      Carbohydrate: 'Tinh bột',
    };

    return {
      id: apiResponse.id,
      name: apiResponse.name,
      description: apiResponse.description,
      image: apiResponse.imageUrl || '',
      ingredientCategoryIds: apiResponse.categories.map((c) => c.id),
      categoryNames: apiResponse.categories.map((c) => c.name),
      nutrients: apiResponse.nutrients.map((n) => {
        // Try to find nutrient by Vietnamese name
        const vietnameseName = englishToVietnameseName[n.name] || n.name;
        const nutrientInfo = allNutrients.find((nut) => nut.vietnameseName === vietnameseName);
        const nutrientId = nutrientInfo?.id || n.name;

        return {
          id: nutrientId,
          vietnameseName: vietnameseName,
          min: n.min,
          max: n.max,
          median: n.median,
        };
      }),
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
        image: undefined, // List response doesn't include images
        ingredientCategoryIds: item.categoryNames?.map((cat) => cat.id) || [],
        categoryNames: item.categoryNames?.map((cat) => cat.name) || [],
        nutrients: [],
        lastUpdatedUtc: item.lastUpdatedUtc,
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

      // Get all nutrients to map nutrient names to IDs
      const allNutrients = await this.getNutrientsList();

      // Map API response to our interface
      return this.mapApiResponse(apiResponse, allNutrients);
    } catch (error) {
      console.warn('Error fetching ingredient:', error);
      throw error;
    }
  }

  /**
   * Get all nutrients (for mapping purposes)
   */
  private async getNutrientsList(): Promise<NutrientInfo[]> {
    try {
      return await this.get<NutrientInfo[]>('api/Nutrient', {
        isPrivateRoute: true,
      });
    } catch (error) {
      console.warn('Error fetching nutrients:', error);
      return [];
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
}

export const ingredientManagementService = new IngredientManagementService();
