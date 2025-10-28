import { HttpClient } from '@/base/lib';

import { HealthGoalResponse } from '../types';

class UserHealthGoalService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Set a health goal as the user's current active goal
   */
  public async setGoal(goalId: string) {
    return this.post<void>(`api/UserHealthGoal/${goalId}`, undefined, {
      isPrivateRoute: true,
    });
  }

  /**
   * Get the user's current active health goal
   */
  public async getCurrentGoal() {
    return this.get<HealthGoalResponse>('api/UserHealthGoal/current', {
      isPrivateRoute: true,
    });
  }

  /**
   * Remove a health goal from the user's current goals
   */
  public async removeFromCurrent(id: string) {
    return this.delete<void>(`api/UserHealthGoal/${id}`, {
      isPrivateRoute: true,
    });
  }
}

export const userHealthGoalService = new UserHealthGoalService();
