import axios from 'axios';

import { HttpClient } from '@/base/lib';
import { LoginSchema, LoginSuccessResponse } from '@/modules/auth/types';

class AuthService extends HttpClient {
  constructor() {
    super();
  }

  public register(payload: LoginSchema) {
    return this.post<LoginSuccessResponse>('/auth/register', payload);
  }

  public async login(payload: LoginSchema) {
    const res = await this.post<LoginSuccessResponse>('/auth/login', payload);

    await axios.post('/api/auth/set-cookie', res);

    return res;
  }

  public async logout() {
    await this.delete('/auth/logout', {
      isPrivateRoute: true,
    });

    await axios.delete('/api/auth/delete-cookie');
  }
}

export const authService = new AuthService();
