'use client';

import { UserCheck, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/base/components/ui/avatar';
import { Button } from '@/base/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/base/components/ui/dialog';
import { Skeleton } from '@/base/components/ui/skeleton';
import { useAuth } from '@/modules/auth';

import {
  useFollowUser,
  useFollowers,
  useFollowing,
  useProfile,
  useUnfollowUser,
} from '../hooks/use-profile';
import { UserFollower } from '../types/profile.types';

interface FollowersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FollowersDialog({ open, onOpenChange }: FollowersDialogProps) {
  const { data: followers, isLoading } = useFollowers();
  const { data: following } = useFollowing(); // Get list of users we follow
  const { data: profile } = useProfile(); // Get current user profile for avatar
  const { user } = useAuth();
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  // Track follow state locally
  const [followState, setFollowState] = useState<Record<string, boolean>>({});

  // Initialize follow state based on current following list
  useEffect(() => {
    if (following && followers) {
      const followingIds = new Set(following.map((u) => u.id));
      const initialState: Record<string, boolean> = {};
      followers.forEach((follower) => {
        initialState[follower.id] = followingIds.has(follower.id);
      });
      setFollowState(initialState);
    }
  }, [following, followers]);

  const handleFollowToggle = (userId: string) => {
    const isCurrentlyFollowing = followState[userId];
    if (isCurrentlyFollowing) {
      unfollowUser.mutate(userId);
      setFollowState((prev) => ({ ...prev, [userId]: false }));
    } else {
      followUser.mutate(userId);
      setFollowState((prev) => ({ ...prev, [userId]: true }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Người quan tâm</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Danh sách những người đang theo dõi bạn
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-2 overflow-y-auto">
          {isLoading ? (
            // Loading state
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 p-2 sm:gap-3">
                <Skeleton className="size-8 shrink-0 rounded-full sm:size-10" />
                <div className="min-w-0 flex-1 space-y-1">
                  <Skeleton className="h-3 w-24 sm:h-4 sm:w-32" />
                  <Skeleton className="h-2 w-20 sm:h-3" />
                </div>
              </div>
            ))
          ) : followers && followers.length > 0 ? (
            // Display followers
            followers.map((follower: UserFollower) => (
              <div
                key={follower.id}
                className="hover:bg-accent flex items-center gap-2 rounded-lg p-2 transition-colors sm:gap-3 sm:p-3"
              >
                <Link
                  href={`/profile/${follower.id}`}
                  className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3"
                  onClick={() => onOpenChange(false)}
                >
                  <Avatar className="size-8 shrink-0 sm:size-10">
                    <AvatarImage
                      src={
                        follower.id === user?.id && profile?.avatarUrl
                          ? profile.avatarUrl
                          : follower.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(follower.firstName)}+${encodeURIComponent(follower.lastName)}&background=random`
                      }
                      alt={follower.fullName}
                    />
                    <AvatarFallback className="text-xs sm:text-sm">
                      {(follower.firstName?.[0] || '') + (follower.lastName?.[0] || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium sm:text-base">
                      {follower.fullName ||
                        `${follower.firstName} ${follower.lastName}`.trim() ||
                        'Người dùng'}
                    </p>
                  </div>
                </Link>
                <Button
                  size="sm"
                  variant={followState[follower.id] ? 'default' : 'outline'}
                  className={`shrink-0 text-xs sm:text-sm ${
                    followState[follower.id] ? 'bg-[#99b94a] hover:bg-[#8aa83f]' : 'text-[#99b94a]'
                  }`}
                  onClick={() => handleFollowToggle(follower.id)}
                  disabled={followUser.isPending || unfollowUser.isPending}
                >
                  {followState[follower.id] ? (
                    <>
                      <UserCheck className="size-3 sm:size-4" />
                      <span className="hidden sm:inline">Đang theo dõi</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="size-3 sm:size-4" />
                      <span className="hidden sm:inline">Theo dõi</span>
                    </>
                  )}
                </Button>
              </div>
            ))
          ) : (
            // Empty state
            <div className="py-8 text-center">
              <UserCheck className="text-muted-foreground mx-auto size-12" />
              <p className="text-muted-foreground mt-4">Chưa có người theo dõi</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 sm:gap-3">
          <Button
            variant="outline"
            className="text-xs text-[#99b94a] sm:text-sm"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
