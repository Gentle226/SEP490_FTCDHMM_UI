'use client';

import { Edit, MapPin, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/base/components/ui/avatar';
import { Button } from '@/base/components/ui/button';
import { Skeleton } from '@/base/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/base/components/ui/tabs';
import { useAuth } from '@/modules/auth';
import { FollowersDialog, FollowingDialog, useProfile, useUpdateProfile } from '@/modules/profile';
import { UserRecipesList } from '@/modules/recipes/components';

export default function OwnProfilePage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recipeCount, setRecipeCount] = useState(0);

  // Fetch current user's profile
  const { data: profileData, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  // Track dialog visibility
  const [showFollowersDialog, setShowFollowersDialog] = useState(false);
  const [showFollowingDialog, setShowFollowingDialog] = useState(false);

  // Build profile user object from API data
  const profileUser = profileData
    ? {
        id: currentUser?.id || '',
        username: `${profileData.firstName} ${profileData.lastName}`.trim(),
        fullName: `${profileData.firstName} ${profileData.lastName}`.trim(),
        handle: profileData.userName
          ? `@${profileData.userName}`
          : `@${profileData.email.split('@')[0]}`,
        location: profileData.address || '',
        bio: profileData.bio || '',
        avatarUrl:
          profileData.avatarUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.firstName)}+${encodeURIComponent(profileData.lastName)}&background=random`,
        recipesCount: recipeCount,
        followersCount: profileData.followersCount ?? 0,
        followingCount: profileData.followingCount ?? 0,
        isFollowing: false,
      }
    : null;

  const handleShare = async () => {
    if (!profileUser) return;

    const profileUrl = `${window.location.origin}/profile/${profileData?.userName || profileData?.email.split('@')[0]}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hồ sơ của ${profileUser.fullName}`,
          text: `Xem hồ sơ của ${profileUser.fullName} trên FitFood Tracker`,
          url: profileUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(profileUrl);
      // TODO: Show toast notification
      alert('Đã sao chép link profile!');
    }
  };

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile page
    window.location.href = '/profile/edit';
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profileData) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 2MB');
      return;
    }

    // Validate file type - only JPG, PNG, and GIF are supported
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      alert('Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        gender: profileData.gender,
        dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : new Date(),
        avatarUrl: file,
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl space-y-4 px-4 sm:space-y-6 sm:px-6">
          <div className="bg-card rounded-lg border p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4 sm:gap-6">
                <Skeleton className="size-20 shrink-0 rounded-full sm:size-24" />
                <div className="space-y-3">
                  <Skeleton className="h-6 w-32 sm:h-8 sm:w-48" />
                  <Skeleton className="h-4 w-24 sm:w-32" />
                  <Skeleton className="hidden h-16 w-64 sm:block sm:w-96" />
                  <div className="flex gap-4 sm:gap-6">
                    <Skeleton className="h-6 w-20 sm:w-24" />
                    <Skeleton className="h-6 w-24 sm:w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error if profile not found
  if (!profileUser) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl space-y-4 px-4 sm:space-y-6 sm:px-6">
          <div className="bg-card rounded-lg border p-4 sm:p-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-[#99b94a] sm:text-xl">
                Không tìm thấy hồ sơ
              </h2>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                Hồ sơ người dùng không tồn tại hoặc đã bị xóa.
              </p>
              <Button className="mt-4 bg-[#99b94a]" onClick={() => router.push('/')}>
                Quay lại trang chủ
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-4 px-4 sm:space-y-6 sm:px-6">
        {/* Profile Header */}
        <div className="bg-card rounded-lg border p-4 sm:p-6">
          {/* Mobile: Stack vertically, Desktop: Side by side */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <Avatar
                  className={`border-primary/20 size-20 cursor-pointer border-2 transition-opacity hover:opacity-80 sm:size-24`}
                  onClick={handleAvatarClick}
                >
                  <AvatarImage src={profileUser.avatarUrl} alt={profileUser.fullName} />
                  <AvatarFallback className="text-lg sm:text-2xl">
                    {profileUser.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  aria-label="Thay đổi ảnh đại diện"
                />
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-2 sm:space-y-3">
                <div>
                  <h1 className="text-xl font-bold sm:text-2xl">{profileUser.fullName}</h1>
                  <p className="text-muted-foreground text-xs sm:text-sm">{profileUser.handle}</p>
                  {profileUser.location && (
                    <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs sm:text-sm">
                      <MapPin className="size-3 sm:size-4" />
                      <span>{profileUser.location}</span>
                    </div>
                  )}
                </div>

                <p className="text-foreground hidden max-w-2xl text-sm leading-relaxed sm:block">
                  {profileUser.bio}
                </p>

                <div className="flex flex-wrap gap-4 sm:gap-6">
                  <button
                    onClick={() => setShowFollowingDialog(true)}
                    className="flex items-center gap-1.5 transition-colors hover:text-[#99b94a] sm:gap-2"
                  >
                    <span className="text-base font-semibold sm:text-lg">
                      {profileUser.followingCount.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-xs sm:text-sm">Đang theo dõi</span>
                  </button>
                  <button
                    onClick={() => setShowFollowersDialog(true)}
                    className="flex items-center gap-1.5 transition-colors hover:text-[#99b94a] sm:gap-2"
                  >
                    <span className="text-base font-semibold sm:text-lg">
                      {profileUser.followersCount.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-xs sm:text-sm">Người theo dõi</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bio - Mobile only */}
            <p className="text-foreground -mt-2 max-w-2xl text-sm leading-relaxed sm:hidden">
              {profileUser.bio}
            </p>

            {/* Action Buttons */}
            <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">
              <Button
                className="flex-1 text-[#99b94a] sm:flex-none"
                variant="outline"
                size="sm"
                onClick={handleEditProfile}
              >
                <Edit className="size-4" />
                <span className="sm:inline">Sửa hồ sơ</span>
              </Button>
              <Button className="text-[#99b94a]" variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs for Recipes and Cooksnaps */}
        <Tabs defaultValue="recipes" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="recipes" className="flex-1 text-xs sm:text-sm">
              Công thức ({profileUser.recipesCount})
            </TabsTrigger>
            <TabsTrigger value="cooksnaps" className="flex-1 text-xs sm:text-sm">
              Mục gì đó khác
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipes" className="mt-4 sm:mt-6">
            {(() => {
              const userName = profileData?.userName || '';
              return (
                <UserRecipesList
                  userName={userName}
                  isOwnProfile={true}
                  onRecipeCountChange={setRecipeCount}
                />
              );
            })()}
          </TabsContent>

          <TabsContent value="cooksnaps" className="mt-4 sm:mt-6">
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {/* Cooksnap Cards - Using Skeleton as placeholder */}
              {Array.from({ length: 6 }).map((_, index) => (
                <RecipeCardSkeleton key={index} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Followers/Following Dialogs */}
      <FollowersDialog open={showFollowersDialog} onOpenChange={setShowFollowersDialog} />
      <FollowingDialog open={showFollowingDialog} onOpenChange={setShowFollowingDialog} />
    </DashboardLayout>
  );
}

// Recipe Card Skeleton Component
function RecipeCardSkeleton() {
  return (
    <div className="bg-card group overflow-hidden rounded-lg border transition-shadow hover:shadow-md">
      <div className="aspect-video">
        <Skeleton className="size-full rounded-none" />
      </div>
      <div className="space-y-2 p-3 sm:space-y-3 sm:p-4">
        <div className="space-y-1.5 sm:space-y-2">
          <Skeleton className="h-4 w-3/4 sm:h-5" />
          <Skeleton className="h-3 w-full sm:h-4" />
          <Skeleton className="h-3 w-2/3 sm:h-4" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Skeleton className="size-5 rounded-full sm:size-6" />
            <Skeleton className="h-3 w-16 sm:h-4 sm:w-20" />
          </div>
          <div className="flex gap-1.5 sm:gap-2">
            <Skeleton className="h-3 w-10 sm:h-4 sm:w-12" />
            <Skeleton className="h-3 w-10 sm:h-4 sm:w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
