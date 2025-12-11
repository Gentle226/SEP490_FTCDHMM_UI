import { z } from 'zod';

import { SuccessResponse } from '@/base/types';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  password: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập mật khẩu')
    .min(8, 'Mật khẩu phải có tối thiểu 8 ký tự')
    .max(100, 'Mật khẩu không được quá 100 ký tự'),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export type LoginSuccessResponse = SuccessResponse<{
  accessToken: string;
  refreshToken?: string; // Optional: backend doesn't support refresh tokens
  user: User;
}>;

export type RefreshTokenSuccessResponse = LoginSuccessResponse;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập tên')
      .max(50, 'Tên không được quá 50 ký tự')
      .refine(
        (val) =>
          /^[a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỡđ\s]*$/.test(
            val,
          ),
        {
          message: 'Tên chỉ được chứa chữ cái',
        },
      ),
    lastName: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập họ')
      .max(50, 'Họ không được quá 50 ký tự')
      .refine(
        (val) =>
          /^[a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỡđ\s]*$/.test(
            val,
          ),
        {
          message: 'Họ chỉ được chứa chữ cái',
        },
      ),
    email: z.string().trim().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
    password: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập mật khẩu')
      .min(8, 'Mật khẩu phải có tối thiểu 8 ký tự')
      .max(100, 'Mật khẩu không được quá 100 ký tự')
      .refine((val) => /[a-z]/.test(val), {
        message: 'Mật khẩu phải có ít nhất một chữ thường',
      })
      .refine((val) => /[A-Z]/.test(val), {
        message: 'Mật khẩu phải có ít nhất một chữ hoa',
      })
      .refine((val) => /\d/.test(val), {
        message: 'Mật khẩu phải có ít nhất một chữ số',
      })
      .refine((val) => /[@$!%*?&]/.test(val), {
        message: 'Mật khẩu phải có ít nhất một ký tự đặc biệt (@$!%*?&)',
      }),
    rePassword: z.string().trim().min(1, 'Vui lòng xác nhận mật khẩu'),
    dateOfBirth: z
      .date({
        required_error: 'Vui lòng chọn ngày sinh',
        invalid_type_error: 'Ngày sinh không hợp lệ',
      })
      .max(new Date(), 'Ngày sinh không được là tương lai')
      .refine(
        (date) => {
          const today = new Date();
          const age = today.getFullYear() - date.getFullYear();
          const monthDiff = today.getMonth() - date.getMonth();
          const dayDiff = today.getDate() - date.getDate();

          // Adjust age if birthday hasn't occurred this year
          const adjustedAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

          return adjustedAge >= 1 && adjustedAge <= 120;
        },
        {
          message: 'Tuổi phải từ 1 đến 120',
        },
      ),
    gender: z.enum(['Male', 'Female']).optional(),
  })
  .refine((v) => v.password === v.rePassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['rePassword'],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;

export const verifyEmailOtpSchema = z.object({
  email: z.string().trim().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  code: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập mã OTP')
    .regex(/^\d{6}$/, 'Mã OTP phải là 6 chữ số'),
});
export type VerifyEmailOtpSchema = z.infer<typeof verifyEmailOtpSchema>;

export const resendOtpSchema = z.object({
  email: z.string().trim().email(),
});
export type ResendOtpSchema = z.infer<typeof resendOtpSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
});
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordWithOtpSchema = z
  .object({
    email: z.string().trim().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
    token: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập mã OTP')
      .regex(/^\d{6}$/, 'Mã OTP phải là 6 chữ số'),
    newPassword: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập mật khẩu mới')
      .min(8, 'Mật khẩu phải có tối thiểu 8 ký tự')
      .max(100, 'Mật khẩu không được quá 100 ký tự')
      .refine((val) => /[a-z]/.test(val), {
        message: 'Mật khẩu phải có ít nhất một chữ thường',
      })
      .refine((val) => /[A-Z]/.test(val), {
        message: 'Mật khẩu phải có ít nhất một chữ hoa',
      })
      .refine((val) => /\d/.test(val), {
        message: 'Mật khẩu phải có ít nhất một chữ số',
      })
      .refine((val) => /[@$!%*?&]/.test(val), {
        message: 'Mật khẩu phải có ít nhất một ký tự đặc biệt (@$!%*?&)',
      }),
    rePassword: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập xác nhận mật khẩu')
      .min(8, 'Mật khẩu xác nhận phải có tối thiểu 8 ký tự'),
  })
  .refine((v) => v.newPassword === v.rePassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['rePassword'],
  });
export type ResetPasswordWithOtpSchema = z.infer<typeof resetPasswordWithOtpSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập mật khẩu hiện tại')
      .min(8, 'Mật khẩu hiện tại phải có tối thiểu 8 ký tự')
      .max(100, 'Mật khẩu hiện tại không được quá 100 ký tự'),
    newPassword: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập mật khẩu mới')
      .min(8, 'Mật khẩu mới phải có tối thiểu 8 ký tự')
      .max(100, 'Mật khẩu mới không được quá 100 ký tự')
      .refine((val) => /[a-z]/.test(val), {
        message: 'Mật khẩu phải có ít nhất một chữ thường',
      })
      .refine((val) => /[A-Z]/.test(val), {
        message: 'Mật khẩu phải có ít nhất một chữ hoa',
      })
      .refine((val) => /\d/.test(val), {
        message: 'Mật khẩu phải có ít nhất một chữ số',
      })
      .refine((val) => /[@$!%*?&]/.test(val), {
        message: 'Mật khẩu phải có ít nhất một ký tự đặc biệt (@$!%*?&)',
      }),
    rePassword: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập xác nhận mật khẩu')
      .min(8, 'Mật khẩu xác nhận phải có tối thiểu 8 ký tự'),
  })
  .refine((v) => v.newPassword === v.rePassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['rePassword'],
  });
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

