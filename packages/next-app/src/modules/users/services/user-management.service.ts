import { HttpClient } from '@/base/lib';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdDateUTC: string;
  status: 'Verified' | 'Unverified' | 'Locked';
}

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

export interface LockUserRequest {
  userId: string;
  reason: string;
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
    if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

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
    if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

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
