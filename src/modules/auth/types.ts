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
  refreshToken: string;
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
    gender: z.enum(['Male', 'Female'], {
      errorMap: () => ({ message: 'Vui lòng chọn giới tính' }),
    }),
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
  purpose: z
    .enum(['VERIFYACCOUNTEMAIL', 'FORGOTPASSWORD', 'confirm', 'reset'])
    .default('VERIFYACCOUNTEMAIL'),
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
  MODERATOR = 'Moderator',
  ADMIN = 'Admin',
}

// User type based on API structure
export interface User {
  id: string;
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
}

// Permission policies matching API
export const PermissionPolicies = {
  USER_MANAGEMENT_CREATE: 'UserManagement:Create',
  USER_MANAGEMENT_UPDATE: 'UserManagement:Update',
  USER_MANAGEMENT_DELETE: 'UserManagement:Delete',
  USER_MANAGEMENT_VIEW: 'UserManagement:View',
  // Recipe Management Permissions
  RECIPE_MANAGEMENT_VIEW: 'Recipe:ManagementView',
  RECIPE_DELETE: 'Recipe:Delete',
  RECIPE_LOCK: 'Recipe:Lock',
  RECIPE_APPROVE: 'Recipe:Approve',
} as const;
