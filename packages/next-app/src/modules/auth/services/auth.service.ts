import axios from 'axios';

import { HttpClient } from '@/base/lib';
import {
  ChangePasswordSchema,
  ForgotPasswordSchema,
  LoginSchema,
  LoginSuccessResponse,
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
    const res = await this.post<LoginSuccessResponse>('api/Auth/login', payload);

    await axios.post('/api/auth/set-cookie', res);

    return res;
  }

  public async logout() {
    await this.delete('/auth/logout', {
      isPrivateRoute: true,
    });

    await axios.delete('/api/auth/delete-cookie');
  }

  public verifyEmailOtp(payload: VerifyEmailOtpSchema, purpose: string = 'confirm') {
    return this.post<unknown>(`api/Auth/verify-email-otp?purpose=${purpose}`, payload);
  }

  public resendOtp({ purpose = 'confirm', ...payload }: ResendOtpSchema) {
    return this.post<unknown>(`api/Auth/resend-otp?purpose=${purpose}`, payload);
  }

  public forgotPassword(payload: ForgotPasswordSchema) {
    return this.post<unknown>('api/Auth/forgot-password', payload);
  }

  public resetPasswordWithOtp(payload: ResetPasswordWithOtpSchema) {
    return this.post<unknown>('api/Auth/reset-password-with-otp', payload);
  }

  public changePassword(payload: ChangePasswordSchema) {
    return this.post<unknown>('/auth/change-password', payload, { isPrivateRoute: true });
  }
}

export const authService = new AuthService();
