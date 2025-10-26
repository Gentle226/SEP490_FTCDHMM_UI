export interface CookingStep {
  stepOrder: number;
  instruction: string;
  image?: File | string;
}

export interface CreateRecipeRequest {
  name: string;
  description?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cookTime: number;
  image?: File;
  ration: number;
  labelIds: string[];
  ingredientIds: string[];
  cookingSteps: CookingStep[];
}

export interface Recipe extends Omit<CreateRecipeRequest, 'image' | 'cookingSteps'> {
  id: string;
  imageUrl?: string;
  cookingSteps: CookingStep[];
  createdAt: string;
  updatedAt: string;
}

export * from './my-recipe.types';
export * from './recipe-detail.types';
