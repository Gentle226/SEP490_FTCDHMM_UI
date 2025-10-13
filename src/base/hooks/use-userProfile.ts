// src/modules/users/hooks/useUserProfile.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { userService } from '@/modules/users';

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['users', 'profile'],
    queryFn: async () => {
      try {
        return await userService.getUserProfile();
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          return null;
        }
        throw err;
      }
    },
    retry: false,
  });
};
