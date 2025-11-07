import { HttpClient } from '@/base/lib';

import { AverageRatingResponse, CreateRatingRequest, RatingResponse } from '../types/rating.types';

class RatingService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Get average rating for a recipe
   * GET /api/recipes/{recipeId}/ratings/average
   * This endpoint is public (no authentication required)
   */
  public async getAverageRating(recipeId: string) {
    return this.get<AverageRatingResponse>(`api/recipes/${recipeId}/ratings/average`, {
      isPrivateRoute: false,
    });
  }

  /**
   * Add or update rating for a recipe
   * POST /api/recipes/{recipeId}/ratings
   * This endpoint requires authentication
   */
  public async rateRecipe(recipeId: string, request: CreateRatingRequest) {
    return this.post<RatingResponse>(`api/recipes/${recipeId}/ratings`, request, {
      isPrivateRoute: true,
    });
  }
}

export const ratingService = new RatingService();
