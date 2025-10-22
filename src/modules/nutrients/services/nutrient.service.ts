import { HttpClient } from '@/base/lib';

export interface NutrientInfo {
  id: string;
  vietnameseName: string;
  unit: string;
}

class NutrientService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Get all nutrients
   */
  public async getNutrients() {
    return this.get<NutrientInfo[]>('api/Nutrient', {
      isPrivateRoute: true,
    });
  }

  /**
   * Get required nutrients that must be present in every ingredient
   */
  public async getRequiredNutrients() {
    return this.get<NutrientInfo[]>('api/Nutrient/required', {
      isPrivateRoute: true,
    });
  }
}

export const nutrientService = new NutrientService();
