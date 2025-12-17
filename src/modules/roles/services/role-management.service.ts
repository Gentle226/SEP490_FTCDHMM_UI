import { HttpClient } from '@/base/lib';

export interface Role {
  id: string;
  name: string;
  isActive: boolean;
  lastUpdatedUtc: string;
}

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export interface PermissionAction {
  actionId: string;
  actionName: string;
  isActive: boolean;
}

export interface PermissionDomain {
  domainName: string;
  actions: PermissionAction[];
}

export interface RoleDetailsResponse {
  name: string;
  lastUpdatedUtc: string;
  domains: PermissionDomain[];
}

export interface PermissionToggle {
  permissionActionId: string;
  isActive: boolean;
}

export interface UpdateRolePermissionsRequest {
  Permissions: PermissionToggle[];
  LastUpdatedUtc: string;
}

export interface CreateRoleRequest {
  name: string;
}

export interface RoleNameResponse {
  id: string;
  name: string;
}

class RoleManagementService extends HttpClient {
  constructor() {
    super();
  }

  public async getRoles(params: PaginationParams = {}) {
    const queryParams = new URLSearchParams();
    if (params.pageNumber)
      queryParams.append('PaginationParams.PageNumber', params.pageNumber.toString());
    if (params.pageSize)
      queryParams.append('PaginationParams.PageSize', params.pageSize.toString());

    return this.get<PaginatedResponse<Role>>(`api/Role?${queryParams}`, {
      isPrivateRoute: true,
    });
  }

  public async createRole(request: CreateRoleRequest) {
    return this.post<void>('api/Role', request, {
      isPrivateRoute: true,
    });
  }

  public async activeRole(roleId: string) {
    return this.put<void>(`api/Role/${roleId}/active`, undefined, {
      isPrivateRoute: true,
    });
  }

  public async deactiveRole(roleId: string) {
    return this.put<void>(`api/Role/${roleId}/deactive`, undefined, {
      isPrivateRoute: true,
    });
  }

  public async getRolePermissions(roleId: string) {
    return this.get<RoleDetailsResponse>(`api/Role/${roleId}/permissions`, {
      isPrivateRoute: true,
    });
  }

  public async updateRolePermissions(roleId: string, request: UpdateRolePermissionsRequest) {
    return this.put<void>(`api/Role/${roleId}/permissions`, request, {
      isPrivateRoute: true,
    });
  }

  public async getActiveRoles() {
    return this.get<RoleNameResponse[]>('api/Role/activating', {
      isPrivateRoute: true,
    });
  }
}

export const roleManagementService = new RoleManagementService();
