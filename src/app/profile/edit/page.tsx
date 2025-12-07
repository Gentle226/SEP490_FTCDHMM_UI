'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDownIcon, Save, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { DashboardLayout } from '@/base/components/layout/dashboard-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/base/components/ui/avatar';
import { Button } from '@/base/components/ui/button';
import { DatePickerWithInput } from '@/base/components/ui/date-picker-with-input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/base/components/ui/dropdown-menu';
import { Input } from '@/base/components/ui/input';
import { Label } from '@/base/components/ui/label';
import { Skeleton } from '@/base/components/ui/skeleton';
import { Textarea } from '@/base/components/ui/textarea';
import { ChangePasswordDialog, useAuth } from '@/modules/auth';
import { updateProfileSchema, useProfile, useUpdateProfile } from '@/modules/profile';
import type { UpdateProfileSchema } from '@/modules/profile';

export default function EditProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<'Male' | 'Female' | ''>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const form = useForm<UpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: '',
      dateOfBirth: undefined,
      avatarUrl: null,
      bio: '',
      address: '',
    },
  });

  // Populate form when profile data is loaded
  useEffect(() => {
    if (profile) {
      const dob = profile.dateOfBirth ? new Date(profile.dateOfBirth) : undefined;
      setSelectedDate(dob);

      // Convert gender from API format (MALE/FEMALE) to form format (Male/Female)
      const normalizedGender = profile.gender
        ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1).toLowerCase()
        : '';
      setSelectedGender((normalizedGender as 'Male' | 'Female') || '');

      form.reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        gender: normalizedGender,
        dateOfBirth: dob,
        avatarUrl: null,
        bio: profile.bio || '',
        address: profile.address || '',
      });

      // Set avatar preview if exists
      if (profile.avatarUrl) {
        setAvatarPreview(profile.avatarUrl);
      }
    }
  }, [profile, form]);

  const onSubmit = async (data: UpdateProfileSchema) => {
    try {
      await updateProfile.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        avatarUrl: data.avatarUrl || null,
        bio: data.bio || null,
        address: data.address || null,
      });

      // After successful update, redirect to profile
      router.push(`/profile/${user?.userName}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      // Error handling is done in the mutation
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        form.setError('avatarUrl', {
          type: 'manual',
          message: 'Kích thước file không được vượt quá 2MB',
        });
        return;
      }

      // Validate file type - only JPG, PNG, and GIF are supported
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        form.setError('avatarUrl', {
          type: 'manual',
          message: 'Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF',
        });
        return;
      }

      form.setValue('avatarUrl', file);
      form.clearErrors('avatarUrl');

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="text-lg">Vui lòng đăng nhập để chỉnh sửa hồ sơ</div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-2xl space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="bg-card space-y-6 rounded-lg border p-6">
            <div className="flex items-center gap-6">
              <Skeleton className="size-24 rounded-full" />
              <Skeleton className="h-10 w-48" />
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-4 px-2 sm:space-y-6 sm:px-4 md:px-0">
        <div>
          <h1 className="text-xl font-bold text-[#99b94a] sm:text-2xl md:text-3xl">
            Chỉnh sửa hồ sơ
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Cập nhật thông tin cá nhân của bạn
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-3 sm:gap-4 md:grid-cols-[30%_1fr] md:gap-6">
          {/* Left Column - Avatar & Identity (30%) */}
          <div className="bg-card rounded-lg border p-3 sm:p-4 md:p-6">
            <div className="flex flex-col items-center space-y-2 sm:space-y-3 md:space-y-4">
              {/* Avatar - Centered */}
              <Avatar className="border-primary/20 size-20 border-2 sm:size-24 md:size-32">
                <AvatarImage
                  src={
                    avatarPreview ||
                    profile?.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`
                  }
                  alt={user.fullName || user.email}
                />
                <AvatarFallback className="text-2xl sm:text-3xl md:text-4xl">
                  {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
                </AvatarFallback>
              </Avatar>

              {/* Change Avatar Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                aria-label="Upload an avatar image"
              />
              <Button
                variant="outline"
                className="w-full text-xs text-[#99b94a] sm:w-auto sm:text-sm"
                size="sm"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-3 sm:size-4" />
                <span className="xs:inline hidden">Thay đổi ảnh</span>
                <span className="xs:hidden inline">Đổi ảnh</span>
              </Button>

              {/* File format info */}
              <p className="text-muted-foreground px-1 text-center text-[11px] sm:text-xs">
                JPG, PNG hoặc GIF. Tối đa 2MB.
              </p>

              {/* Avatar error */}
              {form.formState.errors.avatarUrl && (
                <p className="text-danger text-center text-xs sm:text-sm">
                  {form.formState.errors.avatarUrl.message}
                </p>
              )}

              {/* Display Name/Email */}
              <div className="w-full space-y-1 border-t pt-3 text-center sm:pt-4">
                <p className="text-foreground truncate text-xs font-semibold sm:text-sm">
                  {user.firstName} {user.lastName}
                </p>
                <div className="space-y-0.5 sm:space-y-1">
                  <p className="text-muted-foreground text-[11px] sm:text-xs">Email của bạn</p>
                  <p className="text-foreground text-[11px] break-all sm:text-xs">
                    {profile?.email || user.email}
                  </p>
                </div>
              </div>

              {/* Change Password Button - Bottom of left column */}
              <div className="mt-3 w-full border-t pt-3 sm:mt-4 sm:pt-4">
                <div className="flex w-full justify-center">
                  <ChangePasswordDialog />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form (70%) */}
          <div className="bg-card rounded-lg border p-3 sm:p-4 md:p-6">
            <form
              onSubmit={form.handleSubmit(onSubmit, (errors) => {
                // Show toast for validation errors
                if (errors.dateOfBirth) {
                  toast.error(errors.dateOfBirth.message || 'Vui lòng chọn ngày sinh');
                } else if (errors.firstName) {
                  toast.error(errors.firstName.message || 'Vui lòng nhập họ');
                } else if (errors.lastName) {
                  toast.error(errors.lastName.message || 'Vui lòng nhập tên');
                } else if (errors.gender) {
                  toast.error(errors.gender.message || 'Vui lòng chọn giới tính');
                }
              })}
              className="space-y-3 sm:space-y-4 md:space-y-6"
            >
              {/* Row 1: First Name & Last Name (50% - 50%) */}
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 md:gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-xs text-[#99b94a] sm:text-sm" htmlFor="firstName">
                    Họ <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Nhập họ của bạn"
                    className="h-9 text-sm sm:h-10"
                    {...form.register('firstName')}
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-danger text-xs sm:text-sm">
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-xs text-[#99b94a] sm:text-sm" htmlFor="lastName">
                    Tên <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Nhập tên của bạn"
                    className="h-9 text-sm sm:h-10"
                    {...form.register('lastName')}
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-danger text-xs sm:text-sm">
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Date of Birth & Gender (50% - 50%) */}
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 md:gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-xs text-[#99b94a] sm:text-sm">
                    Ngày sinh <span className="text-red-500">*</span>
                  </Label>
                  <DatePickerWithInput
                    date={selectedDate}
                    onDateChange={(date) => {
                      setSelectedDate(date);
                      if (date) {
                        form.setValue('dateOfBirth', date);
                        form.clearErrors('dateOfBirth');
                      } else {
                        // Clear the form value when date is undefined/cleared
                        form.setValue('dateOfBirth', undefined as unknown as Date);
                      }
                    }}
                    placeholder="dd/mm/yyyy"
                  />
                  {form.formState.errors.dateOfBirth && (
                    <p className="text-xs text-red-500 sm:text-sm">
                      {form.formState.errors.dateOfBirth.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-xs text-[#99b94a] sm:text-sm">
                    Giới tính <span className="text-red-500">*</span>
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="outline" className="w-full justify-between">
                        <span>
                          {selectedGender === 'Male'
                            ? 'Nam'
                            : selectedGender === 'Female'
                              ? 'Nữ'
                              : 'Chọn giới tính'}
                        </span>
                        <ChevronDownIcon className="size-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-[--radix-dropdown-menu-trigger-width]"
                    >
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedGender('Male');
                          form.setValue('gender', 'Male');
                        }}
                      >
                        Nam
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedGender('Female');
                          form.setValue('gender', 'Female');
                        }}
                      >
                        Nữ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <input type="hidden" {...form.register('gender')} value={selectedGender} />
                  {form.formState.errors.gender && (
                    <p className="text-xs text-red-500 sm:text-sm">
                      {form.formState.errors.gender.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 3: Address (100% - Full width) */}
              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs text-[#99b94a] sm:text-sm" htmlFor="address">
                  Địa chỉ
                </Label>
                <Input
                  id="address"
                  placeholder="Nhập địa chỉ của bạn"
                  className="h-9 text-sm sm:h-10"
                  {...form.register('address')}
                />
                {form.formState.errors.address && (
                  <p className="text-danger text-xs sm:text-sm">
                    {form.formState.errors.address.message}
                  </p>
                )}
              </div>

              {/* Row 4: Bio (100% - Full width) */}
              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs text-[#99b94a] sm:text-sm" htmlFor="bio">
                  Giới thiệu bản thân
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Viết một số thông tin về bạn..."
                  className="min-h-24 resize-none text-sm sm:min-h-28 md:min-h-32"
                  {...form.register('bio')}
                />
                {form.formState.errors.bio && (
                  <p className="text-danger text-xs sm:text-sm">
                    {form.formState.errors.bio.message}
                  </p>
                )}
              </div>

              {/* Row 5: Footer Buttons (Right aligned) */}
              <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end sm:gap-3 sm:pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 text-xs sm:h-10 sm:text-sm"
                  onClick={() => router.push(`/profile/${user.userName}`)}
                  disabled={updateProfile.isPending}
                >
                  Trở về
                </Button>
                <Button
                  className="h-9 bg-[#99b94a] text-xs hover:bg-[#88a43a] sm:h-10 sm:text-sm"
                  type="submit"
                  loading={updateProfile.isPending}
                >
                  <Save className="size-3 sm:size-4" />
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
