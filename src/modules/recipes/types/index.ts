export interface CookingStepImage {
  id?: string;
  image?: File | string;
  imageOrder: number;
  imageUrl?: string;
  existingImageUrl?: string;
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
  /** Optional draft ID - if provided, API will delete the draft after publishing */
  draftId?: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cookTime: number;
  image?: File;
  /** URL of an existing image to copy (used when copying recipes without uploading new image) */
  existingImageUrl?: string;
  /** URL of existing main image (used when migrating from draft) */
  existingMainImageUrl?: string;
  /** ID of existing main image to use (e.g., when publishing a draft) */
  existingMainImageId?: string;
  /** If true, copy the main image from parent recipe (when no new image is uploaded) */
  copyMainImageFromParent?: boolean;
  /** If true, copy step images from parent recipe (for steps without new images) */
  copyStepImagesFromParent?: boolean;
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
export * from './recipe-management.types';
export * from './recommendation.types';
