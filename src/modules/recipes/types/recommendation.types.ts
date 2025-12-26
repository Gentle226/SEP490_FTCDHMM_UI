/**
 * Recipe recommendation types for the scoring system
 */
import { Author, IngredientName, Label } from './my-recipe.types';

/**
 * @deprecated Use RecommendedRecipeResponse instead
 */
export interface RecipeRankResponse {
  recipeId: string;
  score: number;
}

/**
 * Full recipe details with recommendation score
 */
export interface RecommendedRecipeResponse {
  id: string;
  name: string;
  description: string;
  author: Author;
  difficulty: {
    name: string;
    value: number;
  };
  cookTime: number;
  ration: number;
  imageUrl?: string;
  labels: Label[];
  ingredients: IngredientName[];
  createdAtUtc: string;
  updatedAtUtc: string;
  score: number | null;
}

/**
 * @deprecated Use PagedResultRecommendedRecipe instead
 */
export interface PagedResultRecipeRank {
  items: RecipeRankResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

/**
 * Paged result of recommended recipes with full details
 */
export interface PagedResultRecommendedRecipe {
  items: RecommendedRecipeResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
}

/**
 * Meal Planner Types
 */

/**
 * @deprecated MealType enum is no longer used. Use user-defined meal slots instead.
 */
export enum MealType {
  Breakfast = 0,
  Lunch = 1,
  Dinner = 2,
}

export interface MealAnalyzeRequest {
  mealSlotId: string;
  currentRecipeIds?: string[];
  suggestionLimit?: number;
}

export interface NutrientRange {
  min: number;
  max: number;
}

export interface MealAnalyzeResponse {
  targetCalories: number;
  currentCalories: number;
  remainingCalories: number;
  energyCoveragePercent: number;
  targetNutrients: Record<string, number>;
  currentNutrients: Record<string, number>;
  remainingNutrients: Record<string, NutrientRange>;
  suggestions: RecommendedRecipeResponse[];
}
