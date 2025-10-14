'use client';

import { User } from 'lucide-react';
import Link from 'next/link';

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

import { useFollowing } from '../hooks/use-profile';
import { UserFollower } from '../types/profile.types';

interface FollowingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FollowingDialog({ open, onOpenChange }: FollowingDialogProps) {
  const { data: following, isLoading } = useFollowing();

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
          ) : following && following.length > 0 ? (
            // Display following
            following.map((user: UserFollower) => (
              <Link
                key={user.id}
                href={`/profile/${user.id}`}
                className="hover:bg-accent flex items-center gap-3 rounded-lg p-2 transition-colors"
                onClick={() => onOpenChange(false)}
              >
                <Avatar className="size-10">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback>
                    <User className="size-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">
                    {user.fullName || `${user.firstName} ${user.lastName}`.trim() || 'Người dùng'}
                  </p>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                </div>
              </Link>
            ))
          ) : (
            // Empty state
            <div className="py-8 text-center">
              <User className="text-muted-foreground mx-auto size-12" />
              <p className="text-muted-foreground mt-4">Chưa theo dõi ai</p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
