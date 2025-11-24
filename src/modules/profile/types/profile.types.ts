import { z } from 'zod';

// Helper function to calculate age
function calculateAge(date: Date): number {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  return age;
}

// Profile DTO from API
export interface ProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  gender: string;
  dateOfBirth?: string | Date;
  avatarUrl?: string | null;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  activityLevel?: string;
  bio?: string;
  address?: string;
}

// Update Profile Schema for form validation
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Vui lòng nhập họ')
    .max(50, 'Tên không được vượt quá 50 ký tự')
    .refine(
      (val) =>
        /^[a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỡđ\s]*$/.test(
          val,
        ),
      {
        message: 'Họ chỉ được chứa ký tự chữ cái',
      },
    ),
  lastName: z
    .string()
    .min(1, 'Vui lòng nhập tên')
    .max(50, 'Họ không được vượt quá 50 ký tự')
    .refine(
      (val) =>
        /^[a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỡđ\s]*$/.test(
          val,
        ),
      {
        message: 'Tên chỉ được chứa ký tự chữ cái',
      },
    ),
  gender: z.string().min(1, 'Vui lòng chọn giới tính'),
  dateOfBirth: z.date().refine(
    (date) => {
      const age = calculateAge(date);
      return age >= 1 && age <= 120;
    },
    {
      message: 'Tuổi phải nằm trong khoảng 1 đến 120 tuổi',
    },
  ),
  avatarUrl: z
    .instanceof(File)
    .optional()
    .nullable()
    .refine(
      (file) => !file || ['image/jpeg', 'image/png', 'image/gif'].includes(file.type),
      'Chỉ hỗ trợ hình ảnh JPG, PNG và GIF',
    )
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      'Kích thước ảnh không được vượt quá 5MB',
    ),
  bio: z
    .string()
    .max(256, 'Giới thiệu bản thân không được vượt quá 256 ký tự')
    .optional()
    .nullable(),
  address: z.string().max(256, 'Địa chỉ không được vượt quá 256 ký tự').optional().nullable(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

// Update Profile DTO for API
export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: Date;
  avatarUrl?: File | null;
  bio?: string | null;
  address?: string | null;
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
