'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, Lock, MapPin, Share2, Unlock, UserCheck, UserPlus } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/base/components/ui/avatar';
import { Button } from '@/base/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/base/components/ui/dialog';
import { Label } from '@/base/components/ui/label';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/base/components/ui/dropdown-menu';
import { Skeleton } from '@/base/components/ui/skeleton';
import { PermissionPolicies, hasPermission, useAuth } from '@/modules/auth';
import {
  FollowersDialog,
  FollowingDialog,
  useFollowUser,
  useProfile,
  useUnfollowUser,
  useUpdateProfile,
  useUserProfile,
} from '@/modules/profile';
import { UserRecipesList } from '@/modules/recipes/components';
import { ReportTargetType, ReportTrigger } from '@/modules/report';
import { userManagementService } from '@/modules/users/services/user-management.service';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const username = params.userId as string;
  const isOwnProfile = currentUser?.userName === username;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recipeCount, setRecipeCount] = useState(0);
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [lockDays, setLockDays] = useState(7);
  const [lockReason, setLockReason] = useState('');
  const [showFollowersDialog, setShowFollowersDialog] = useState(false);
  const [showFollowingDialog, setShowFollowingDialog] = useState(false);

  // Fetch profile data based on whether it's own profile or other's
  const { data: ownProfile, isLoading: isLoadingOwn } = useProfile();
  const { data: otherProfile, isLoading: isLoadingOther } = useUserProfile(
    isOwnProfile ? '' : username,
  );
  const updateProfile = useUpdateProfile();
  const followUser = useFollowUser(isOwnProfile ? '' : username);
  const unfollowUser = useUnfollowUser(isOwnProfile ? '' : username);

  // Lock user mutation
  const lockMutation = useMutation({
    mutationFn: (request: { userId: string; day: number; reason: string }) =>
      userManagementService.lockUser(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setLockDialogOpen(false);
      setLockDays(7);
      setLockReason('');
      toast.success('Tài khoản đã được khóa thành công.');
    },
    onError: (error: Error) => {
      // Handle specific error messages from backend
      const errorObj = error as unknown as { response?: { data?: { message?: string } } };
      const errorMessage =
        errorObj?.response?.data?.message || error?.message || 'Không thể khóa tài khoản.';

      // Check for "Invalid action" error (account already locked)
      if (
        errorMessage.includes('Hành động không hợp lệ') ||
        errorMessage.includes('không hợp lệ')
      ) {
        toast.error('Tài khoản này đã được khóa. Vui lòng mở khóa trước khi khóa lại.');
      } else {
        toast.error(errorMessage);
      }
    },
  });

  // Unlock user mutation
  const unlockMutation = useMutation({
    mutationFn: (request: { userId: string }) => userManagementService.unlockUser(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setUnlockDialogOpen(false);
      toast.success('Tài khoản đã được mở khóa thành công.');
    },
    onError: (error: Error) => {
      // Handle specific error messages from backend
      const errorObj = error as unknown as { response?: { data?: { message?: string } } };
      const errorMessage =
        errorObj?.response?.data?.message || error?.message || 'Không thể mở khóa tài khoản.';

      // Check for "Invalid action" error (account already unlocked)
      if (
        errorMessage.includes('Hành động không hợp lệ') ||
        errorMessage.includes('không hợp lệ')
      ) {
        toast.error('Tài khoản này đã được mở khóa hoặc không trong tình trạng khóa.');
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const isLoading = isOwnProfile ? isLoadingOwn : isLoadingOther;
  const profileData = isOwnProfile ? ownProfile : otherProfile;

  // Helper function to check if account is locked
  const isAccountLocked = (lockoutEnd: string | null | undefined): boolean => {
    if (!lockoutEnd) return false;
    return new Date(lockoutEnd) > new Date();
  };

  // Build profile user object from API data
  const profileUser = profileData
    ? {
        id: profileData.id,
        username: profileData.userName,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
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
        isFollowing: profileData.isFollowing ?? false,
        status: isAccountLocked(profileData.lockoutEnd) ? 'Locked' : 'Active',
        lockReason: profileData.lockReason || null,
        lockoutEnd: profileData.lockoutEnd || null,
      }
    : null;

  const handleShare = async () => {
    if (!profileUser) return;

    const profileUrl = `${window.location.origin}/profile/${username}`;
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
    if (!username || !profileUser || !currentUser) {
      return;
    }

    if (profileUser.isFollowing) {
      // Unfollow
      unfollowUser.mutate(profileUser.id);
    } else {
      // Follow
      followUser.mutate(profileUser.id);
    }
  };

  // const handleBlock = () => {
  //   // TODO: API call to block user
  //   alert('Chức năng chặn người dùng hiện tại chưa được hỗ trợ.');
  // };

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
    if (isOwnProfile) {
      fileInputRef.current?.click();
    }
  };

  const canLockUser = hasPermission(currentUser ?? null, PermissionPolicies.USER_MANAGEMENT_UPDATE);

  const handleLock = () => {
    setLockDialogOpen(true);
  };

  const handleUnlock = () => {
    setUnlockDialogOpen(true);
  };

  const confirmLock = () => {
    if (profileUser && lockDays >= 1 && lockReason.trim().length >= 3) {
      lockMutation.mutate({
        userId: profileUser.id,
        day: lockDays,
        reason: lockReason,
      });
    }
  };

  const confirmUnlock = () => {
    if (profileUser) {
      unlockMutation.mutate({
        userId: profileUser.id,
      });
    }
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
              <Button
                className="mt-4 bg-[#99b94a] hover:bg-[#88a43a]"
                onClick={() => router.push('/')}
              >
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
                  className={`border-primary/20 size-20 border-2 sm:size-24 ${isOwnProfile ? 'cursor-pointer transition-opacity hover:opacity-80' : ''}`}
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
                  {isOwnProfile && (
                    <>
                      <button
                        onClick={() => setShowFollowingDialog(true)}
                        className="flex items-center gap-1.5 transition-colors hover:text-[#99b94a] sm:gap-2"
                      >
                        <span className="text-base font-semibold sm:text-lg">
                          {profileUser.followingCount.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground text-xs sm:text-sm">
                          Đang theo dõi
                        </span>
                      </button>
                      <button
                        onClick={() => setShowFollowersDialog(true)}
                        className="flex items-center gap-1.5 transition-colors hover:text-[#99b94a] sm:gap-2"
                      >
                        <span className="text-base font-semibold sm:text-lg">
                          {profileUser.followersCount.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground text-xs sm:text-sm">
                          Đang theo dõi
                        </span>
                      </button>
                    </>
                  )}
                  {!isOwnProfile && (
                    <>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-base font-semibold sm:text-lg">
                          {profileUser.followingCount.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground text-xs sm:text-sm">
                          Đang theo dõi
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-base font-semibold sm:text-lg">
                          {profileUser.followersCount.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground text-xs sm:text-sm">
                          Đang theo dõi
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bio - Mobile only */}
            <p className="text-foreground -mt-2 max-w-2xl text-sm leading-relaxed sm:hidden">
              {profileUser.bio}
            </p>

            {/* Action Buttons */}
            <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">
              {isOwnProfile ? (
                <>
                  <Button
                    className="flex-1 text-[#99b94a] sm:flex-none"
                    variant="outline"
                    size="sm"
                    onClick={handleEditProfile}
                  >
                    <Edit className="size-4" />
                    <span className="sm:inline">Sửa hồ sơ</span>
                  </Button>
                  <Button
                    className="text-[#99b94a]"
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                  >
                    <Share2 className="size-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant={profileUser.isFollowing ? 'secondary' : 'default'}
                    size="sm"
                    className={`flex-1 sm:flex-none ${
                      profileUser.isFollowing
                        ? 'text-[#99b94a] hover:bg-gray-300'
                        : 'bg-[#99b94a] text-white hover:bg-[#91af46]'
                    }`}
                    onClick={handleFollow}
                    disabled={followUser.isPending || unfollowUser.isPending}
                  >
                    {profileUser.isFollowing ? (
                      <>
                        <UserCheck className="size-4" />
                        <span className="hidden sm:inline">Đang theo dõi</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="size-4" />
                        <span className="hidden sm:inline">Theo dõi</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="text-[#99b94a]"
                    size="sm"
                    onClick={handleShare}
                  >
                    <Share2 className="size-4" />
                  </Button>
                  {/* Lock/Unlock Button - Only show if user has permission */}
                  {canLockUser && (
                    <>
                      {profileUser.status === 'Locked' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleUnlock}
                          disabled={unlockMutation.isPending}
                          className="text-green-600 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Mở khóa tài khoản"
                        >
                          <Unlock className="mr-1 h-4 w-4" />
                          {unlockMutation.isPending ? (
                            <span className="hidden sm:inline">Đang mở...</span>
                          ) : (
                            <span className="hidden sm:inline">Mở Khóa</span>
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleLock}
                          disabled={lockMutation.isPending}
                          className="text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Khóa tài khoản"
                        >
                          <Lock className="mr-1 h-4 w-4" />
                          {lockMutation.isPending ? (
                            <span className="hidden sm:inline">Đang khóa...</span>
                          ) : (
                            <span className="hidden sm:inline">Khóa</span>
                          )}
                        </Button>
                      )}
                    </>
                  )}
                  {/* <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-[#99b94a]" size="sm">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem variant="danger" onClick={handleBlock}>
                        <Ban className="mr-2 size-4" />
                        Chặn người dùng
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu> */}
                  {/* Report User Button */}
                  <ReportTrigger
                    targetId={profileUser.id}
                    targetType={ReportTargetType.USER}
                    targetName={profileUser.fullName}
                    variant="outline"
                    size="sm"
                    className="text-[#99b94a]"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recipes Section */}
        <div className="bg-card rounded-lg border p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold sm:text-xl">
            Công thức ({profileUser.recipesCount})
          </h2>
          {(() => {
            const userName = profileData?.userName || '';
            return (
              <UserRecipesList
                userName={userName}
                isOwnProfile={isOwnProfile}
                onRecipeCountChange={setRecipeCount}
              />
            );
          })()}
        </div>
      </div>

      {/* Followers/Following Dialogs */}
      {isOwnProfile && (
        <>
          <FollowersDialog open={showFollowersDialog} onOpenChange={setShowFollowersDialog} />
          <FollowingDialog open={showFollowingDialog} onOpenChange={setShowFollowingDialog} />
        </>
      )}

      {/* Lock User Dialog */}
      {!isOwnProfile && canLockUser && (
        <Dialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Khóa Tài Khoản Người Dùng</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn khóa tài khoản của {profileUser?.firstName}{' '}
                {profileUser?.lastName} không?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Lock Days Input */}
              <div>
                <Label htmlFor="days" className="mb-2 block">
                  Số ngày khóa
                </Label>
                <input
                  id="days"
                  type="number"
                  min="1"
                  value={lockDays}
                  onChange={(e) => setLockDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#99b94a] focus:outline-none"
                  placeholder="Nhập số ngày"
                />
                {lockDays < 1 && (
                  <p className="mt-1 text-xs text-red-500">Số ngày phải từ 1 trở lên</p>
                )}
              </div>

              {/* Lock Reason Input */}
              <div>
                <Label htmlFor="reason" className="mb-2 flex items-center justify-between">
                  <span>Lý do khóa</span>
                  <span
                    className={`text-xs font-medium ${
                      lockReason.length > 512
                        ? 'text-red-500'
                        : lockReason.length < 50
                          ? 'text-amber-500'
                          : 'text-green-500'
                    }`}
                  >
                    {lockReason.length} / 512
                  </span>
                </Label>
                <textarea
                  id="reason"
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value.slice(0, 512))}
                  placeholder="Mô tả chi tiết lý do khóa tài khoản (tối thiểu 3 ký tự)"
                  className={`w-full rounded-md border p-3 text-sm transition-colors ${
                    lockReason.trim().length < 3
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-white focus:outline-none'
                      : 'border-gray-300 focus:border-[#99b94a] focus:outline-none'
                  }`}
                  rows={3}
                />
                {lockReason.length < 3 && lockReason.length > 0 && (
                  <div className="mt-2 text-xs text-red-500">
                    Cần thêm {3 - lockReason.length} ký tự nữa
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setLockDialogOpen(false)}>
                Hủy
              </Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={confirmLock}
                disabled={lockDays < 1 || lockReason.trim().length < 3 || lockMutation.isPending}
                title={
                  lockDays < 1
                    ? 'Số ngày phải từ 1 trở lên'
                    : lockReason.trim().length < 3
                      ? 'Lý do khóa phải từ 3 ký tự trở lên'
                      : ''
                }
              >
                {lockMutation.isPending ? 'Đang khóa...' : 'Khóa Tài Khoản'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Unlock User Dialog */}
      {!isOwnProfile && canLockUser && (
        <Dialog open={unlockDialogOpen} onOpenChange={setUnlockDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-[#99b94a]">Mở Khóa Tài Khoản Người Dùng</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn mở khóa tài khoản của {profileUser?.firstName}{' '}
                {profileUser?.lastName} không?
              </DialogDescription>
            </DialogHeader>

            {profileUser?.status === 'Locked' && (
              <div className="space-y-3 rounded-lg bg-red-50 p-4">
                {profileUser.lockReason && (
                  <div>
                    <p className="text-sm font-semibold text-red-900">Lý do khóa:</p>
                    <p className="mt-1 text-sm text-red-800">{profileUser.lockReason}</p>
                  </div>
                )}
                {profileUser.lockoutEnd && (
                  <div>
                    <p className="text-sm font-semibold text-red-900">Mở khóa vào:</p>
                    <p className="mt-1 text-sm text-red-800">
                      {new Date(profileUser.lockoutEnd).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setUnlockDialogOpen(false)}>
                Hủy
              </Button>
              <Button
                className="bg-[#99b94a] text-white hover:bg-[#88a83a]"
                onClick={confirmUnlock}
                disabled={unlockMutation.isPending}
              >
                {unlockMutation.isPending ? 'Đang mở khóa...' : 'Mở Khóa Tài Khoản'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
