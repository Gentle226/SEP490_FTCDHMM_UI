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

class ActivityLevelService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Update user's activity level
   * PUT /api/User/activity-level
   */
  public async changeActivityLevel(activityLevel: ActivityLevel): Promise<void> {
    return this.put<void>(
      'api/User/activity-level',
      { activityLevel },
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
