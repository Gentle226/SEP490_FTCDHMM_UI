import { HttpClient } from '@/base/lib';

export interface CreateUserHealthMetricRequest {
  weightKg: number;
  heightCm: number;
  bodyFatPercent?: number;
  muscleMassKg?: number;
  notes?: string;
}

export type UpdateUserHealthMetricRequest = CreateUserHealthMetricRequest;

export interface UserHealthMetricResponse {
  id: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  bodyFatPercent?: number;
  muscleMassKg?: number;
  bmr: number;
  tdee: number;
  recordedAt: string;
  notes?: string;
}

class UserHealthMetricService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Create a new health metric record
   * POST /api/UserHealthMetric
   */
  public async create(data: CreateUserHealthMetricRequest): Promise<void> {
    return this.post<void>('api/UserHealthMetric', data, {
      isPrivateRoute: true,
    });
  }

  /**
   * Get user's metric history
   * GET /api/UserHealthMetric
   */
  public async getHistory(): Promise<UserHealthMetricResponse[]> {
    const response = await this.get<UserHealthMetricResponse[]>('api/UserHealthMetric', {
      isPrivateRoute: true,
    });
    return response || [];
  }

  /**
   * Update an existing health metric
   * PUT /api/UserHealthMetric/{id}
   */
  public async update(metricId: string, data: UpdateUserHealthMetricRequest): Promise<void> {
    return this.put<void>(`api/UserHealthMetric/${metricId}`, data, {
      isPrivateRoute: true,
    });
  }

  /**
   * Delete a health metric record
   * DELETE /api/UserHealthMetric/{id}
   */
  public async deleteMetric(metricId: string): Promise<void> {
    return this.delete<void>(`api/UserHealthMetric/${metricId}`, {
      isPrivateRoute: true,
    });
  }
}

export const userHealthMetricService = new UserHealthMetricService();
