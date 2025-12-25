import { HttpClient } from '@/base/lib';

import {
  MealAnalyzeRequest,
  MealAnalyzeResponse,
  PagedResultRecommendedRecipe,
} from '../types/recommendation.types';

interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

class RecommendationService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Get pre-computed recommended recipes (cached, fast results)
   * These are general recommendations that don't require real-time calculation
   * Note: This endpoint may not support pagination - returns a fixed pre-computed list
   *
   * @returns Paged result of pre-computed recommended recipes
   */
  public async getPreComputedRecommendations() {
    const result = await this.get<PagedResultRecommendedRecipe>('api/Recommendation/pre-computed', {
      isPrivateRoute: true,
    });

    // Calculate totalPages for pagination (if API returns paged data)
    return {
      ...result,
      totalPages: result.totalCount > 0 ? Math.ceil(result.totalCount / result.pageSize) : 0,
    };
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

  /**
   * Analyze current meal and get suggestions to complete nutritional goals
   * Based on:
   * - Current time (determines meal type: Breakfast, Lunch, Dinner)
   * - User's TDEE and health goals
   * - Currently selected recipes
   *
   * @param params - Current recipe IDs and suggestion limit
   * @returns Meal analysis with nutritional info and recipe suggestions
   */
  public async analyzeMeal(params: MealAnalyzeRequest = {}): Promise<MealAnalyzeResponse> {
    const queryParams: Record<string, string> = {};

    if (params.currentRecipeIds && params.currentRecipeIds.length > 0) {
      params.currentRecipeIds.forEach((id) => {
        queryParams[`CurrentRecipeIds`] = id;
      });
    }

    if (params.suggestionLimit) {
      queryParams['SuggestionLimit'] = params.suggestionLimit.toString();
    }

    // Build query string manually to support array params
    const searchParams = new URLSearchParams();
    if (params.currentRecipeIds) {
      params.currentRecipeIds.forEach((id) => {
        searchParams.append('CurrentRecipeIds', id);
      });
    }
    if (params.suggestionLimit) {
      searchParams.append('SuggestionLimit', params.suggestionLimit.toString());
    }

    const queryString = searchParams.toString();
    const url = queryString
      ? `api/Recommendation/meal-planner?${queryString}`
      : 'api/Recommendation/meal-planner';

    return this.get<MealAnalyzeResponse>(url, {
      isPrivateRoute: true,
    });
  }
}

export const recommendationService = new RecommendationService();
