import { CookingStep, RecipeIngredient } from './index';

export interface DraftLabel {
  id: string;
  name: string;
  colorCode: string;
}

export interface DraftIngredient {
  ingredientId: string;
  name: string;
  quantityGram: number;
}

export interface DraftCookingStepImage {
  id: string;
  imageUrl?: string;
  imageOrder: number;
  /** ID of the actual image (used to keep existing image when updating) */
  imageId: string;
}

export interface DraftCookingStep {
  id: string;
  instruction: string;
  cookingStepImages: DraftCookingStepImage[];
  stepOrder: number;
}

export interface DraftTaggedUser {
  id: string;
  firstName: string;
  lastName: string;
}

// Draft list item response (simplified)
export interface DraftRecipeResponse {
  id: string;
  name?: string;
  description?: string;
  difficulty: string;
  cookTime: number;
  imageUrl?: string;
  ration?: number;
}

// Draft detail response (full data)
export interface DraftDetailsResponse {
  name: string;
  description?: string;
  difficulty: string;
  cookTime: number;
  imageUrl?: string;
  /** ID of the main image (used to keep existing image when updating) */
  imageId?: string;
  ration?: number;
  labels: DraftLabel[];
  ingredients: DraftIngredient[];
  cookingSteps: DraftCookingStep[];
  taggedUser: DraftTaggedUser[];
}

export interface DraftRecipeRequest {
  name: string;
  description?: string;
  difficulty: string;
  cookTime: number;
  image?: File;
  /** URL of an existing image to copy (used when copying recipes without uploading new image) */
  existingMainImageUrl?: string;
  /** ID of existing main image to keep (used when updating draft without changing main image) */
  existingMainImageId?: string;
  ration?: number;
  labelIds: string[];
  ingredients: RecipeIngredient[];
  cookingSteps: CookingStep[];
  taggedUserIds: string[];
}
