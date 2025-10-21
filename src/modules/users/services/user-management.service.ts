import { HttpClient } from '@/base/lib';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAtUTC: string;
  status: string;
}

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
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
    if (params.pageNumber)
      queryParams.append('PaginationParams.PageNumber', params.pageNumber.toString());
    if (params.pageSize)
      queryParams.append('PaginationParams.PageSize', params.pageSize.toString());
    if (params.search) queryParams.append('Keyword', params.search);

    return this.get<PaginatedResponse<User>>(`api/User/getCustomers?${queryParams}`, {
      isPrivateRoute: true,
    });
  }

  public async lockCustomer(request: LockUserRequest) {
    return this.put<void>(`api/User/lockCustomer/${request.userId}`, request, {
      isPrivateRoute: true,
    });
  }

  public async unlockCustomer(request: UnlockUserRequest) {
    return this.put<void>(
      `api/User/unlockCustomer/${request.userId}`,
      {},
      {
        isPrivateRoute: true,
      },
    );
  }

  // Moderator management (for Admins)
  public async getModerators(params: PaginationParams = {}) {
    const queryParams = new URLSearchParams();
    // Backend expects nested PaginationParams and Keyword
    if (params.pageNumber)
      queryParams.append('PaginationParams.PageNumber', params.pageNumber.toString());
    if (params.pageSize)
      queryParams.append('PaginationParams.PageSize', params.pageSize.toString());
    if (params.search) queryParams.append('Keyword', params.search);

    return this.get<PaginatedResponse<User>>(`api/User/getModerators?${queryParams}`, {
      isPrivateRoute: true,
    });
  }

  public async lockModerator(request: LockUserRequest) {
    return this.put<void>(`api/User/lockModerator/${request.userId}`, request, {
      isPrivateRoute: true,
    });
  }

  public async unlockModerator(request: UnlockUserRequest) {
    return this.put<void>(
      `api/User/unlockModerator/${request.userId}`,
      {},
      {
        isPrivateRoute: true,
      },
    );
  }

  public async createModerator(request: CreateModeratorRequest) {
    return this.post<void>('api/User/createModerator', request, {
      isPrivateRoute: true,
    });
  }
}

export const userManagementService = new UserManagementService();
