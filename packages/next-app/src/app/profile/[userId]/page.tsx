'use client';

import { Ban, Camera, Edit, MapPin, MoreVertical, Share2, UserPlus, Users } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/base/components/ui/avatar';
import { Button } from '@/base/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/base/components/ui/dropdown-menu';
import { Skeleton } from '@/base/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/base/components/ui/tabs';
import { useAuth } from '@/modules/auth';
import { useProfile, useUpdateProfile, useUserProfile } from '@/modules/profile';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const userId = params.userId as string;
  const isOwnProfile = currentUser?.id === userId;
  const [isFollowing, setIsFollowing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile data based on whether it's own profile or other's
  const { data: ownProfile, isLoading: isLoadingOwn } = useProfile();
  const { data: otherProfile, isLoading: isLoadingOther } = useUserProfile(
    isOwnProfile ? '' : userId,
  );
  const updateProfile = useUpdateProfile();

  const isLoading = isOwnProfile ? isLoadingOwn : isLoadingOther;
  const profileData = isOwnProfile ? ownProfile : otherProfile;

  // Build profile user object from API data
  const profileUser = profileData
    ? {
        id: userId,
        username: `${profileData.firstName} ${profileData.lastName}`.trim(),
        fullName: `${profileData.firstName} ${profileData.lastName}`.trim(),
        handle: `@${profileData.email.split('@')[0]}`,
        location: 'Thanh Hóa', // TODO: Add location field to API
        bio: 'Đam mê nấu ăn :)', // TODO: Add bio field to API
        avatar:
          profileData.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.firstName)}+${encodeURIComponent(profileData.lastName)}&background=random`,
        recipesCount: 36, // TODO: Get from API
        followersCount: 69, // TODO: Get from API
      }
    : null;

  const handleShare = async () => {
    if (!profileUser) return;

    const profileUrl = `${window.location.origin}/profile/${userId}`;
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

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // TODO: API call to follow/unfollow user
  };

  const handleBlock = () => {
    // TODO: API call to block user
    alert('Chức năng chặn người dùng');
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
        phoneNumber: profileData.phoneNumber,
        gender: profileData.gender,
        avatar: file,
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  };

  const handleAvatarClick = () => {
    if (isOwnProfile) {
      fileInputRef.current?.click();
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-6">
                <Skeleton className="size-24 rounded-full" />
                <div className="space-y-3">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-16 w-96" />
                  <div className="flex gap-6">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-32" />
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
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-[#99b94a]">Không tìm thấy hồ sơ</h2>
              <p className="text-muted-foreground mt-2">
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
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Profile Header */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar
                  className={`border-primary/20 size-24 border-2 ${isOwnProfile ? 'cursor-pointer transition-opacity hover:opacity-80' : ''}`}
                  onClick={handleAvatarClick}
                >
                  <AvatarImage src={profileUser.avatar} alt={profileUser.fullName} />
                  <AvatarFallback className="text-2xl">
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
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-2xl font-bold">{profileUser.fullName}</h1>
                  <p className="text-muted-foreground text-sm">{profileUser.handle}</p>
                  {profileUser.location && (
                    <div className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                      <MapPin className="size-4" />
                      <span>{profileUser.location}</span>
                    </div>
                  )}
                </div>

                <p className="text-foreground max-w-2xl text-sm leading-relaxed">
                  {profileUser.bio}
                </p>

                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{profileUser.recipesCount}</span>
                    <span className="text-muted-foreground text-sm">Bạn Bếp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {profileUser.followersCount.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground text-sm">Người quan tâm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <>
                  <Button
                    className="text-[#99b94a]"
                    variant="outline"
                    size="sm"
                    onClick={handleEditProfile}
                  >
                    <Edit className="size-4" />
                    Sửa hồ sơ
                  </Button>
                  <Button className="text-[#99b94a]" variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="size-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant={isFollowing ? 'secondary' : 'default'}
                    size="sm"
                    onClick={handleFollow}
                  >
                    {isFollowing ? (
                      <>
                        <Users className="size-4" />
                        Đang theo dõi
                      </>
                    ) : (
                      <>
                        <UserPlus className="size-4" />
                        Theo dõi
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="size-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem variant="danger" onClick={handleBlock}>
                        <Ban className="mr-2 size-4" />
                        Chặn người dùng
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs for Recipes and Cooksnaps */}
        <Tabs defaultValue="recipes" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="recipes" className="flex-1">
              Công thức ({profileUser.recipesCount})
            </TabsTrigger>
            <TabsTrigger value="cooksnaps" className="flex-1">
              Mục gì đó khác
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipes" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Recipe Cards - Using Skeleton as placeholder */}
              {Array.from({ length: 6 }).map((_, index) => (
                <RecipeCardSkeleton key={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cooksnaps" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Cooksnap Cards - Using Skeleton as placeholder */}
              {Array.from({ length: 6 }).map((_, index) => (
                <RecipeCardSkeleton key={index} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
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
      <div className="space-y-3 p-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
