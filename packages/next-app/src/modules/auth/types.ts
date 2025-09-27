import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().nonempty('Email không được để trống').email('Email không hợp lệ'),
  password: z.string().trim().nonempty('Mật khẩu không được để trống'),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export type LoginSuccessResponse = {
  token: string;
};

export type RefreshTokenSuccessResponse = LoginSuccessResponse;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .nonempty('Họ không được để trống')
      .max(50, 'Họ không được quá 50 ký tự'),
    lastName: z
      .string()
      .trim()
      .nonempty('Tên không được để trống')
      .max(50, 'Tên không được quá 50 ký tự'),
    email: z.string().trim().nonempty('Email không được để trống').email('Email không hợp lệ'),
    password: z
      .string()
      .trim()
      .min(6, 'Mật khẩu phải có tối thiểu 6 ký tự')
      .max(100, 'Mật khẩu không được quá 100 ký tự'),
    rePassword: z.string().trim().nonempty('Mật khẩu xác nhận không được để trống'),
    phoneNumber: z
      .string()
      .trim()
      .nonempty('Số điện thoại không được để trống')
      .regex(/^0\d{8,9}$/, 'Số điện thoại phải bắt đầu bằng 0 và có 9-10 chữ số'),
  })
  .refine((v) => v.password === v.rePassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['rePassword'],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;

export const verifyEmailOtpSchema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().nonempty(),
});
export type VerifyEmailOtpSchema = z.infer<typeof verifyEmailOtpSchema>;

export const resendOtpSchema = z.object({
  email: z.string().trim().email(),
  purpose: z
    .enum(['confirm', 'confirmemail', 'forgot', 'forgotpassword', 'reset'])
    .default('confirm'),
});
export type ResendOtpSchema = z.infer<typeof resendOtpSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordWithOtpSchema = z
  .object({
    email: z.string().trim().email(),
    code: z.string().trim().nonempty(),
    newPassword: z.string().trim().min(8),
    reNewPassword: z.string().trim().min(8),
  })
  .refine((v) => v.newPassword === v.reNewPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['reNewPassword'],
  });
export type ResetPasswordWithOtpSchema = z.infer<typeof resetPasswordWithOtpSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().trim().min(8),
    newPassword: z.string().trim().min(8),
    reNewPassword: z.string().trim().min(8),
  })
  .refine((v) => v.newPassword === v.reNewPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['reNewPassword'],
  });
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

export enum Role {
  CUSTOMER = 'CUSTOMER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}
