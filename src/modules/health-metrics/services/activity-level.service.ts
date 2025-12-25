import { HttpClient } from '@/base/lib';

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

export const ACTIVITY_LEVEL_MAP: Record<ActivityLevel, ActivityLevelInfo> = {
  Sedentary: {
    level: 'Sedentary',
    factor: 1.2,
    description: 'Ít hoặc không có tập luyện',
    exerciseFrequency: 'Lối sống ít hoạt động',
  },
  Light: {
    level: 'Light',
    factor: 1.375,
    description: 'Tập luyện 1-3 ngày mỗi tuần',
    exerciseFrequency: '1-3 ngày/tuần',
  },
  Moderate: {
    level: 'Moderate',
    factor: 1.55,
    description: 'Tập luyện 3-5 ngày mỗi tuần',
    exerciseFrequency: '3-5 ngày/tuần',
  },
  Active: {
    level: 'Active',
    factor: 1.725,
    description: 'Tập luyện 6-7 ngày mỗi tuần',
    exerciseFrequency: '6-7 ngày/tuần',
  },
  VeryActive: {
    level: 'VeryActive',
    factor: 1.9,
    description: 'Tập luyện rất gắt gao hoặc thể thao',
    exerciseFrequency: 'Tập luyện 2x mỗi ngày',
  },
};

/**
 * Convert backend activity level string (uppercase) to frontend format (PascalCase)
 * Backend stores: "MODERATE", "SEDENTARY", "LIGHT", "ACTIVE", "VERYACTIVE"
 * Frontend expects: "Moderate", "Sedentary", "Light", "Active", "VeryActive"
 */
function normalizeActivityLevel(value: string | undefined | null): ActivityLevel {
  if (!value) {
    console.warn(`Activity level is undefined or null, defaulting to Sedentary`);
    return 'Sedentary';
  }
  const normalized = value.trim().toUpperCase();
  switch (normalized) {
    case 'SEDENTARY':
      return 'Sedentary';
    case 'LIGHT':
      return 'Light';
    case 'MODERATE':
      return 'Moderate';
    case 'ACTIVE':
      return 'Active';
    case 'VERYACTIVE':
      return 'VeryActive';
    default:
      console.warn(`Unknown activity level: ${value}, defaulting to Sedentary`);
      return 'Sedentary';
  }
}

class ActivityLevelService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Get user's current activity level
   * GET /api/User/activity-level
   * Note: Backend returns object with { "value": "ACTIVE", "factor": 1.725 }, converts to PascalCase
   */
  public async getActivityLevel(): Promise<ActivityLevel> {
    const response = await this.get<{ value: string; factor: number }>('api/User/activity-level', {
      isPrivateRoute: true,
    });
    return normalizeActivityLevel(response.value);
  }

  /**
   * Update user's activity level
   * PUT /api/User/activity-level
   */
  public async changeActivityLevel(activityLevel: ActivityLevel): Promise<void> {
    return this.put<void>(
      'api/User/activity-level',
      { ActivityLevel: activityLevel.toUpperCase() },
      {
        isPrivateRoute: true,
      },
    );
  }

  /**
   * Get activity level info by level
   */
  public getActivityLevelInfo(level: ActivityLevel): ActivityLevelInfo {
    return ACTIVITY_LEVEL_MAP[level];
  }

  /**
   * Get all activity levels
   */
  public getAllActivityLevels(): ActivityLevelInfo[] {
    return Object.values(ACTIVITY_LEVEL_MAP);
  }
}

export const activityLevelService = new ActivityLevelService();
