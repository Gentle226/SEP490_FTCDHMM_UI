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
  Role,
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

    // Extract user data with flexible claim mapping
    const extractClaim = (
      token: Record<string, unknown>,
      ...possibleKeys: string[]
    ): string | undefined => {
      for (const key of possibleKeys) {
        const value = token[key];
        if (value !== undefined && value !== null && value !== '') {
          return String(value);
        }
      }
      return undefined;
    };

    // Extract permissions array from token
    const extractPermissions = (token: Record<string, unknown>): string[] => {
      const permissions = token['Permissions'];
      if (Array.isArray(permissions)) {
        return permissions.map((p) => String(p));
      }
      if (typeof permissions === 'string') {
        return [permissions];
      }
      return [];
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
      userName:
        extractClaim(
          decodedToken,
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
          'userName',
          'user_name',
          'preferred_username',
          'unique_name',
        ) ||
        extractClaim(decodedToken, 'email', 'email_address', 'mail') ||
        '',
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

        return mappedRole as Role;
      })(),
      firstName: extractClaim(decodedToken, 'firstName', 'first_name', 'given_name', 'fname'),
      lastName: extractClaim(decodedToken, 'lastName', 'last_name', 'family_name', 'lname'),
      fullName: extractClaim(decodedToken, 'fullName', 'full_name', 'name', 'display_name'),
      phoneNumber: extractClaim(decodedToken, 'phoneNumber', 'phone_number', 'phone', 'mobile'),
      isActive: true,
      isEmailVerified:
        Boolean(extractClaim(decodedToken, 'emailVerified', 'email_verified', 'verified')) || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permissions: extractPermissions(decodedToken),
    };

    // Transform the response to match what the cookie API expects
    const loginResponse: LoginSuccessResponse = {
      data: {
        accessToken: res.token,
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
      console.warn('API logout failed, continuing with local logout:', error);
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

  public resendOtp(payload: ResendOtpSchema) {
    return this.post<unknown>(`api/auth/resend-otp`, payload);
  }

  public forgotPassword(payload: ForgotPasswordSchema) {
    return this.post<unknown>('api/auth/forgot-password', payload);
  }

  public resetPasswordWithOtp(payload: ResetPasswordWithOtpSchema) {
    return this.post<unknown>('api/Auth/reset-password', payload);
  }

  public changePassword(payload: ChangePasswordSchema) {
    return this.post<unknown>('api/Auth/change-password', payload, { isPrivateRoute: true });
  }

  public async loginWithGoogleIdToken(idToken: string) {
    const res = await this.post<{ token: string }>('api/Auth/google/id-token', {
      idToken,
    });

    // Decode JWT to get user info
    const decodedToken = decodeJwt(res.token);

    // Extract user data with flexible claim mapping
    const extractClaim = (
      token: Record<string, unknown>,
      ...possibleKeys: string[]
    ): string | undefined => {
      for (const key of possibleKeys) {
        const value = token[key];
        if (value !== undefined && value !== null && value !== '') {
          return String(value);
        }
      }
      return undefined;
    };

    // Extract permissions array from token
    const extractPermissions = (token: Record<string, unknown>): string[] => {
      const permissions = token['Permissions'];
      if (Array.isArray(permissions)) {
        return permissions.map((p) => String(p));
      }
      if (typeof permissions === 'string') {
        return [permissions];
      }
      return [];
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
      userName:
        extractClaim(
          decodedToken,
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
          'userName',
          'user_name',
          'preferred_username',
          'unique_name',
        ) ||
        extractClaim(decodedToken, 'email', 'email_address', 'mail') ||
        '',
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
        return mappedRole as Role;
      })(),
      firstName: extractClaim(decodedToken, 'firstName', 'first_name', 'given_name', 'fname'),
      lastName: extractClaim(decodedToken, 'lastName', 'last_name', 'family_name', 'lname'),
      fullName: extractClaim(decodedToken, 'fullName', 'full_name', 'name', 'display_name'),
      phoneNumber: extractClaim(decodedToken, 'phoneNumber', 'phone_number', 'phone', 'mobile'),
      isActive: true,
      isEmailVerified:
        Boolean(extractClaim(decodedToken, 'emailVerified', 'email_verified', 'verified')) || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      permissions: extractPermissions(decodedToken),
    };

    // Transform the response to match what the cookie API expects
    const loginResponse: LoginSuccessResponse = {
      data: {
        accessToken: res.token,
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
