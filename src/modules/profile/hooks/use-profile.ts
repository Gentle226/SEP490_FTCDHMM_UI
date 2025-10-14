import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { profileService } from '../services/profile.service';
import { UpdateProfileDto } from '../types/profile.types';

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
 * Hook to fetch a user's profile by ID
 */
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => profileService.getUserProfile(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!userId,
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
