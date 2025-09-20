import { z } from 'zod';

import { SuccessResponse } from '@/base/types';

import { User } from '../users';

export const loginSchema = z.object({
  email: z.string().trim().nonempty('Email không được để trống').email('Email không hợp lệ'),
  password: z.string().trim().min(8, 'Mật khẩu phải có tối thiểu 8 ký tự'),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export type LoginSuccessResponse = SuccessResponse<{
  accessToken: string;
  refreshToken: string;
  user: User;
}>;

export type RefreshTokenSuccessResponse = LoginSuccessResponse;

export const registerSchema = z.object({
  email: z.string().trim().nonempty('Email không được để trống').email('Email không hợp lệ'),
  password: z.string().trim().min(8, 'Mật khẩu phải có tối thiểu 8 ký tự'),
});

export type RegisterSchema = z.infer<typeof registerSchema>;

export enum Role {
  CUSTOMER = 'CUSTOMER',
  HOTEL_OWNER = 'HOTEL_OWNER',
  ADMIN = 'ADMIN',
}
