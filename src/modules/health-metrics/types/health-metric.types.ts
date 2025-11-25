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

export type ActivityLevel = 'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'VeryActive';

export interface ChangeActivityLevelRequest {
  activityLevel: ActivityLevel;
}

export interface ActivityLevelInfo {
  level: ActivityLevel;
  factor: number;
  description: string;
  exerciseFrequency: string;
}
