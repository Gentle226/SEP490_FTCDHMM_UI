import { HttpClient } from '@/base/lib';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAtUTC: string;
  status: string;
  avatarUrl?: string;
  lockReason?: string | null;
  lockoutEnd?: string | null;
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
  reason: string; // Required field (3-512 characters)
}

export interface UnlockUserRequest {
  userId: string;
}

export interface CreateModeratorRequest {
  email: string;
}

export interface RoleResponse {
  id: string;
  name: string;
}

export interface ChangeRoleRequest {
  roleId: string;
}

export interface MentionableUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
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

  public async getRoles() {
    return this.get<{ items: RoleResponse[] }>('api/Role?PageNumber=1&PageSize=10', {
      isPrivateRoute: true,
    });
  }

  public async changeRole(userId: string, request: ChangeRoleRequest) {
    return this.post<void>(`api/User/${userId}/roles`, request, {
      isPrivateRoute: true,
    });
  }

  // Get taggable users (for mentions in recipes/comments)
  public async getTaggableUsers(keyword?: string) {
    const queryParams = new URLSearchParams();
    if (keyword) queryParams.append('keyword', keyword);

    return this.get<MentionableUser[]>(`api/User/taggable-users?${queryParams}`, {
      isPrivateRoute: true,
    });
  }
}

export const userManagementService = new UserManagementService();
