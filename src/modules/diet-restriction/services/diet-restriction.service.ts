import { HttpClient } from '@/base/lib';

import {
  CreateIngredientCategoryRestrictionRequest,
  CreateIngredientRestrictionRequest,
  UserDietRestrictionFilterRequest,
  UserDietRestrictionListResponse,
} from '../types';

class DietRestrictionService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Create a dietary restriction for an ingredient
   * POST /api/UserDietRestriction/ingredient
   */
  public async createIngredientRestriction(request: CreateIngredientRestrictionRequest) {
    return this.post<void>('api/UserDietRestriction/ingredient', request, {
      isPrivateRoute: true,
    });
  }

  /**
   * Create a dietary restriction for an ingredient category
   * POST /api/UserDietRestriction/ingredient-category
   */
  public async createIngredientCategoryRestriction(
    request: CreateIngredientCategoryRestrictionRequest,
  ) {
    return this.post<void>('api/UserDietRestriction/ingredient-category', request, {
      isPrivateRoute: true,
    });
  }

  /**
   * Get user's dietary restrictions with filtering
   * GET /api/UserDietRestriction
   */
  public async getUserDietRestrictions(filter?: UserDietRestrictionFilterRequest) {
    const params = new URLSearchParams();
    if (filter?.keyword) params.append('keyword', filter.keyword);
    if (filter?.type) params.append('type', filter.type);
    if (filter?.sortBy) params.append('sortBy', filter.sortBy);

    const queryString = params.toString();
    const url = queryString ? `api/UserDietRestriction?${queryString}` : 'api/UserDietRestriction';

    return this.get<UserDietRestrictionListResponse>(url, {
      isPrivateRoute: true,
    });
  }

  /**
   * Delete a dietary restriction
   * DELETE /api/UserDietRestriction/{restrictionId}
   */
  public async deleteRestriction(restrictionId: string) {
    return this.delete<void>(`api/UserDietRestriction/${restrictionId}`, {
      isPrivateRoute: true,
    });
  }
}

export const dietRestrictionService = new DietRestrictionService();
