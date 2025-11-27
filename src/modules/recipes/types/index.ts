export interface CookingStepImage {
  id?: string;
  image: File | string;
  imageOrder: number;
  imageUrl?: string;
}

export interface CookingStep {
  id?: string;
  stepOrder: number;
  instruction: string;
  images: CookingStepImage[];
  // Deprecated: keeping for backward compatibility during migration
  image?: File | string;
  imagePreview?: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantityGram: number;
}

export interface CreateRecipeRequest {
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cookTime: number;
  image?: File;
  ration: number;
  labelIds: string[];
  ingredients: RecipeIngredient[];
  cookingSteps: CookingStep[];
  taggedUserIds?: string[]; // New field for tagging users
}

export interface Recipe
  extends Omit<CreateRecipeRequest, 'image' | 'cookingSteps' | 'ingredients'> {
  id: string;
  imageUrl?: string;
  ingredientIds: string[];
  cookingSteps: CookingStep[];
  createdAt: string;
  updatedAt: string;
  rating?: number;
  averageRating?: number;
  numberOfRatings?: number;
}

export * from './comment.types';
export * from './draft.types';
export * from './my-recipe.types';
export * from './rating.types';
export * from './recipe-detail.types';
export * from './recommendation.types';
