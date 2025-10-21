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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Người quan tâm</DialogTitle>
          <DialogDescription>Danh sách những người đang theo dõi bạn</DialogDescription>
        </DialogHeader>

        <div className="max-h-96 space-y-2 overflow-y-auto">
          {isLoading ? (
            // Loading state
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))
          ) : followers && followers.length > 0 ? (
            // Display followers
            followers.map((follower: UserFollower) => (
              <div
                key={follower.id}
                className="hover:bg-accent flex items-center gap-3 rounded-lg p-2 transition-colors"
              >
                <Link
                  href={`/profile/${follower.id}`}
                  className="flex flex-1 items-center gap-3"
                  onClick={() => onOpenChange(false)}
                >
                  <Avatar className="size-10">
                    <AvatarImage
                      src={
                        follower.id === user?.id && profile?.avatarUrl
                          ? profile.avatarUrl
                          : follower.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(follower.firstName)}+${encodeURIComponent(follower.lastName)}&background=random`
                      }
                      alt={follower.fullName}
                    />
                    <AvatarFallback>
                      {(follower.firstName?.[0] || '') + (follower.lastName?.[0] || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {follower.fullName ||
                        `${follower.firstName} ${follower.lastName}`.trim() ||
                        'Người dùng'}
                    </p>
                    <p className="text-muted-foreground text-sm">{follower.email}</p>
                  </div>
                </Link>
                <Button
                  size="sm"
                  variant={followState[follower.id] ? 'default' : 'outline'}
                  className={
                    followState[follower.id] ? 'bg-[#99b94a] hover:bg-[#8aa83f]' : 'text-[#99b94a]'
                  }
                  onClick={() => handleFollowToggle(follower.id)}
                  disabled={followUser.isPending || unfollowUser.isPending}
                >
                  {followState[follower.id] ? (
                    <>
                      <UserCheck className="size-4" />
                      Đang theo dõi
                    </>
                  ) : (
                    <>
                      <UserPlus className="size-4" />
                      Theo dõi
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

        <div className="flex justify-end">
          <Button variant="outline" className="text-[#99b94a]" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
