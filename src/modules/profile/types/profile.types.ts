import { z } from 'zod';

// Profile DTO from API
export interface ProfileDto {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  avatarUrl?: string | null;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  activityLevel?: string;
  dateOfBirth?: string;
  bio?: string;
  location?: string;
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
  dateOfBirth: z.date(),
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
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

// Update Profile DTO for API
export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: Date;
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
