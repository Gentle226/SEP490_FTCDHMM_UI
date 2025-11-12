'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDownIcon, Save, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

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
import { ChangePasswordDialog, useAuth } from '@/modules/auth';
import { updateProfileSchema, useProfile, useUpdateProfile } from '@/modules/profile';
import type { UpdateProfileSchema } from '@/modules/profile';

export default function EditProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
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
    },
  });

  // Populate form when profile data is loaded
  useEffect(() => {
    if (profile) {
      const dob = profile.dateOfBirth ? new Date(profile.dateOfBirth) : undefined;
      setSelectedDate(dob);
      setSelectedGender((profile.gender as 'Male' | 'Female' | 'Other') || '');

      form.reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        gender: profile.gender,
        dateOfBirth: dob,
        avatarUrl: null,
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
      });

      // After successful update, redirect to profile
      router.push(`/profile/${user?.id}`);
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
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#99b94a]">Chỉnh sửa hồ sơ</h1>
            <p className="text-muted-foreground">Cập nhật thông tin cá nhân của bạn</p>
          </div>
          <ChangePasswordDialog />
        </div>

        <div className="bg-card rounded-lg border p-6">
          {/* Avatar Section */}
          <div className="mb-6 flex items-center gap-6">
            <Avatar className="border-primary/20 size-24 border-2">
              <AvatarImage
                src={
                  avatarPreview ||
                  profile?.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`
                }
                alt={user.fullName || user.email}
              />
              <AvatarFallback className="text-2xl">
                {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
              </AvatarFallback>
            </Avatar>
            <div>
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
                className="text-[#99b94a]"
                size="sm"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-4" />
                Thay đổi ảnh đại diện
              </Button>
              <p className="text-muted-foreground mt-2 text-sm">
                JPG, PNG hoặc GIF. Kích thước tối đa 2MB.
              </p>
              {form.formState.errors.avatarUrl && (
                <p className="text-danger mt-1 text-sm">
                  {form.formState.errors.avatarUrl.message}
                </p>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[#99b94a]" htmlFor="firstName">
                  Họ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="Nhập họ của bạn"
                  {...form.register('firstName')}
                />
                {form.formState.errors.firstName && (
                  <p className="text-danger text-sm">{form.formState.errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[#99b94a]" htmlFor="lastName">
                  Tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Nhập tên của bạn"
                  {...form.register('lastName')}
                />
                {form.formState.errors.lastName && (
                  <p className="text-danger text-sm">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Date of Birth and Gender on same line */}
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Date of Birth with DatePickerWithInput */}
              <div className="space-y-2">
                <Label className="text-[#99b94a]">
                  Ngày sinh <span className="text-red-500">*</span>
                </Label>
                <DatePickerWithInput
                  date={selectedDate}
                  onDateChange={(date) => {
                    setSelectedDate(date);
                    if (date) {
                      form.setValue('dateOfBirth', date);
                    }
                  }}
                  placeholder="dd/mm/yyyy"
                />
                {form.formState.errors.dateOfBirth && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.dateOfBirth.message}
                  </p>
                )}
              </div>

              {/* Gender with Dropdown */}
              <div className="space-y-2">
                <Label className="text-[#99b94a]">
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
                            : selectedGender === 'Other'
                              ? 'Khác'
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
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedGender('Other');
                        form.setValue('gender', 'Other');
                      }}
                    >
                      Khác
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <input type="hidden" {...form.register('gender')} value={selectedGender} />
                {form.formState.errors.gender && (
                  <p className="text-sm text-red-500">{form.formState.errors.gender.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/profile/${user.id}`)}
                disabled={updateProfile.isPending}
              >
                Trở về
              </Button>
              <Button
                className="bg-[#99b94a] hover:bg-[#88a43a]"
                type="submit"
                loading={updateProfile.isPending}
              >
                <Save className="size-4" />
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
