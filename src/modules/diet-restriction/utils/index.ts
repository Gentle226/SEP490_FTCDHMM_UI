/**
 * Diet Restriction Utilities
 */
import { RestrictionType, UserDietRestrictionResponse } from '../types';

export interface IngredientRestrictionMatch {
  restrictionId: string;
  ingredientName: string;
  type: RestrictionType;
  notes?: string;
  expiredAtUtc?: string;
  isExpired: boolean;
}

/**
 * Check if an ingredient has any diet restrictions
 * @param ingredientName - The ingredient name to check
 * @param restrictions - User's diet restrictions list
 * @returns Array of matching restrictions
 */
export function checkIngredientRestriction(
  ingredientName: string,
  restrictions: UserDietRestrictionResponse[],
): IngredientRestrictionMatch[] {
  if (!ingredientName || !restrictions || restrictions.length === 0) {
    return [];
  }

  const lowerIngredientName = ingredientName.toLowerCase().trim();

  return restrictions
    .filter((restriction) => {
      // Check if this is an ingredient restriction (not category)
      if (!restriction.ingredientName) return false;

      const restrictionIngredient = restriction.ingredientName.toLowerCase().trim();
      return restrictionIngredient === lowerIngredientName;
    })
    .map((restriction) => {
      const isExpired = restriction.expiredAtUtc
        ? new Date(restriction.expiredAtUtc) < new Date()
        : false;

      return {
        restrictionId: restriction.id,
        ingredientName: restriction.ingredientName || '',
        type: restriction.type as RestrictionType,
        notes: restriction.notes,
        expiredAtUtc: restriction.expiredAtUtc,
        isExpired,
      };
    });
}

/**
 * Check if a recipe ingredient has any category-based restrictions
 * @param ingredientCategoryIds - Category IDs of the ingredient
 * @param restrictions - User's diet restrictions list
 * @returns Array of matching category restrictions
 */
export function checkIngredientCategoryRestriction(
  ingredientCategoryIds: string[] | undefined,
  restrictions: UserDietRestrictionResponse[],
): IngredientRestrictionMatch[] {
  if (!ingredientCategoryIds || ingredientCategoryIds.length === 0 || !restrictions) {
    return [];
  }

  // Filter for category-based restrictions
  const categoryRestrictions = restrictions.filter((r) => r.ingredientCategoryName);

  return categoryRestrictions
    .filter((restriction) => {
      // Check if category name matches (case-insensitive search)
      // Note: We're checking by category name, not ID in this implementation
      return !!restriction.ingredientCategoryName;
    })
    .map((restriction) => {
      const isExpired = restriction.expiredAtUtc
        ? new Date(restriction.expiredAtUtc) < new Date()
        : false;

      return {
        restrictionId: restriction.id,
        ingredientName: restriction.ingredientCategoryName || '',
        type: restriction.type as RestrictionType,
        notes: restriction.notes,
        expiredAtUtc: restriction.expiredAtUtc,
        isExpired,
      };
    });
}

/**
 * Get the severity level of restrictions
 * Active allergies are most critical, followed by dislikes, then temporary avoidance
 * @param restrictions - Array of matching restrictions
 * @returns The most critical restriction type
 */
export function getMostCriticalRestrictionType(
  restrictions: IngredientRestrictionMatch[],
): RestrictionType | null {
  if (restrictions.length === 0) return null;

  // Filter out expired restrictions
  const activeRestrictions = restrictions.filter((r) => !r.isExpired);
  if (activeRestrictions.length === 0) return null;

  // Priority: ALLERGY > DISLIKE > TEMPORARYAVOID
  if (activeRestrictions.some((r) => r.type === RestrictionType.ALLERGY)) {
    return RestrictionType.ALLERGY;
  }
  if (activeRestrictions.some((r) => r.type === RestrictionType.DISLIKE)) {
    return RestrictionType.DISLIKE;
  }
  return RestrictionType.TEMPORARYAVOID;
}

/**
 * Format restriction message for display
 * @param restrictions - Array of matching restrictions
 * @param ingredientName - Name of the ingredient
 * @returns Formatted message string
 */
export function formatRestrictionMessage(
  restrictions: IngredientRestrictionMatch[],
  ingredientName: string,
): string {
  const activeRestrictions = restrictions.filter((r) => !r.isExpired);

  if (activeRestrictions.length === 0) {
    return `Không có hạn chế cho "${ingredientName}"`;
  }

  if (activeRestrictions.length === 1) {
    const restriction = activeRestrictions[0];
    const typeLabel = getRestrictionTypeLabel(restriction.type);
    return `${ingredientName} - ${typeLabel}${restriction.notes ? `: ${restriction.notes}` : ''}`;
  }

  const types = [...new Set(activeRestrictions.map((r) => getRestrictionTypeLabel(r.type)))];
  return `${ingredientName} - ${types.join(', ')}`;
}

/**
 * Get Vietnamese label for restriction type
 */
export function getRestrictionTypeLabel(type: RestrictionType): string {
  const labels: Record<RestrictionType, string> = {
    [RestrictionType.ALLERGY]: 'Dị ứng',
    [RestrictionType.DISLIKE]: 'Không thích',
    [RestrictionType.TEMPORARYAVOID]: 'Tạm tránh',
  };
  return labels[type] || type;
}
