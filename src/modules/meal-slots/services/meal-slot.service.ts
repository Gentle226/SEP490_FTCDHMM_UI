import { HttpClient } from '@/base/lib';

import { MealSlotRequest, MealSlotResponse } from '../types';

class MealSlotService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Get all meal slots for the current user
   * @returns List of meal slots ordered by orderIndex
   */
  public async getMealSlots(): Promise<MealSlotResponse[]> {
    return this.get<MealSlotResponse[]>('api/user-meals', {
      isPrivateRoute: true,
    });
  }

  /**
   * Create a new meal slot
   * @param request Meal slot data
   */
  public async createMealSlot(request: MealSlotRequest): Promise<void> {
    return this.post('api/user-meals', request, {
      isPrivateRoute: true,
    });
  }

  /**
   * Update an existing meal slot
   * @param slotId The meal slot ID
   * @param request Updated meal slot data
   */
  public async updateMealSlot(slotId: string, request: MealSlotRequest): Promise<void> {
    return this.put(`api/user-meals/${slotId}`, request, {
      isPrivateRoute: true,
    });
  }

  /**
   * Delete a meal slot
   * @param slotId The meal slot ID to delete
   */
  public async deleteMealSlot(slotId: string): Promise<void> {
    return this.delete(`api/user-meals/${slotId}`, {
      isPrivateRoute: true,
    });
  }
}

export const mealSlotService = new MealSlotService();
