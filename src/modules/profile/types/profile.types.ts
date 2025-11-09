import { z } from 'zod';

// Profile DTO from API
export interface ProfileDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  avatarUrl?: string | null;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  activityLevel?: string;
}

// Update Profile Schema for form validation
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'Tên là bắt buộc').max(50, 'Tên không được vượt quá 50 ký tự'),
  lastName: z.string().min(1, 'Họ là bắt buộc').max(50, 'Họ không được vượt quá 50 ký tự'),
  phoneNumber: z
    .string()
    .regex(/^0\d{8,9}$/, 'Số điện thoại phải bắt đầu bằng 0 và có 9-10 chữ số'),
  gender: z.string().min(1, 'Giới tính là bắt buộc'),
  avatarUrl: z.instanceof(File).optional().nullable(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

// Update Profile DTO for API
export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  avatarUrl?: File | null;
}

// Extended Profile for UI with additional fields
export interface UserProfile extends ProfileDto {
  id: string;
  username?: string;
  handle?: string;
  bio?: string;
  location?: string;
  recipesCount?: number;
  createdAt?: string;
}

// User Follower DTO from API
export interface UserFollower {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
  fullName?: string;
}
