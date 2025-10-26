import { HttpClient } from '@/base/lib';

import { CreateRecipeRequest, MyRecipeResponse, Recipe, RecipeDetail } from '../types';

interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

class RecipeService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Get my recipes (recipes created by the current user)
   */
  public async getMyRecipes(params: PaginationParams = {}) {
    const { pageNumber = 1, pageSize = 10 } = params;

    return this.get<MyRecipeResponse>('api/Recipe/myRecipe', {
      isPrivateRoute: true,
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

    // Append array fields (LabelIds and IngredientIds)
    if (data.labelIds && data.labelIds.length > 0) {
      data.labelIds.forEach((id) => {
        formData.append('LabelIds', id);
      });
    }

    if (data.ingredientIds && data.ingredientIds.length > 0) {
      data.ingredientIds.forEach((id) => {
        formData.append('IngredientIds', id);
      });
    }

    // Append cooking steps with correct field names (StepOrder and Instruction)
    if (data.cookingSteps && data.cookingSteps.length > 0) {
      data.cookingSteps.forEach((step, index) => {
        formData.append(`CookingSteps[${index}].StepOrder`, String(step.stepOrder));
        formData.append(`CookingSteps[${index}].Instruction`, step.instruction);
        if (step.image && step.image instanceof File) {
          formData.append(`CookingSteps[${index}].Image`, step.image);
        }
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

    // Append array fields (LabelIds and IngredientIds)
    if (data.labelIds && data.labelIds.length > 0) {
      data.labelIds.forEach((id) => {
        formData.append('LabelIds', id);
      });
    }

    if (data.ingredientIds && data.ingredientIds.length > 0) {
      data.ingredientIds.forEach((id) => {
        formData.append('IngredientIds', id);
      });
    }

    // Append cooking steps with correct field names (StepOrder and Instruction)
    if (data.cookingSteps && data.cookingSteps.length > 0) {
      data.cookingSteps.forEach((step, index) => {
        formData.append(`CookingSteps[${index}].StepOrder`, String(step.stepOrder));
        formData.append(`CookingSteps[${index}].Instruction`, step.instruction);
        if (step.image && step.image instanceof File) {
          formData.append(`CookingSteps[${index}].Image`, step.image);
        }
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
}

export const recipeService = new RecipeService();
