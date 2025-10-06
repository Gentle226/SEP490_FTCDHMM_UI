import { HttpClient } from '@/base/lib';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdDateUTC: string;
  status: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export interface LockUserRequest {
  userId: string;
  day: number;
}

export interface UnlockUserRequest {
  userId: string;
}

export interface CreateModeratorRequest {
  email: string;
}

class UserManagementService extends HttpClient {
  constructor() {
    super();
  }

  // Customer management (for Moderators)
  public async getCustomers(params: PaginationParams = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('Page', params.page.toString());
    if (params.pageSize) queryParams.append('PageSize', params.pageSize.toString());

    return this.get<PaginatedResponse<User>>(`api/User/getCustomers?${queryParams}`, {
      isPrivateRoute: true,
    });
  }

  public async lockCustomer(request: LockUserRequest) {
    return this.put<void>('api/User/lockCustomer', request, {
      isPrivateRoute: true,
    });
  }

  public async unlockCustomer(request: UnlockUserRequest) {
    return this.put<void>('api/User/unlockCustomer', request, {
      isPrivateRoute: true,
    });
  }

  // Moderator management (for Admins)
  public async getModerators(params: PaginationParams = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('Page', params.page.toString());
    if (params.pageSize) queryParams.append('PageSize', params.pageSize.toString());

    return this.get<PaginatedResponse<User>>(`api/User/getModerators?${queryParams}`, {
      isPrivateRoute: true,
    });
  }

  public async lockModerator(request: LockUserRequest) {
    return this.put<void>('api/User/lockModerator', request, {
      isPrivateRoute: true,
    });
  }

  public async unlockModerator(request: UnlockUserRequest) {
    return this.put<void>('api/User/unlockModerator', request, {
      isPrivateRoute: true,
    });
  }

  public async createModerator(request: CreateModeratorRequest) {
    return this.post<void>('api/User/createModerator', request, {
      isPrivateRoute: true,
    });
  }
}

export const userManagementService = new UserManagementService();
