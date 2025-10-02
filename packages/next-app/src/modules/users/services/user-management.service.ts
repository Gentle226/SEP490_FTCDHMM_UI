import { HttpClient } from '@/base/lib';

export interface User {
  Id: string;
  FirstName: string;
  LastName: string;
  Email: string;
  CreatedDateUTC: string;
  Status: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  Items: T[];
  Page: number;
  PageSize: number;
  TotalPages: number;
  TotalCount: number;
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

    return this.get<PaginatedResponse<User>>(`User/getCustomers?${queryParams}`, {
      isPrivateRoute: true,
    });
  }

  public async lockCustomer(request: LockUserRequest) {
    return this.put<void>('User/lockCustomer', request, {
      isPrivateRoute: true,
    });
  }

  public async unlockCustomer(request: UnlockUserRequest) {
    return this.put<void>('User/unlockCustomer', request, {
      isPrivateRoute: true,
    });
  }

  // Moderator management (for Admins)
  public async getModerators(params: PaginationParams = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('Page', params.page.toString());
    if (params.pageSize) queryParams.append('PageSize', params.pageSize.toString());

    return this.get<PaginatedResponse<User>>(`User/getModerators?${queryParams}`, {
      isPrivateRoute: true,
    });
  }

  public async lockModerator(request: LockUserRequest) {
    return this.put<void>('User/lockModerator', request, {
      isPrivateRoute: true,
    });
  }

  public async unlockModerator(request: UnlockUserRequest) {
    return this.put<void>('User/unlockModerator', request, {
      isPrivateRoute: true,
    });
  }

  public async createModerator(request: CreateModeratorRequest) {
    return this.post<void>('User/createModerator', request, {
      isPrivateRoute: true,
    });
  }
}

export const userManagementService = new UserManagementService();
