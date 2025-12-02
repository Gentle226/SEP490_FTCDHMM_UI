'use client';

import { Search, Users, X } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/base/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/base/components/ui/command';
import { Label } from '@/base/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/base/components/ui/popover';
import { User } from '@/modules/users/services/user-management.service';

import { SelectedUser } from './types';

interface RecipeUsersSectionProps {
  selectedUsers: SelectedUser[];
  userSearch: string;
  userSearchResults: User[];
  isUserPopoverOpen: boolean;
  isLoadingUsers: boolean;
  onUserSearchChange: (value: string) => void;
  onPopoverOpenChange: (open: boolean) => void;
  onAddUser: (user: User) => void;
  onRemoveUser: (userId: string) => void;
}

export function RecipeUsersSection({
  selectedUsers,
  userSearch,
  userSearchResults,
  isUserPopoverOpen,
  isLoadingUsers,
  onUserSearchChange,
  onPopoverOpenChange,
  onAddUser,
  onRemoveUser,
}: RecipeUsersSectionProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Users className="h-4 w-4 text-[#99b94a]" />
        Tag người dùng
      </Label>

      {/* Selected Users */}
      <div className="flex min-h-[60px] flex-wrap gap-2 rounded-lg border p-3">
        {selectedUsers.length === 0 ? (
          <span className="flex w-full justify-center pt-2 text-center text-xs text-gray-400">
            Chưa có người dùng nào được tag
          </span>
        ) : (
          selectedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-900"
            >
              {user.avatar && (
                <Image
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                  width={16}
                  height={16}
                  className="h-4 w-4 rounded-full object-cover"
                />
              )}
              <span className="truncate">
                {user.firstName} {user.lastName}
              </span>
              <button
                type="button"
                onClick={() => onRemoveUser(user.id)}
                className="ml-1 rounded-full hover:bg-blue-200"
                aria-label={`Remove ${user.firstName} ${user.lastName}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Search and Add Users */}
      <Popover open={isUserPopoverOpen} onOpenChange={onPopoverOpenChange}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full">
            <Search className="mr-2 h-4 w-4" />
            Thêm người dùng
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Tìm kiếm người dùng..."
              value={userSearch}
              onValueChange={onUserSearchChange}
            />
            <CommandList>
              {isLoadingUsers ? (
                <div className="py-6 text-center text-sm text-gray-500">Đang tải...</div>
              ) : userSearchResults.length === 0 ? (
                <CommandEmpty>Không tìm thấy người dùng nào.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {userSearchResults.map((user) => {
                    const isSelected = selectedUsers.some((u) => u.id === user.id);
                    return (
                      <CommandItem
                        key={user.id}
                        onSelect={() => onAddUser(user)}
                        disabled={isSelected}
                        className="cursor-pointer"
                      >
                        <div className="flex w-full items-center gap-2">
                          {user.avatarUrl && (
                            <Image
                              src={user.avatarUrl}
                              alt={`${user.firstName} ${user.lastName}`}
                              width={24}
                              height={24}
                              className="h-6 w-6 rounded-full object-cover"
                            />
                          )}
                          <span className="flex-1">
                            {user.firstName} {user.lastName}
                          </span>
                          {isSelected && <span className="text-xs text-gray-500">Đã chọn</span>}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
