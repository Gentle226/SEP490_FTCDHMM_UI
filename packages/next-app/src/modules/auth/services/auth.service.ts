import axios from 'axios';

import { HttpClient } from '@/base/lib';
import {
  ChangePasswordSchema,
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  ResendOtpSchema,
  ResetPasswordWithOtpSchema,
  VerifyEmailOtpSchema,
} from '@/modules/auth/types';

class AuthService extends HttpClient {
  constructor() {
    super();
  }

  public register(payload: RegisterSchema) {
    return this.post<unknown>('api/Auth/register', payload);
  }

  public async login(payload: LoginSchema) {
    const res = await this.post<{ token: string }>('api/Auth/login', payload);

    // Transform the response to match what the cookie API expects
    await axios.post('/api/auth/set-cookie', {
      accessToken: res.token,
      refreshToken: res.token, // Using the same token for now, you might want to implement refresh tokens later
    });

    return res;
  }

  public async logout() {
    await this.delete('/auth/logout', {
      isPrivateRoute: true,
    });

    await axios.delete('/api/auth/delete-cookie');
  }

  public verifyEmailOtp(payload: VerifyEmailOtpSchema, purpose: string = 'confirm') {
    return this.post<{ token: string }>(
      `api/auth/verify-otp-for-password-reset?purpose=${purpose}`,
      payload,
    );
  }

  public resendOtp({ purpose = 'confirm', ...payload }: ResendOtpSchema) {
    return this.post<unknown>(`api/auth/resend-otp?purpose=${purpose}`, payload);
  }

  public forgotPassword(payload: ForgotPasswordSchema) {
    return this.post<unknown>('api/auth/forgot-password', payload);
  }

  public resetPasswordWithOtp(payload: ResetPasswordWithOtpSchema) {
    return this.post<unknown>('api/Auth/reset-password', payload);
  }

  public changePassword(payload: ChangePasswordSchema) {
    return this.post<unknown>('/auth/change-password', payload, { isPrivateRoute: true });
  }
}

export const authService = new AuthService();
