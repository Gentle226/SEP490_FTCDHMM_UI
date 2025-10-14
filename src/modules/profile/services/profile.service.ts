import { HttpClient } from '@/base/lib/http-client.lib';

import { ProfileDto, UpdateProfileDto, UserFollower } from '../types/profile.types';

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
   * GET /api/User/profile/:userId
   */
  public async getUserProfile(userId: string): Promise<ProfileDto> {
    return this.get<ProfileDto>(`api/User/profile/${userId}`, {
      isPrivateRoute: true,
    });
  }

  /**
   * Follow a user
   * POST /api/User/follow/:followeeId
   */
  public async followUser(followeeId: string): Promise<void> {
    return this.post<void>(`api/User/follow/${followeeId}`, null, {
      isPrivateRoute: true,
    });
  }

  /**
   * Unfollow a user
   * DELETE /api/User/unfollow/:followeeId
   */
  public async unfollowUser(followeeId: string): Promise<void> {
    return this.delete<void>(`api/User/unfollow/${followeeId}`, {
      isPrivateRoute: true,
    });
  }

  /**
   * Get list of followers
   * GET /api/User/followers
   */
  public async getFollowers(): Promise<UserFollower[]> {
    return this.get<UserFollower[]>('api/User/followers', {
      isPrivateRoute: true,
    });
  }

  /**
   * Get list of following users
   * GET /api/User/following
   */
  public async getFollowing(): Promise<UserFollower[]> {
    return this.get<UserFollower[]>('api/User/following', {
      isPrivateRoute: true,
    });
  }
}

export const profileService = new ProfileService();
