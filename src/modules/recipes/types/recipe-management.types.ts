import { Author } from './my-recipe.types';

/**
 * Recipe status enum matching backend RecipeStatus value object
 */
export enum RecipeStatus {
  Posted = 'POSTED',
  Locked = 'LOCKED',
  Pending = 'PENDING',
  Deleted = 'DELETED',
}

/**
 * Request body for recipe management actions that require a reason
 * (Lock, Reject, Delete)
 */
export interface RecipeManagementReasonRequest {
  reason: string;
}

/**
 * Response for recipe management list items
 */
export interface RecipeManagementResponse {
  id: string;
  name: string;
  description?: string;
  author: Author;
  difficulty: {
    name: string;
    value: number;
  };
  cookTime: number;
  ration: number;
  imageUrl?: string;
  createdAtUtc: string;
  updatedAtUtc: string;
  reason?: string;
}

/**
 * Paginated response for recipe management list
 */
export interface RecipeManagementListResponse {
  items: RecipeManagementResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
