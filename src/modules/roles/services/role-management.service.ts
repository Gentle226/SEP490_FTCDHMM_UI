import { HttpClient } from '@/base/lib';

export interface Role {
  id: string;
  name: string;
  isActive: boolean;
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

export interface PermissionAction {
  actionId: string;
  actionName: string;
  isActive: boolean;
}

export interface PermissionDomain {
  domainName: string;
  actions: PermissionAction[];
}

export interface PermissionToggle {
  permissionActionId: string;
  isActive: boolean;
}

export interface UpdateRolePermissionsRequest {
  permissions: PermissionToggle[];
}

export interface CreateRoleRequest {
  name: string;
}

class RoleManagementService extends HttpClient {
  constructor() {
    super();
  }

  public async getRoles(params: PaginationParams = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('Page', params.page.toString());
    if (params.pageSize) queryParams.append('PageSize', params.pageSize.toString());

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
    return this.put<void>(`api/Role/active?roleId=${roleId}`, undefined, {
      isPrivateRoute: true,
    });
  }

  public async deactiveRole(roleId: string) {
    return this.put<void>(`api/Role/deactive?roleId=${roleId}`, undefined, {
      isPrivateRoute: true,
    });
  }

  public async getRolePermissions(roleId: string) {
    return this.get<PermissionDomain[]>(`api/Role/${roleId}/permissions`, {
      isPrivateRoute: true,
    });
  }

  public async updateRolePermissions(roleId: string, request: UpdateRolePermissionsRequest) {
    return this.put<void>(`api/Role/${roleId}/permissions`, request, {
      isPrivateRoute: true,
    });
  }
}

export const roleManagementService = new RoleManagementService();
