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
