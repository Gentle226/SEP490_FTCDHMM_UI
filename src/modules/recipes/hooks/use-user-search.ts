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

  const searchUsers = useCallback(
    async (query: string, excludeUserId?: string): Promise<UserSearchResult[]> => {
      setIsLoading(true);
      try {
        // Allow searching with empty query (shows all users) or queries with 2+ characters
        const searchQuery = query.trim();
        if (searchQuery.length > 0 && searchQuery.length < 2) {
          return [];
        }

        const users = await userManagementService.getTaggableUsers(searchQuery || undefined);

        return users
          .filter((user) => user.id !== excludeUserId) // Filter out current user
          .map((user) => ({
            id: user.id,
            userName: `${user.lastName} ${user.firstName}`, // Use full name for mentions
            lastName: user.lastName,
            firstName: user.firstName,
            avatarUrl: user.avatarUrl,
          }));
      } catch (error) {
        console.error('Error searching users:', error);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { searchUsers, isLoading };
}
