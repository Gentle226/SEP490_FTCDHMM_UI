import { HttpClient } from '@/base/lib';
import { User } from '@/modules/auth/types';

class UserService extends HttpClient {
  constructor() {
    super();
  }

  public getUserProfile() {
    return this.get<{ data: User }>('/user/profile', {
      isPrivateRoute: true,
    });
  }

  public updateProfile(payload: Partial<User>) {
    return this.put<{ data: User }>('/user/profile', payload, {
      isPrivateRoute: true,
    });
  }
}

export const userService = new UserService();
