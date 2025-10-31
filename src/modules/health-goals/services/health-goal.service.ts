import { HttpClient } from '@/base/lib';

import { CreateHealthGoalRequest, HealthGoalResponse, UpdateHealthGoalRequest } from '../types';

class HealthGoalService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Create a new system health goal (Admin only)
   */
  public async create(data: CreateHealthGoalRequest) {
    return this.post<void>('api/HealthGoal', data, {
      isPrivateRoute: true,
    });
  }

  /**
   * Update an existing health goal (Admin only)
   */
  public async update(id: string, data: UpdateHealthGoalRequest) {
    return this.put<void>(`api/HealthGoal/${id}`, data, {
      isPrivateRoute: true,
    });
  }

  /**
   * Get health goal by ID
   */
  public async getById(id: string) {
    return this.get<HealthGoalResponse>(`api/HealthGoal/${id}`, {
      isPrivateRoute: true,
    });
  }

  /**
   * Get all system health goals
   */
  public async getAll() {
    return this.get<HealthGoalResponse[]>('api/HealthGoal', {
      isPrivateRoute: true,
    });
  }

  /**
   * Delete a health goal (Admin only)
   */
  public async deleteGoal(id: string) {
    return this.delete<void>(`api/HealthGoal/${id}`, {
      isPrivateRoute: true,
    });
  }
}

export const healthGoalService = new HealthGoalService();
