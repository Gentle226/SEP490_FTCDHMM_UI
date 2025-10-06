import { HttpClient } from '@/base/lib/http-client.lib';

import { ProfileDto, UpdateProfileDto } from '../types/profile.types';

class ProfileService extends HttpClient {
  constructor() {
    super();
  }

  /**
   * Get current user's profile
   * GET /api/User/profile
   */
  public async getProfile(): Promise<ProfileDto> {
    return this.get<ProfileDto>('api/User/profile', {
      isPrivateRoute: true,
    });
  }

  /**
   * Update current user's profile
   * PUT /api/User/profile
   * Note: This endpoint expects FormData for file upload
   */
  public async updateProfile(data: UpdateProfileDto): Promise<void> {
    const formData = new FormData();
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('gender', data.gender);

    if (data.avatar) {
      formData.append('avatar', data.avatar);
    }

    return this.put<void>('api/User/profile', formData, {
      isPrivateRoute: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Get user profile by ID (for viewing other users' profiles)
   * TODO: Add this endpoint to backend if needed
   * GET /api/User/profile/:userId
   */
  public async getUserProfile(userId: string): Promise<ProfileDto> {
    // For now, if viewing own profile, use getProfile()
    // This should be replaced when backend adds endpoint for viewing other users
    return this.get<ProfileDto>(`api/User/profile/${userId}`, {
      isPrivateRoute: true,
    });
  }
}

export const profileService = new ProfileService();
