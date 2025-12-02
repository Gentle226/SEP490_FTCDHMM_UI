import { CookingStep, DraftDetailsResponse, RecipeDetail } from '@/modules/recipes/types';

export interface SelectedIngredient {
  id: string;
  name: string;
  quantityGram: number;
}

export interface SelectedLabel {
  id: string;
  name: string;
  colorCode: string;
}

export interface SelectedUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface RecipeFormProps {
  recipeId?: string;
  parentId?: string;
  draftId?: string;
  initialData?: RecipeDetail;
  initialDraft?: DraftDetailsResponse;
  mode?: 'create' | 'edit' | 'draft-edit';
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface RecipeFormState {
  // Basic info
  name: string;
  description: string;
  difficulty: Difficulty;
  cookTime: number;
  ration: number;

  // Image state
  mainImage: File | null;
  mainImagePreview: string | null;
  isCopiedRecipe: boolean;

  // Selected items
  selectedLabels: SelectedLabel[];
  selectedIngredients: SelectedIngredient[];
  selectedUsers: SelectedUser[];
  cookingSteps: CookingStep[];

  // Form state
  isSubmitting: boolean;
  hasUnsavedChanges: boolean;
  copyParentId?: string;
}

export interface ImageUploadState {
  mainImage: File | null;
  mainImagePreview: string | null;
  isCopiedRecipe: boolean;
  isCropDialogOpen: boolean;
  imageToCrop: string | null;
  isDragOver: boolean;
}

export interface CookingStepsState {
  cookingSteps: CookingStep[];
  draggedStepIndex: number | null;
  dragOverIndex: number | null;
}

// Constants
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
