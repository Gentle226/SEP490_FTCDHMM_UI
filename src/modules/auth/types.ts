import { z } from 'zod';

import { SuccessResponse } from '@/base/types';

export const loginSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').trim().email('Email không hợp lệ'),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu')
    .trim()
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
      .min(1, 'Vui lòng nhập họ')
      .trim()
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
    lastName: z
      .string()
      .min(1, 'Vui lòng nhập tên')
      .trim()
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
    email: z.string().min(1, 'Vui lòng nhập email').trim().email('Email không hợp lệ'),
    password: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu')
      .trim()
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
    rePassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    dateOfBirth: z
      .date({
        required_error: 'Vui lòng chọn ngày sinh',
        invalid_type_error: 'Ngày sinh không hợp lệ',
      })
      .max(new Date(), 'Ngày sinh không được là tương lai'),
    gender: z.enum(['Male', 'Female', 'Other'], {
      errorMap: () => ({ message: 'Vui lòng chọn giới tính' }),
    }),
  })
  .refine((v) => v.password === v.rePassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['rePassword'],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;

export const verifyEmailOtpSchema = z.object({
  email: z.string().trim().email(),
  code: z.string().min(1, 'Vui lòng nhập mã OTP').trim(),
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
  email: z.string().trim().email(),
});
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordWithOtpSchema = z
  .object({
    email: z.string().trim().email(),
    token: z.string().min(1, 'Token không hợp lệ').trim(),
    newPassword: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu mới')
      .trim()
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
      .min(1, 'Vui lòng nhập xác nhận mật khẩu')
      .trim()
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
      .min(1, 'Vui lòng nhập mật khẩu hiện tại')
      .trim()
      .min(8, 'Mật khẩu hiện tại phải có tối thiểu 8 ký tự')
      .max(100, 'Mật khẩu hiện tại không được quá 100 ký tự'),
    newPassword: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu mới')
      .trim()
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
      .min(1, 'Vui lòng nhập xác nhận mật khẩu')
      .trim()
      .min(8, 'Mật khẩu xác nhận phải có tối thiểu 8 ký tự'),
  })
  .refine((v) => v.newPassword === v.rePassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['rePassword'],
  });
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

// Schema chỉ nhập OTP
export const otpOnlySchema = z.object({
  code: z.string().min(1, 'Vui lòng nhập mã OTP').trim(),
});

// Schema chỉ nhập password mới và xác nhận
export const passwordOnlySchema = z
  .object({
    newPassword: z
      .string()
      .trim()
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
    rePassword: z.string().trim().min(8, 'Mật khẩu xác nhận phải có tối thiểu 8 ký tự'),
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
  MODERATOR_CREATE: 'ModeratorManagement:Create',
  MODERATOR_UPDATE: 'ModeratorManagement:Update',
  MODERATOR_DELETE: 'ModeratorManagement:Delete',
  MODERATOR_VIEW: 'ModeratorManagement:View',
  CUSTOMER_VIEW: 'CustomerManagement:View',
  CUSTOMER_UPDATE: 'CustomerManagement:Update',
  CUSTOMER_DELETE: 'CustomerManagement:Delete',
  CUSTOMER_CREATE: 'CustomerManagement:Create',
} as const;
