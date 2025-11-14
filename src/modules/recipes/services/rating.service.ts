import { HttpClient } from '@/base/lib';

import { AverageRatingResponse, CreateRatingRequest, RatingResponse } from '../types/rating.types';

class RatingService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Get average rating (score) for a recipe
   * GET /api/Recipe/{recipeId}/score
   * This endpoint is public (no authentication required)
   * Note: Moved from RatingController to RecipeController
   */
  public async getAverageRating(recipeId: string) {
    return this.get<AverageRatingResponse>(`api/Recipe/${recipeId}/score`, {
      isPrivateRoute: false,
    });
  }

  /**
   * Add or update rating for a recipe
   * POST /api/rating/{recipeId}
   * This endpoint requires authentication
   */
  public async rateRecipe(recipeId: string, request: CreateRatingRequest) {
    return this.post<RatingResponse>(`api/rating/${recipeId}`, request, {
      isPrivateRoute: true,
    });
  }

  /**
   * Delete rating for a recipe
   * DELETE /api/rating/{recipeId}
   * This endpoint requires authentication
   */
  public async deleteRating(recipeId: string) {
    return this.delete<void>(`api/rating/${recipeId}`, {
      isPrivateRoute: true,
    });
  }
}

export const ratingService = new RatingService();
