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
  targetType?: 'Absolute' | 'ENERGYPERCENT';
  minValue?: number | null;
  medianValue?: number;
  maxValue?: number | null;
  minEnergyPct?: number | null;
  medianEnergyPct?: number;
  maxEnergyPct?: number | null;
  weight?: number; // Default: 1
}

export interface HealthGoalResponse {
  id: string;
  name: string;
  description?: string;
  targets: NutrientTarget[];
  lastUpdatedUtc: string;
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
  lastUpdatedUtc?: string;
}

export type CustomHealthGoalResponse = HealthGoalResponse;

export interface CreateCustomHealthGoalRequest {
  name: string;
  description?: string;
  targets: NutrientTargetDto[];
}

export interface UpdateCustomHealthGoalRequest {
  name?: string;
  description?: string;
  targets?: NutrientTargetDto[];
}

// UserHealthGoal - supports history tracking with one-to-many relationship
export interface UserHealthGoalResponse {
  id: string; // Unique identifier for the user health goal record
  healthGoalId?: string;
  customHealthGoalId?: string;
  name: string;
  description?: string;
  targets: NutrientTarget[];
  startedAtUtc?: string; // ISO 8601 date string - when the goal was set
  expiredAtUtc?: string; // ISO 8601 date string - when the goal expired (null if active)
  lastUpdatedUtc: string; // ISO 8601 date string - for optimistic locking
}

export interface SetUserHealthGoalRequest {
  type: 'SYSTEM' | 'CUSTOM'; // Health goal type (admin-created or custom)
  expiredAtUtc?: string; // ISO 8601 date string, optional
}
