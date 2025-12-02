import { HttpClient } from '@/base/lib';

import { SetUserHealthGoalRequest, UserHealthGoalResponse } from '../types';

class UserHealthGoalService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Set a health goal as the user's current active goal with expiration date
   * @param goalId - The ID of the health goal (System or Custom)
   * @param type - The type of health goal: 'SYSTEM' for admin-created or 'CUSTOM' for user-created
   * @param expiredAtUtc - Optional expiration date in ISO 8601 format
   */
  public async setGoal(goalId: string, type: 'SYSTEM' | 'CUSTOM', expiredAtUtc?: string) {
    const data: SetUserHealthGoalRequest = { type, expiredAtUtc };
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
   * Get the user's health goal history (past/expired goals)
   */
  public async getHistory() {
    return this.get<UserHealthGoalResponse[]>('api/UserHealthGoal/history', {
      isPrivateRoute: true,
    });
  }

  /**
   * Remove the user's current active health goal
   * Note: No longer requires an ID parameter - removes the current goal
   */
  public async removeFromCurrent() {
    return this.delete<void>('api/UserHealthGoal', {
      isPrivateRoute: true,
    });
  }
}

export const userHealthGoalService = new UserHealthGoalService();
