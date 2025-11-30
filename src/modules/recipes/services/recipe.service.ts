import { HttpClient } from '@/base/lib';

import {
  CreateRecipeRequest,
  DraftRecipeRequest,
  DraftRecipeResponse,
  MyRecipeResponse,
  Recipe,
  RecipeDetail,
} from '../types';
import { RatingResponse } from '../types/rating.types';

interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

interface RecipeSearchParams extends PaginationParams {
  keyword?: string;
  difficulty?: string;
  sortBy?: string;
  ration?: number;
  maxCookTime?: number;
  labelIds?: string[];
  ingredientIds?: string[];
}

class RecipeService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Get my recipes (recipes created by the current user)
   */
  public async getMyRecipes(params: PaginationParams = {}) {
    const { pageNumber = 1, pageSize = 12 } = params;

    return this.get<MyRecipeResponse>('api/Recipe/myRecipe', {
      isPrivateRoute: true,
      params: {
        PageNumber: pageNumber,
        PageSize: pageSize,
      },
    });
  }

  /**
   * Get recipes by user name (for viewing other users' recipes)
   * Note: Changed from userId to userName to match API endpoint change
   */
  public async getRecipesByUserName(userName: string, params: PaginationParams = {}) {
    const { pageNumber = 1, pageSize = 12 } = params;

    return this.get<MyRecipeResponse>(`api/Recipe/user/${userName}`, {
      isPrivateRoute: false,
      params: {
        PageNumber: pageNumber,
        PageSize: pageSize,
      },
    });
  }

  /**
   * Get recipe by ID
   */
  public async getRecipeById(recipeId: string) {
    return this.get<RecipeDetail>(`api/Recipe/${recipeId}`, {
      isPrivateRoute: true,
    });
  }

  /**
   * Create a new recipe
   */
  public async createRecipe(data: CreateRecipeRequest) {
    const formData = new FormData();

    // Required fields
    formData.append('Name', data.name);
    formData.append('Difficulty', data.difficulty);
    formData.append('Ration', String(Math.floor(data.ration))); // Ensure integer

    // Optional fields
    if (data.description) {
      formData.append('Description', data.description);
    }

    // CookTime - send as number string (API expects number type)
    formData.append('CookTime', String(data.cookTime));

    // Image - send as IFormFile
    if (data.image) {
      formData.append('Image', data.image);
    }

    // Append array fields (LabelIds and Ingredients)
    if (data.labelIds && data.labelIds.length > 0) {
      data.labelIds.forEach((id) => {
        formData.append('LabelIds', id);
      });
    }

    if (data.ingredients && data.ingredients.length > 0) {
      data.ingredients.forEach((ingredient, index) => {
        formData.append(`Ingredients[${index}].IngredientId`, ingredient.ingredientId);
        formData.append(`Ingredients[${index}].QuantityGram`, String(ingredient.quantityGram));
      });
    }

    // Append cooking steps with correct field names (StepOrder and Instruction)
    if (data.cookingSteps && data.cookingSteps.length > 0) {
      data.cookingSteps.forEach((step, index) => {
        formData.append(`CookingSteps[${index}].StepOrder`, String(step.stepOrder));
        formData.append(`CookingSteps[${index}].Instruction`, step.instruction);

        // Handle multiple images per step
        if (step.images && step.images.length > 0) {
          step.images.forEach((img, imgIndex) => {
            if (img.image instanceof File) {
              formData.append(`CookingSteps[${index}].Images[${imgIndex}].Image`, img.image);
              formData.append(
                `CookingSteps[${index}].Images[${imgIndex}].ImageOrder`,
                String(img.imageOrder),
              );
            }
          });
        }
      });
    }

    // Append tagged user IDs
    if (data.taggedUserIds && data.taggedUserIds.length > 0) {
      data.taggedUserIds.forEach((userId, index) => {
        formData.append(`TaggedUserIds[${index}].UserId`, userId);
      });
    }

    return this.post<Recipe>('api/Recipe', formData, {
      isPrivateRoute: true,
    });
  }

  /**
   * Update an existing recipe
   */
  public async updateRecipe(recipeId: string, data: CreateRecipeRequest) {
    const formData = new FormData();

    // Required fields
    formData.append('Name', data.name);
    formData.append('Difficulty', data.difficulty);
    formData.append('Ration', String(Math.floor(data.ration))); // Ensure integer

    // Optional fields
    if (data.description) {
      formData.append('Description', data.description);
    }

    // CookTime - send as number string (API expects number type)
    formData.append('CookTime', String(data.cookTime));

    // Image - send as IFormFile (only if new image is uploaded)
    if (data.image) {
      formData.append('Image', data.image);
    }

    // Append array fields (LabelIds and Ingredients)
    if (data.labelIds && data.labelIds.length > 0) {
      data.labelIds.forEach((id) => {
        formData.append('LabelIds', id);
      });
    }

    if (data.ingredients && data.ingredients.length > 0) {
      data.ingredients.forEach((ingredient, index) => {
        formData.append(`Ingredients[${index}].IngredientId`, ingredient.ingredientId);
        formData.append(`Ingredients[${index}].QuantityGram`, String(ingredient.quantityGram));
      });
    }

    // Append cooking steps with correct field names (StepOrder and Instruction)
    if (data.cookingSteps && data.cookingSteps.length > 0) {
      data.cookingSteps.forEach((step, index) => {
        formData.append(`CookingSteps[${index}].StepOrder`, String(step.stepOrder));
        formData.append(`CookingSteps[${index}].Instruction`, step.instruction);

        // Handle multiple images per step
        if (step.images && step.images.length > 0) {
          step.images.forEach((img, imgIndex) => {
            if (img.image instanceof File) {
              // New image upload
              formData.append(`CookingSteps[${index}].Images[${imgIndex}].Image`, img.image);
              formData.append(
                `CookingSteps[${index}].Images[${imgIndex}].ImageOrder`,
                String(img.imageOrder),
              );
            } else if (img.id) {
              // Existing image - send the image ID to keep it
              formData.append(`CookingSteps[${index}].Images[${imgIndex}].ExistingImageId`, img.id);
              formData.append(
                `CookingSteps[${index}].Images[${imgIndex}].ImageOrder`,
                String(img.imageOrder),
              );
            }
          });
        }
      });
    }

    // Append tagged user IDs
    if (data.taggedUserIds && data.taggedUserIds.length > 0) {
      data.taggedUserIds.forEach((userId, index) => {
        formData.append(`TaggedUserIds[${index}]`, userId);
      });
    }

    return this.put<Recipe>(`api/Recipe/${recipeId}`, formData, {
      isPrivateRoute: true,
    });
  }

  /**
   * Delete a recipe
   */
  public async deleteRecipe(recipeId: string) {
    return this.delete<void>(`api/Recipe/${recipeId}`, {
      isPrivateRoute: true,
    });
  }

  /**
   * Get favorite recipes
   */
  public async getFavoriteRecipes(params: PaginationParams & { keyword?: string } = {}) {
    const { pageNumber = 1, pageSize = 10, keyword } = params;

    return this.get<MyRecipeResponse>('api/recipe/favorites', {
      isPrivateRoute: true,
      params: {
        'PaginationParams.PageNumber': pageNumber,
        'PaginationParams.PageSize': pageSize,
        ...(keyword && { Keyword: keyword }),
      },
    });
  }

  /**
   * Get saved recipes
   */
  public async getSavedRecipes(params: PaginationParams & { keyword?: string } = {}) {
    const { pageNumber = 1, pageSize = 10, keyword } = params;

    return this.get<MyRecipeResponse>('api/recipe/saved', {
      isPrivateRoute: true,
      params: {
        'PaginationParams.PageNumber': pageNumber,
        'PaginationParams.PageSize': pageSize,
        ...(keyword && { Keyword: keyword }),
      },
    });
  }

  /**
   * Add recipe to favorites
   */
  public async addToFavorite(recipeId: string) {
    return this.post<void>(`api/Recipe/${recipeId}/favorite`, null, {
      isPrivateRoute: true,
    });
  }

  /**
   * Remove recipe from favorites
   */
  public async removeFromFavorite(recipeId: string) {
    return this.delete<void>(`api/Recipe/${recipeId}/favorite`, {
      isPrivateRoute: true,
    });
  }

  /**
   * Save recipe
   */
  public async saveRecipe(recipeId: string) {
    return this.post<void>(`api/Recipe/${recipeId}/save`, null, {
      isPrivateRoute: true,
    });
  }

  /**
   * Unsave recipe
   */
  public async unsaveRecipe(recipeId: string) {
    return this.delete<void>(`api/Recipe/${recipeId}/save`, {
      isPrivateRoute: true,
    });
  }

  /**
   * Get recipe history (viewed recipes)
   */
  public async getHistory(params: PaginationParams & { keyword?: string } = {}) {
    const { pageNumber = 1, pageSize = 10 } = params;

    return this.get<MyRecipeResponse>('api/Recipe/history', {
      isPrivateRoute: true,
      params: {
        'PaginationParams.PageNumber': pageNumber,
        'PaginationParams.PageSize': pageSize,
      },
    });
  }

  /**
   * Search recipes by keyword with optional filters
   */
  public async searchRecipes(params: RecipeSearchParams = {}) {
    const {
      keyword = '',
      pageNumber = 1,
      pageSize = 10,
      difficulty,
      sortBy,
      ration,
      maxCookTime,
      labelIds,
      ingredientIds,
    } = params;

    const queryParams: Record<string, string | number> = {
      Keyword: keyword,
      'PaginationParams.PageNumber': pageNumber,
      'PaginationParams.PageSize': pageSize,
    };

    if (difficulty) {
      queryParams.Difficulty = difficulty;
    }

    if (sortBy) {
      queryParams.SortBy = sortBy;
    }

    if (ration !== undefined) {
      queryParams.Ration = ration;
    }

    if (maxCookTime !== undefined) {
      queryParams.MaxCookTime = maxCookTime;
    }

    if (labelIds && labelIds.length > 0) {
      labelIds.forEach((id, index) => {
        queryParams[`LabelIds[${index}]`] = id;
      });
    }

    if (ingredientIds && ingredientIds.length > 0) {
      ingredientIds.forEach((id, index) => {
        queryParams[`IngredientIds[${index}]`] = id;
      });
    }

    return this.get<MyRecipeResponse>('api/Recipe', {
      isPrivateRoute: false,
      params: queryParams,
    });
  }

  /**
   * Get recipe ratings and feedback
   */
  public async getRecipeRatings(recipeId: string, params: PaginationParams = {}) {
    const { pageNumber = 1, pageSize = 10 } = params;

    return this.get<{
      items: RatingResponse[];
      totalCount: number;
      pageNumber: number;
      pageSize: number;
    }>(`api/Recipe/${recipeId}/rating`, {
      isPrivateRoute: false,
      params: {
        PageNumber: pageNumber,
        PageSize: pageSize,
      },
    });
  }

  /**
   * Get user's draft recipe
   */
  public async getDraft() {
    return this.get<DraftRecipeResponse>('api/Draft', {
      isPrivateRoute: true,
    });
  }

  /**
   * Save or update draft recipe
   */
  public async saveDraft(data: DraftRecipeRequest) {
    const formData = new FormData();

    // Required fields
    formData.append('Difficulty', data.difficulty);
    formData.append('CookTime', String(data.cookTime));

    // Optional fields
    if (data.name) {
      formData.append('Name', data.name);
    }

    if (data.description) {
      formData.append('Description', data.description);
    }

    if (data.ration) {
      formData.append('Ration', String(data.ration));
    }

    // Image - send as IFormFile
    if (data.image) {
      formData.append('Image', data.image);
    }

    // Append array fields (LabelIds and Ingredients)
    if (data.labelIds && data.labelIds.length > 0) {
      data.labelIds.forEach((id) => {
        formData.append('LabelIds', id);
      });
    }

    if (data.ingredients && data.ingredients.length > 0) {
      data.ingredients.forEach((ingredient, index) => {
        formData.append(`Ingredients[${index}].IngredientId`, ingredient.ingredientId);
        formData.append(`Ingredients[${index}].QuantityGram`, String(ingredient.quantityGram));
      });
    }

    // Append cooking steps with correct field names (StepOrder and Instruction)
    if (data.cookingSteps && data.cookingSteps.length > 0) {
      data.cookingSteps.forEach((step, index) => {
        formData.append(`CookingSteps[${index}].StepOrder`, String(step.stepOrder));
        formData.append(`CookingSteps[${index}].Instruction`, step.instruction);
        if (step.images && step.images.length > 0) {
          step.images.forEach((img, imgIndex) => {
            if (img.image instanceof File) {
              formData.append(`CookingSteps[${index}].Images[${imgIndex}].Image`, img.image);
              formData.append(
                `CookingSteps[${index}].Images[${imgIndex}].ImageOrder`,
                String(img.imageOrder),
              );
            }
          });
        }
      });
    }

    // Tagged user IDs
    if (data.taggedUserIds && data.taggedUserIds.length > 0) {
      data.taggedUserIds.forEach((id) => {
        formData.append('TaggedUserIds', id);
      });
    }

    return this.post<void>('api/Draft', formData, {
      isPrivateRoute: true,
    });
  }

  /**
   * Copy a recipe - creates a new version with the same ingredients and cooking steps
   */
  public async copyRecipe(parentId: string, data: CreateRecipeRequest) {
    const formData = new FormData();

    // Required fields
    formData.append('Name', data.name);
    formData.append('Difficulty', data.difficulty);
    formData.append('CookTime', String(data.cookTime));
    formData.append('Ration', String(data.ration));

    // Optional fields
    if (data.description) {
      formData.append('Description', data.description);
    }

    // Image - send as IFormFile
    if (data.image) {
      formData.append('Image', data.image);
    }

    // Append array fields (LabelIds and Ingredients)
    if (data.labelIds && data.labelIds.length > 0) {
      data.labelIds.forEach((id) => {
        formData.append('LabelIds', id);
      });
    }

    if (data.ingredients && data.ingredients.length > 0) {
      data.ingredients.forEach((ingredient, index) => {
        formData.append(`Ingredients[${index}].IngredientId`, ingredient.ingredientId);
        formData.append(`Ingredients[${index}].QuantityGram`, String(ingredient.quantityGram));
      });
    }

    // Append cooking steps with correct field names (StepOrder and Instruction)
    if (data.cookingSteps && data.cookingSteps.length > 0) {
      data.cookingSteps.forEach((step, index) => {
        formData.append(`CookingSteps[${index}].StepOrder`, String(step.stepOrder));
        formData.append(`CookingSteps[${index}].Instruction`, step.instruction);
        if (step.images && step.images.length > 0) {
          step.images.forEach((img, imgIndex) => {
            if (img.image instanceof File) {
              // New image upload
              formData.append(`CookingSteps[${index}].Images[${imgIndex}].Image`, img.image);
              formData.append(
                `CookingSteps[${index}].Images[${imgIndex}].ImageOrder`,
                String(img.imageOrder),
              );
            } else if (img.id) {
              // Existing image - send the image ID to keep it
              formData.append(`CookingSteps[${index}].Images[${imgIndex}].ExistingImageId`, img.id);
              formData.append(
                `CookingSteps[${index}].Images[${imgIndex}].ImageOrder`,
                String(img.imageOrder),
              );
            }
          });
        }
      });
    }

    // Tagged user IDs
    if (data.taggedUserIds && data.taggedUserIds.length > 0) {
      data.taggedUserIds.forEach((id) => {
        formData.append('TaggedUserIds', id);
      });
    }

    return this.post<void>(`api/Recipe/${parentId}/copy`, formData, {
      isPrivateRoute: true,
    });
  }
}

export const recipeService = new RecipeService();
