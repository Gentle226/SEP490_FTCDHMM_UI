import { HttpClient } from '@/base/lib';

import { CreateRecipeRequest, MyRecipeResponse, Recipe } from '../types';

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
          formData.append(`CookingSteps[${index}].ImageURL`, step.image);
        }
      });
    }

    return this.post<Recipe>('api/Recipe', formData, {
      isPrivateRoute: true,
    });
  }
}

export const recipeService = new RecipeService();
