export interface NutrientTarget {
  nutrientId: string;
  name: string;
  minValue: number;
  maxValue: number;
}

export interface NutrientTargetDto {
  nutrientId: string;
  minValue: number;
  maxValue: number;
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
}

export interface UpdateCustomHealthGoalRequest {
  name?: string;
  description?: string;
  targets?: NutrientTargetDto[];
}
