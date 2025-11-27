/**
 * Recipe recommendation types for the scoring system
 */

export interface RecipeRankResponse {
  recipeId: string;
  score: number;
}

export interface PagedResultRecipeRank {
  items: RecipeRankResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}
