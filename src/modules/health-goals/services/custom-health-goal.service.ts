import { HttpClient } from '@/base/lib';

import {
  CreateCustomHealthGoalRequest,
  CustomHealthGoalResponse,
  UpdateCustomHealthGoalRequest,
} from '../types';

class CustomHealthGoalService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Create a new custom health goal for the current user
   */
  public async create(data: CreateCustomHealthGoalRequest) {
    return this.post<void>('api/CustomHealthGoal', data, {
      isPrivateRoute: true,
    });
  }

  /**
   * Get all custom health goals for the current user
   */
  public async getMyGoals() {
    return this.get<CustomHealthGoalResponse[]>('api/CustomHealthGoal', {
      isPrivateRoute: true,
    });
  }

  /**
   * Get a specific custom health goal by ID
   */
  public async getById(id: string) {
    return this.get<CustomHealthGoalResponse>(`api/CustomHealthGoal/${id}`, {
      isPrivateRoute: true,
    });
  }

  /**
   * Update an existing custom health goal
   */
  public async update(id: string, data: UpdateCustomHealthGoalRequest) {
    return this.put<void>(`api/CustomHealthGoal/${id}`, data, {
      isPrivateRoute: true,
    });
  }

  /**
   * Delete a custom health goal
   */
  public async deleteGoal(id: string) {
    return this.delete<void>(`api/CustomHealthGoal/${id}`, {
      isPrivateRoute: true,
    });
  }
}

export const customHealthGoalService = new CustomHealthGoalService();