// Schema chỉ nhập OTP
export const otpOnlySchema = z.object({
  code: z.string().trim().min(1, 'Vui lòng nhập mã OTP'),
});

// Schema chỉ nhập password mới và xác nhận
export const passwordOnlySchema = z
  .object({
    newPassword: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập mật khẩu mới')
      .min(8, 'Mật khẩu phải có tối thiểu 8 ký tự')
      .max(100, 'Mật khẩu không được quá 100 ký tự')
      .refine((val) => /[a-z]/.test(val), {
        message: 'Mật khẩu phải có ít nhất một chữ thường',
      })
      .refine((val) => /[A-Z]/.test(val), {
        message: 'Mật khẩu phải có ít nhất một chữ hoa',
      })
      .refine((val) => /\d/.test(val), {
        message: 'Mật khẩu phải có ít nhất một chữ số',
      })
      .refine((val) => /[@$!%*?&]/.test(val), {
        message: 'Mật khẩu phải có ít nhất một ký tự đặc biệt (@$!%*?&)',
      }),
    rePassword: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập xác nhận mật khẩu')
      .min(8, 'Mật khẩu xác nhận phải có tối thiểu 8 ký tự'),
  })
  .refine((v) => v.newPassword === v.rePassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['rePassword'],
  });

export type Step = 'email' | 'otp' | 'password' | 'success';

export enum Role {
  CUSTOMER = 'Customer',
  ADMIN = 'Admin',
}

// User type based on API structure
export interface User {
  id: string;
  userName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phoneNumber?: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: string[];
}

// Permission policies matching API (Vietnamese format from backend)
export const PermissionPolicies = {
  // User Management
  USER_MANAGEMENT_VIEW: 'Quản lí người dùng:Xem',
  USER_MANAGEMENT_UPDATE: 'Quản lí người dùng:Cập nhật',
  USER_MANAGEMENT_DELETE: 'Quản lí người dùng:Xóa',
  USER_MANAGEMENT_CREATE: 'Quản lí người dùng:Tạo',

  // Ingredient Management
  INGREDIENT_CREATE: 'Nguyên liệu:Tạo',
  INGREDIENT_UPDATE: 'Nguyên liệu:Cập nhật',
  INGREDIENT_DELETE: 'Nguyên liệu:Xóa',
  INGREDIENT_MANAGER_VIEW: 'Nguyên liệu:Xem với quyền',

  // Label Management
  LABEL_DELETE: 'Nhãn món ăn:Xóa',
  LABEL_CREATE: 'Nhãn món ăn:Tạo',
  LABEL_UPDATE: 'Nhãn món ăn:Cập nhật',

  // Ingredient Category
  INGREDIENT_CATEGORY_CREATE: 'Nhóm nguyên liệu:Tạo',
  INGREDIENT_CATEGORY_DELETE: 'Nhóm nguyên liệu:Xóa',

  // Health Goal
  HEALTH_GOAL_CREATE: 'Mục tiêu sức khỏe:Tạo',
  HEALTH_GOAL_UPDATE: 'Mục tiêu sức khỏe:Cập nhật',
  HEALTH_GOAL_DELETE: 'Mục tiêu sức khỏe:Xóa',

  // Comment
  COMMENT_CREATE: 'Bình luận:Tạo',
  COMMENT_DELETE: 'Bình luận:Xóa',
  COMMENT_UPDATE: 'Bình luận:Cập nhật',

  // Rating
  RATING_CREATE: 'Đánh giá:Tạo',
  RATING_DELETE: 'Đánh giá:Xóa',
  RATING_UPDATE: 'Đánh giá:Cập nhật',

  // Recipe Management
  RECIPE_MANAGEMENT_VIEW: 'Công thức:Xem với quyền',
  RECIPE_DELETE: 'Công thức:Xóa',
  RECIPE_LOCK: 'Công thức:Khóa',
  RECIPE_APPROVE: 'Công thức:Xác nhận',

  // Report Management
  REPORT_VIEW: 'Báo cáo:Xem',
  REPORT_APPROVE: 'Báo cáo:Xác nhận',
  REPORT_REJECT: 'Báo cáo:Từ chối',

  // Role Management
  ROLE_CREATE: 'Vai trò:Tạo',
  ROLE_VIEW: 'Vai trò:Xem',
  ROLE_UPDATE: 'Vai trò:Cập nhật',
  ROLE_DELETE: 'Vai trò:Xóa',
} as const;

// Helper function to check if user has permission
export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
};

// Helper function to check if user has any of the permissions
export const hasAnyPermission = (user: User | null, permissions: string[]): boolean => {
  if (!user || !user.permissions) return false;
  return permissions.some((permission) => user.permissions?.includes(permission));
};
