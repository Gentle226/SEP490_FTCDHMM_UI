import { useCallback, useState } from 'react';

import { userManagementService } from '@/modules/users/services/user-management.service';

export interface UserSearchResult {
  id: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export function useUserSearch() {
  const [isLoading, setIsLoading] = useState(false);

  const searchUsers = useCallback(async (query: string): Promise<UserSearchResult[]> => {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    setIsLoading(true);
    try {
      const response = await userManagementService.getCustomers({
        pageNumber: 1,
        pageSize: 10,
        search: query.trim(),
      });

      return response.items.map((user) => ({
        id: user.id,
        userName: user.email, // Use email as userName since User interface doesn't have userName
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl, // Now properly typed on User interface
      }));
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { searchUsers, isLoading };
}
