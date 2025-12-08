import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { profileService } from '../services/profile.service';
import type { ProfileDto, UpdateProfileDto } from '../types/profile.types';

/**
 * Hook to fetch current user's profile
 */
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a user's profile by username
 */
export function useUserProfile(username: string) {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: () => profileService.getUserProfile(username),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!username,
  });
}

/**
 * Hook to update current user's profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileDto) => profileService.updateProfile(data),
    onSuccess: () => {
      // Invalidate and refetch profile
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      // Also invalidate auth user data
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

      toast.success('Cập nhật hồ sơ thành công!');
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Cập nhật hồ sơ thất bại';
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to follow a user
 * @param username - The username of the profile being followed (used for cache key)
 */
export function useFollowUser(username?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (followeeId: string) => profileService.followUser(followeeId),
    onMutate: async (followeeId) => {
      // Cancel any outgoing refetches for this profile
      if (username) {
        await queryClient.cancelQueries({ queryKey: ['profile', username] });
      }

      // Snapshot the previous value
      const previousProfile = username ? queryClient.getQueryData(['profile', username]) : null;

      // Optimistically update to the new value
      if (username) {
        queryClient.setQueryData(['profile', username], (old: unknown) => {
          if (!old || typeof old !== 'object') return old;
          const profile = old as ProfileDto;
          return {
            ...profile,
            isFollowing: true,
            followersCount: (profile.followersCount ?? 0) + 1,
          };
        });
      }

      // Return a context object with the snapshotted value
      return { previousProfile, username };
    },
    onSuccess: () => {
      // Invalidate followers/following lists
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });

      toast.success('Đã theo dõi người dùng!');
    },
    onError: (error: unknown, _followeeId, context: unknown) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      const ctx = context as { previousProfile?: unknown; username?: string } | undefined;
      if (ctx?.previousProfile && ctx?.username) {
        queryClient.setQueryData(['profile', ctx.username], ctx.previousProfile);
      }

      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể theo dõi người dùng';
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to unfollow a user
 * @param username - The username of the profile being unfollowed (used for cache key)
 */
export function useUnfollowUser(username?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (followeeId: string) => profileService.unfollowUser(followeeId),
    onMutate: async (followeeId) => {
      // Cancel any outgoing refetches for this profile
      if (username) {
        await queryClient.cancelQueries({ queryKey: ['profile', username] });
      }

      // Snapshot the previous value
      const previousProfile = username ? queryClient.getQueryData(['profile', username]) : null;

      // Optimistically update to the new value
      if (username) {
        queryClient.setQueryData(['profile', username], (old: unknown) => {
          if (!old || typeof old !== 'object') return old;
          const profile = old as ProfileDto;
          return {
            ...profile,
            isFollowing: false,
            followersCount: Math.max((profile.followersCount ?? 0) - 1, 0),
          };
        });
      }

      // Return a context object with the snapshotted value
      return { previousProfile, username };
    },
    onSuccess: () => {
      // Invalidate followers/following lists
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });

      toast.success('Đã bỏ theo dõi người dùng!');
    },
    onError: (error: unknown, _followeeId, context: unknown) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      const ctx = context as { previousProfile?: unknown; username?: string } | undefined;
      if (ctx?.previousProfile && ctx?.username) {
        queryClient.setQueryData(['profile', ctx.username], ctx.previousProfile);
      }

      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể bỏ theo dõi người dùng';
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to fetch followers list
 */
export function useFollowers() {
  return useQuery({
    queryKey: ['followers'],
    queryFn: () => profileService.getFollowers(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch following list
 */
export function useFollowing() {
  return useQuery({
    queryKey: ['following'],
    queryFn: () => profileService.getFollowing(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
