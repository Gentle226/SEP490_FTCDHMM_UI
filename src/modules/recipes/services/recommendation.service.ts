import { HttpClient } from '@/base/lib';

import { PagedResultRecipeRank } from '../types/recommendation.types';

interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

class RecommendationService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Get recommended recipes for the current user based on their health goals and metrics
   * Results are ranked by a scoring system that considers:
   * - User's health goals
   * - User's health metrics
   * - Ingredient nutrition values
   * - User behavior (views, clicks, likes, saves)
   */
  public async getRecommendations(params: PaginationParams = {}) {
    const { pageNumber = 1, pageSize = 10 } = params;

    return this.get<PagedResultRecipeRank>('api/Recommendation', {
      isPrivateRoute: true,
      params: {
        PageNumber: pageNumber,
        PageSize: pageSize,
      },
    });
  }

  /**
   * Get a single ranked recipe recommendation
   * @deprecated Use getRecommendations instead
   */
  public async getRecommendation(recipeId: string) {
    const result = await this.getRecommendations({ pageNumber: 1, pageSize: 100 });
    return result.items.find((item) => item.recipeId === recipeId) || null;
  }
}

export const recommendationService = new RecommendationService();
