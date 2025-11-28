import { HttpClient } from '@/base/lib';

import { PagedResultRecommendedRecipe } from '../types/recommendation.types';

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
   *
   * @returns Paged result of recommended recipes with full details and score
   */
  public async getRecommendations(params: PaginationParams = {}) {
    const { pageNumber = 1, pageSize = 10 } = params;

    const result = await this.get<PagedResultRecommendedRecipe>('api/Recommendation', {
      isPrivateRoute: true,
      params: {
        PageNumber: pageNumber,
        PageSize: pageSize,
      },
    });

    // Calculate totalPages for pagination
    return {
      ...result,
      totalPages: Math.ceil(result.totalCount / result.pageSize),
    };
  }
}

export const recommendationService = new RecommendationService();
