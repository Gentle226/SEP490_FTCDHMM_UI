'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useDebounce } from '@/base/hooks';
import { SelectedUser } from '@/modules/recipes/components/recipe-form/types';
import { User, userManagementService } from '@/modules/users/services/user-management.service';

export interface UseUserTaggingResult {
  // State
  userSearch: string;
  setUserSearch: (value: string) => void;
  userSearchResults: User[];
  isUserPopoverOpen: boolean;
  setIsUserPopoverOpen: (value: boolean) => void;
  isLoadingUsers: boolean;

  // Selected users
  selectedUsers: SelectedUser[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<SelectedUser[]>>;

  // Actions
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
}

export function useUserTagging(
  currentUserId?: string,
  initialUsers: SelectedUser[] = [],
): UseUserTaggingResult {
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>(initialUsers);
  const [userSearch, setUserSearch] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
  const [isUserPopoverOpen, setIsUserPopoverOpen] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const debouncedUserSearch = useDebounce(userSearch, 300);

  // Search users for tagging
  useEffect(() => {
    async function searchUsers() {
      if (!isUserPopoverOpen) return;

      setIsLoadingUsers(true);
      try {
        const users = await userManagementService.getTaggableUsers(debouncedUserSearch);
        // Filter out current user and map to User type
        const filteredUsers = users
          .filter((user) => user.id !== currentUserId)
          .map((user) => ({
            id: user.id,
            userName: user.userName || `${user.firstName} ${user.lastName}`.trim(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: '',
            createdAtUTC: '',
            status: 'Active',
            avatarUrl: user.avatarUrl,
          }));
        setUserSearchResults(filteredUsers);
      } catch (error) {
        console.error('Failed to search users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    }

    searchUsers();
  }, [debouncedUserSearch, isUserPopoverOpen, currentUserId]);

  const addUser = (user: User) => {
    // Prevent user from tagging themselves
    if (currentUserId && user.id === currentUserId) {
      toast.error('Không thể tự tag chính mình');
      return;
    }

    if (!selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers((prev) => [
        ...prev,
        {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatarUrl,
        },
      ]);
    }
    setIsUserPopoverOpen(false);
    setUserSearch('');
  };

  const removeUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return {
    userSearch,
    setUserSearch,
    userSearchResults,
    isUserPopoverOpen,
    setIsUserPopoverOpen,
    isLoadingUsers,
    selectedUsers,
    setSelectedUsers,
    addUser,
    removeUser,
  };
}
