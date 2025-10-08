import axios from 'axios';
import { decodeJwt } from 'jose';

import { HttpClient } from '@/base/lib/http-client.lib';
import {
  ChangePasswordSchema,
  ForgotPasswordSchema,
  LoginSchema,
  LoginSuccessResponse,
  RegisterSchema,
  ResendOtpSchema,
  ResetPasswordWithOtpSchema,
  User,
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

    // Decode JWT to get user info
    const decodedToken = decodeJwt(res.token);

    // Debug logging
    console.log('Login Debug:', {
      tokenReceived: !!res.token,
      decodedToken,
      tokenExp: decodedToken.exp ? new Date(decodedToken.exp * 1000).toISOString() : 'no exp',
      availableClaims: Object.keys(decodedToken),
    });

    // Extract user data with flexible claim mapping
    const extractClaim = (token: any, ...possibleKeys: string[]) => {
      for (const key of possibleKeys) {
        if (token[key] !== undefined && token[key] !== null && token[key] !== '') {
          return token[key];
        }
      }
      return undefined;
    };

    const user: User = {
      id:
        extractClaim(
          decodedToken,
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
          'sub',
          'id',
          'userId',
          'user_id',
          'nameid',
          'unique_name',
        ) || payload.email,
      email:
        extractClaim(
          decodedToken,
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
          'email',
          'email_address',
          'mail',
        ) || payload.email,
      role: (() => {
        const rawRole = extractClaim(
          decodedToken,
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
          'role',
          'roles',
          'user_role',
          'authority',
        );

        console.log('Raw role from JWT:', rawRole);

        // Map different role formats to our enum values
        const roleMapping: Record<string, string> = {
          ADMIN: 'Admin',
          Admin: 'Admin',
          admin: 'Admin',
          MODERATOR: 'Moderator',
          Moderator: 'Moderator',
          moderator: 'Moderator',
          CUSTOMER: 'Customer',
          Customer: 'Customer',
          customer: 'Customer',
        };

        const mappedRole = rawRole ? roleMapping[rawRole] || rawRole : 'Customer';
        console.log('Mapped role:', mappedRole);

        return mappedRole;
      })(),
      firstName: extractClaim(decodedToken, 'firstName', 'first_name', 'given_name', 'fname'),
      lastName: extractClaim(decodedToken, 'lastName', 'last_name', 'family_name', 'lname'),
      fullName: extractClaim(decodedToken, 'fullName', 'full_name', 'name', 'display_name'),
      phoneNumber: extractClaim(decodedToken, 'phoneNumber', 'phone_number', 'phone', 'mobile'),
      isActive: true,
      isEmailVerified:
        extractClaim(decodedToken, 'emailVerified', 'email_verified', 'verified') || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('User created from token:', user);
    console.log('Name extraction debug:', {
      fullName: extractClaim(decodedToken, 'fullName', 'full_name', 'name', 'display_name'),
      firstName: extractClaim(decodedToken, 'firstName', 'first_name', 'given_name', 'fname'),
      lastName: extractClaim(decodedToken, 'lastName', 'last_name', 'family_name', 'lname'),
      allTokenKeys: Object.keys(decodedToken),
    });

    // Transform the response to match what the cookie API expects
    const loginResponse: LoginSuccessResponse = {
      data: {
        accessToken: res.token,
        refreshToken: res.token, // API doesn't have separate refresh tokens
        user,
      },
    };

    await axios.post('/api/auth/set-cookie', loginResponse);

    // Trigger a page reload to refresh the AuthContext
    // This ensures the user data is loaded immediately after login
    window.location.reload();

    return loginResponse;
  }

  public async logout() {
    try {
      // Try to call the API logout endpoint if it exists
      await this.delete('/auth/logout', {
        isPrivateRoute: true,
      });
    } catch (error) {
      // If API logout fails, just log it and continue with local logout
      console.log('API logout failed, continuing with local logout:', error);
    }

    // Always clear the cookies locally
    await axios.delete('/api/auth/delete-cookie');
  }

  public verifyEmailOtpForReset(payload: VerifyEmailOtpSchema, purpose: string = 'confirm') {
    return this.post<{ token: string }>(
      `api/auth/verify-otp-for-password-reset?purpose=${purpose}`,
      payload,
    );
  }

  public verifyEmailOtp(payload: VerifyEmailOtpSchema) {
    return this.post<{ token: string }>(`api/auth/verify-email-otp`, payload);
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

  public async loginWithGoogleIdToken(idToken: string) {
    const res = await this.post<{ token: string }>('api/Auth/google/id-token', {
      idToken,
    });

    // Decode JWT to get user info
    const decodedToken = decodeJwt(res.token);

    // Debug logging
    console.log('Google Login Debug:', {
      tokenReceived: !!res.token,
      decodedToken,
      tokenExp: decodedToken.exp ? new Date(decodedToken.exp * 1000).toISOString() : 'no exp',
      availableClaims: Object.keys(decodedToken),
    });

    // Extract user data with flexible claim mapping
    const extractClaim = (token: any, ...possibleKeys: string[]) => {
      for (const key of possibleKeys) {
        if (token[key] !== undefined && token[key] !== null && token[key] !== '') {
          return token[key];
        }
      }
      return undefined;
    };

    const user: User = {
      id:
        extractClaim(
          decodedToken,
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
          'sub',
          'id',
          'userId',
          'user_id',
          'nameid',
          'unique_name',
        ) || 'google-user',
      email:
        extractClaim(
          decodedToken,
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
          'email',
          'email_address',
          'mail',
        ) || '',
      role: (() => {
        const rawRole = extractClaim(
          decodedToken,
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
          'role',
          'roles',
          'user_role',
          'authority',
        );

        // Map different role formats to our enum values
        const roleMapping: Record<string, string> = {
          ADMIN: 'Admin',
          Admin: 'Admin',
          admin: 'Admin',
          MODERATOR: 'Moderator',
          Moderator: 'Moderator',
          moderator: 'Moderator',
          CUSTOMER: 'Customer',
          Customer: 'Customer',
          customer: 'Customer',
        };

        const mappedRole = rawRole ? roleMapping[rawRole] || rawRole : 'Customer';
        return mappedRole;
      })(),
      firstName: extractClaim(decodedToken, 'firstName', 'first_name', 'given_name', 'fname'),
      lastName: extractClaim(decodedToken, 'lastName', 'last_name', 'family_name', 'lname'),
      fullName: extractClaim(decodedToken, 'fullName', 'full_name', 'name', 'display_name'),
      phoneNumber: extractClaim(decodedToken, 'phoneNumber', 'phone_number', 'phone', 'mobile'),
      isActive: true,
      isEmailVerified:
        extractClaim(decodedToken, 'emailVerified', 'email_verified', 'verified') || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Transform the response to match what the cookie API expects
    const loginResponse: LoginSuccessResponse = {
      data: {
        accessToken: res.token,
        refreshToken: res.token,
        user,
      },
    };

    await axios.post('/api/auth/set-cookie', loginResponse);

    // Trigger a page reload to refresh the AuthContext
    window.location.reload();

    return loginResponse;
  }
}

export const authService = new AuthService();
