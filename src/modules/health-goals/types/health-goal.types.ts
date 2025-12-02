export interface NutrientTarget {
  nutrientId: string;
  name: string;
  targetType?: string;
  minValue: number;
  medianValue?: number;
  maxValue: number;
  minEnergyPct?: number;
  medianEnergyPct?: number;
  maxEnergyPct?: number;
  weight?: number;
}

export interface NutrientTargetDto {
  nutrientId: string;
  targetType?: string;
  minValue: number;
  medianValue?: number;
  maxValue: number;
  minEnergyPct?: number;
  medianEnergyPct?: number;
  maxEnergyPct?: number;
  weight?: number;
}

export interface HealthGoalResponse {
  id: string;
  name: string;
  description?: string;
  targets: NutrientTarget[];
}

export interface CreateHealthGoalRequest {
  name: string;
  description?: string;
  targets: NutrientTargetDto[];
}

export interface UpdateHealthGoalRequest {
  name?: string;
  description?: string;
  targets?: NutrientTargetDto[];
}

export type CustomHealthGoalResponse = HealthGoalResponse;

export interface CreateCustomHealthGoalRequest {
  name: string;
  description?: string;
  targets: NutrientTargetDto[];
  expiredAtUtc?: string;
}

export interface UpdateCustomHealthGoalRequest {
  name?: string;
  description?: string;
  targets?: NutrientTargetDto[];
}

// UserHealthGoal - now one-to-one relationship with User
export interface UserHealthGoalResponse {
  healthGoalId?: string;
  customHealthGoalId?: string;
  name: string;
  description?: string;
  targets: NutrientTarget[];
  expiredAtUtc?: string; // ISO 8601 date string
  startedAtUtc: string; // ISO 8601 date string
}

export interface SetUserHealthGoalRequest {
  type: 'SYSTEM' | 'CUSTOM'; // Health goal type (admin-created or custom)
  expiredAtUtc?: string; // ISO 8601 date string, optional
}
