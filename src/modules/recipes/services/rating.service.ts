import { HttpClient } from '@/base/lib';

import { AverageRatingResponse, CreateRatingRequest, RatingResponse } from '../types/rating.types';

class RatingService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Get average rating (score) for a recipe
   * GET /api/Recipe/{recipeId}/score
   * This endpoint requires authentication
   * Note: Moved from RatingController to RecipeController
   */
  public async getAverageRating(recipeId: string) {
    return this.get<AverageRatingResponse>(`api/Recipe/${recipeId}/score`, {
      isPrivateRoute: true,
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
   * DELETE /api/rating/{ratingId}
   * This endpoint requires authentication
   */
  public async deleteRating(ratingId: string) {
    return this.delete<void>(`api/rating/${ratingId}`, {
      isPrivateRoute: true,
    });
  }

  /**
   * Delete rating as manager/admin (with RATING_DELETE permission)
   * DELETE /api/rating/{ratingId}/byManager
   * This endpoint requires RATING_DELETE permission
   */
  public async deleteRatingByManager(ratingId: string) {
    return this.delete<void>(`api/rating/${ratingId}/byManager`, {
      isPrivateRoute: true,
    });
  }
}

export const ratingService = new RatingService();
