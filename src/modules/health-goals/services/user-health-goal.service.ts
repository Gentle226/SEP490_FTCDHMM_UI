import { HttpClient } from '@/base/lib';

import { SetUserHealthGoalRequest, UserHealthGoalResponse } from '../types';

class UserHealthGoalService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Set a health goal as the user's current active goal with expiration date
   */
  public async setGoal(goalId: string, expiredAtUtc: string) {
    const data: SetUserHealthGoalRequest = { expiredAtUtc };
    return this.post<void>(`api/UserHealthGoal/${goalId}`, data, {
      isPrivateRoute: true,
    });
  }

  /**
   * Get the user's current active health goal (one-to-one relationship)
   */
  public async getCurrentGoal() {
    const response = await this.get<UserHealthGoalResponse | null>('api/UserHealthGoal/current', {
      isPrivateRoute: true,
    });
    return response || null;
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
