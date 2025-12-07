import { HttpClient } from '@/base/lib';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  createdAtUTC: string;
  status: string;
  avatarUrl?: string;
  lockReason?: string | null;
  lockoutEnd?: string | null;
  role?: string;
}

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  role?: string;
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
  userName?: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

class UserManagementService extends HttpClient {
  constructor() {
    super();
  }

  // User management (unified for all user types)
  public async getUsers(params: PaginationParams = {}) {
    const queryParams = new URLSearchParams();
    if (params.pageNumber)
      queryParams.append('PaginationParams.PageNumber', params.pageNumber.toString());
    if (params.pageSize)
      queryParams.append('PaginationParams.PageSize', params.pageSize.toString());
    if (params.search) queryParams.append('Keyword', params.search);
    if (params.role) queryParams.append('Role', params.role);

    return this.get<PaginatedResponse<User>>(`api/User?${queryParams}`, {
      isPrivateRoute: true,
    });
  }

  public async lockUser(request: LockUserRequest) {
    return this.put<void>(`api/User/${request.userId}/lock`, request, {
      isPrivateRoute: true,
    });
  }

  public async unlockUser(request: UnlockUserRequest) {
    return this.put<void>(
      `api/User/${request.userId}/unlock`,
      {},
      {
        isPrivateRoute: true,
      },
    );
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
