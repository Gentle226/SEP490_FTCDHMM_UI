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

interface FollowingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FollowingDialog({ open, onOpenChange }: FollowingDialogProps) {
  const { data: following, isLoading } = useFollowing();
  const { data: followers } = useFollowers(); // Get list of our followers
  const { data: profile } = useProfile(); // Get current user profile for avatar
  const { user } = useAuth();
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const [displayUsers, setDisplayUsers] = useState<UserFollower[]>([]);
  // Track unfollow state locally - keeps users visible until dialog closes
  const [unfollowedUsers, setUnfollowedUsers] = useState<Set<string>>(new Set());
  // Track mutual follow status (if they follow us back)
  const [mutualFollowState, setMutualFollowState] = useState<Record<string, boolean>>({});

  // Initialize mutual follow state based on followers list
  useEffect(() => {
    if (followers && following) {
      const followerIds = new Set(followers.map((f) => f.id));
      const initialState: Record<string, boolean> = {};
      following.forEach((user) => {
        initialState[user.id] = followerIds.has(user.id);
      });
      setMutualFollowState(initialState);
    }
  }, [followers, following]);

  // Reset unfollowed users when dialog closes
  useEffect(() => {
    if (open && following && displayUsers.length === 0) {
      setDisplayUsers(following);
    }
    if (!open) {
      setUnfollowedUsers(new Set());
      setDisplayUsers([]);
    }
  }, [open, following, displayUsers.length]);

  const handleFollowToggle = (userId: string) => {
    const isUnfollowed = unfollowedUsers.has(userId);
    if (isUnfollowed) {
      // Re-follow
      followUser.mutate(userId);
      setUnfollowedUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    } else {
      // Unfollow
      unfollowUser.mutate(userId);
      setUnfollowedUsers((prev) => new Set(prev).add(userId));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Đang theo dõi</DialogTitle>
          <DialogDescription>Danh sách những người bạn đang theo dõi</DialogDescription>
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
          ) : displayUsers && displayUsers.length > 0 ? (
            // Display following
            displayUsers.map((followingUser: UserFollower) => (
              <div
                key={followingUser.id}
                className="hover:bg-accent flex items-center gap-3 rounded-lg p-2 transition-colors"
              >
                <Link
                  href={`/profile/${followingUser.id}`}
                  className="flex flex-1 items-center gap-3"
                  onClick={() => onOpenChange(false)}
                >
                  <Avatar className="size-10">
                    <AvatarImage
                      src={
                        followingUser.id === user?.id && profile?.avatarUrl
                          ? profile.avatarUrl
                          : followingUser.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(followingUser.firstName)}+${encodeURIComponent(followingUser.lastName)}&background=random`
                      }
                      alt={followingUser.fullName}
                    />
                    <AvatarFallback>
                      {(followingUser.firstName?.[0] || '') + (followingUser.lastName?.[0] || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {followingUser.fullName ||
                        `${followingUser.firstName} ${followingUser.lastName}`.trim() ||
                        'Người dùng'}
                    </p>
                    <p className="text-muted-foreground text-sm">{followingUser.email}</p>
                  </div>
                </Link>
                <Button
                  size="sm"
                  variant={unfollowedUsers.has(followingUser.id) ? 'outline' : 'default'}
                  className={
                    unfollowedUsers.has(followingUser.id)
                      ? 'text-[#99b94a]'
                      : 'bg-[#99b94a] hover:bg-[#8aa83f]'
                  }
                  onClick={() => handleFollowToggle(followingUser.id)}
                  disabled={followUser.isPending || unfollowUser.isPending}
                >
                  {unfollowedUsers.has(followingUser.id) ? (
                    <>
                      <UserPlus className="size-4" />
                      Theo dõi
                    </>
                  ) : mutualFollowState[followingUser.id] ? (
                    <>
                      <UserCheck className="size-4" />
                      Đang theo dõi
                    </>
                  ) : (
                    <>
                      <UserCheck className="size-4" />
                      Đang theo dõi
                    </>
                  )}
                </Button>
              </div>
            ))
          ) : (
            // Empty state
            <div className="py-8 text-center">
              <UserPlus className="text-muted-foreground mx-auto size-12" />
              <p className="text-muted-foreground mt-4">Chưa theo dõi ai</p>
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
