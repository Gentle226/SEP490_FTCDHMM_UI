/**
 * Diet Restriction Types
 */

export enum RestrictionType {
  ALLERGY = 'ALLERGY',
  DISLIKE = 'DISLIKE',
  TEMPORARYAVOID = 'TEMPORARYAVOID',
}

export interface CreateIngredientRestrictionRequest {
  ingredientId: string;
  type: RestrictionType | string;
  notes?: string;
  expiredAtUtc?: string;
}

export interface CreateIngredientCategoryRestrictionRequest {
  ingredientCategoryId: string;
  type: RestrictionType | string;
  notes?: string;
  expiredAtUtc?: string;
}

export interface UserDietRestrictionFilterRequest {
  keyword?: string;
  type?: RestrictionType | string;
  sortBy?: string;
}

export interface UserDietRestrictionResponse {
  id: string;
  ingredientId?: string;
  ingredientName?: string;
  ingredientCategoryId?: string;
  ingredientCategoryName?: string;
  type: RestrictionType | string;
  notes?: string;
  expiredAtUtc?: string;
}

export type UserDietRestrictionListResponse = UserDietRestrictionResponse[];

/**
 * Restriction type configuration for display
 */
export const RESTRICTION_TYPE_CONFIG = {
  [RestrictionType.ALLERGY]: {
    label: 'Dị ứng',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    description: 'Dị ứng thực phẩm',
  },
  [RestrictionType.DISLIKE]: {
    label: 'Không thích',
    color: '#F97316',
    bgColor: '#FFEDD5',
    description: 'Không thích thực phẩm',
  },
  [RestrictionType.TEMPORARYAVOID]: {
    label: 'Tạm tránh',
    color: '#EAB308',
    bgColor: '#FEFCE8',
    description: 'Tạm thời tránh thực phẩm',
  },
} as const;
