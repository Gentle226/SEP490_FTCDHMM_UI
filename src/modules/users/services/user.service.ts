import axios from 'axios';

import { HttpClient } from '@/base/lib';
import { CommonSearchParams, SuccessResponse } from '@/base/types';

import {
  CreateUserSchema,
  UpdateRoleUserSchema,
  UpdateUserSchema,
  UpgradeRoleSchema,
  User,
} from '../types';

class UserService extends HttpClient {
  constructor() {
    super();
  }

  public getUserProfile() {
    return this.get<SuccessResponse<User>>('/users/profile', {
      isPrivateRoute: true,
    });
  }

  public async updateUserProfile(payload: UpdateUserSchema) {
    const res = await this.patch<SuccessResponse<User>>(`/users/profile`, payload, {
      isPrivateRoute: true,
    });

    await axios.post('/api/auth/set-user', res.data);

    return res;
  }

  public getAllUsers(params?: CommonSearchParams) {
    return this.get<SuccessResponse<User[]>>('/users', {
      params,
      isPrivateRoute: true,
    });
  }

  public getAllDeletedUsers(params?: CommonSearchParams) {
    return this.get<SuccessResponse<User[]>>('/users/deleted', {
      params,
      isPrivateRoute: true,
    });
  }

  public getUserById(id: string) {
    return this.get<SuccessResponse<User>>(`/users/${id}`);
  }

  public createNewUser(payload: CreateUserSchema) {
    return this.post<SuccessResponse<User>>('/users', payload);
  }

  public updateUser(id: string) {
    return (payload: UpdateUserSchema) =>
      this.patch<SuccessResponse<User>>(`/users/${id}`, payload);
  }
  public updateRoleUser(id: string) {
    return (payload: UpdateRoleUserSchema) =>
      this.patch<SuccessResponse<User>>(`/users/${id}`, payload);
  }

  public softDeleteUser(id: string) {
    return this.delete(`/users/delete/${id}`, { isPrivateRoute: true });
  }

  public restoreUser(id: string) {
    return this.patch<SuccessResponse<User>>(
      `/users/restore/${id}`,
      {},
      {
        isPrivateRoute: true,
      },
    );
  }

  public upgradeRole(payload: UpgradeRoleSchema) {
    return this.patch<SuccessResponse<User>>('/users/upgrade-role', payload, {
      isPrivateRoute: true,
    });
  }
}

export const userService = new UserService();
