'use client';

import { Search, User, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { Badge } from '@/base/components/ui/badge';
import { Button } from '@/base/components/ui/button';
import { Input } from '@/base/components/ui/input';
import { cn } from '@/base/lib';

export interface UserSearchResult {
  id: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

interface UserSearchAutocompleteProps {
  selectedUsers: UserSearchResult[];
  onUserSelect: (user: UserSearchResult) => void;
  onUserRemove: (userId: string) => void;
  onSearch: (query: string) => Promise<UserSearchResult[]>;
  placeholder?: string;
  maxUsers?: number;
  className?: string;
  showMentionSymbol?: boolean; // Show @ symbol for mentions
}

/**
 * Shared component for user search and selection
 * Used for both @mentions in comments and user tagging in recipes
 */
export function UserSearchAutocomplete({
  selectedUsers,
  onUserSelect,
  onUserRemove,
  onSearch,
  placeholder = 'Search users...',
  maxUsers,
  className,
  showMentionSymbol = false,
}: UserSearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const searchUsers = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await onSearch(query.trim());
        // Filter out already selected users
        const filteredResults = searchResults.filter(
          (user) => !selectedUsers.some((selected) => selected.id === user.id),
        );
        setResults(filteredResults);
        setIsOpen(filteredResults.length > 0);
      } catch (error) {
        console.error('User search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [query, onSearch, selectedUsers]);

  const handleSelect = (user: UserSearchResult) => {
    if (maxUsers && selectedUsers.length >= maxUsers) {
      return;
    }
    onUserSelect(user);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const getUserDisplayName = (user: UserSearchResult) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.userName;
  };

  return (
    <div className={cn('relative', className)} ref={wrapperRef}>
      {/* Selected users */}
      {selectedUsers.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <Badge key={user.id} variant="secondary" className="pr-1 pl-2">
              {showMentionSymbol && '@'}
              {getUserDisplayName(user)}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => onUserRemove(user.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-9"
          disabled={maxUsers ? selectedUsers.length >= maxUsers : false}
        />
      </div>

      {/* Search results dropdown */}
      {isOpen && (
        <div className="bg-popover absolute z-50 mt-1 w-full rounded-md border shadow-md">
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="text-muted-foreground p-4 text-center text-sm">Searching...</div>
            ) : results.length > 0 ? (
              results.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelect(user)}
                  className="hover:bg-accent flex w-full items-center gap-3 px-4 py-2 text-left"
                >
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.userName}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {showMentionSymbol && '@'}
                      {getUserDisplayName(user)}
                    </div>
                    <div className="text-muted-foreground text-xs">@{user.userName}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-muted-foreground p-4 text-center text-sm">No users found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
