export interface CookingStep {
  id?: string;
  stepOrder: number;
  instruction: string;
  image?: File | string;
  imagePreview?: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantityGram: number;
}

export interface CreateRecipeRequest {
  name: string;
  description?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cookTime: number;
  image?: File;
  ration: number;
  labelIds: string[];
  ingredients: RecipeIngredient[];
  cookingSteps: CookingStep[];
}

export interface Recipe
  extends Omit<CreateRecipeRequest, 'image' | 'cookingSteps' | 'ingredients'> {
  id: string;
  imageUrl?: string;
  ingredientIds: string[];
  cookingSteps: CookingStep[];
  createdAt: string;
  updatedAt: string;
}

export * from './comment.types';
export * from './my-recipe.types';
export * from './rating.types';
export * from './recipe-detail.types';
