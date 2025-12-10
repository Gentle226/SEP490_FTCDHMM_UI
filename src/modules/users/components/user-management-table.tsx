'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Lock, Search, Unlock, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Pagination } from '@/base/components/layout/pagination';
import { Badge } from '@/base/components/ui/badge';
import { Button } from '@/base/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/base/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/base/components/ui/dropdown-menu';
import { Input } from '@/base/components/ui/input';
import { Label } from '@/base/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/base/components/ui/table';
import { Pagination as PaginationType } from '@/base/types';
import { useAuth } from '@/modules/auth';

import {
  LockUserRequest,
  PaginationParams,
  RoleResponse,
  UnlockUserRequest,
  User,
  userManagementService,
} from '../services/user-management.service';

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function UserManagementTable() {
  const { user: currentUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSearch = searchParams.get('search') || '';
  const currentPageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const currentRoleFilter = searchParams.get('role') || '';

  const [page, setPage] = useState(currentPage);
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [pageSize, setPageSize] = useState(currentPageSize);
  const [roleFilter, setRoleFilter] = useState(currentRoleFilter);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Sync state with URL params
  useEffect(() => {
    setPage(currentPage);
    setSearchTerm(currentSearch);
    setPageSize(currentPageSize);
    setRoleFilter(currentRoleFilter);
  }, [currentPage, currentSearch, currentPageSize, currentRoleFilter]);

  // Update URL when search term changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (debouncedSearchTerm) {
      params.set('search', debouncedSearchTerm);
    } else {
      params.delete('search');
    }

    // Reset to page 1 when searching
    if (debouncedSearchTerm !== currentSearch) {
      params.set('page', '1');
    }

    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearchTerm, pathname, router, searchParams, currentSearch]);

  // Update URL when page changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  }, [page, pathname, router, searchParams]);

  // Update URL when pageSize changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('pageSize', pageSize.toString());
    params.set('page', '1'); // Reset to page 1 when changing page size
    router.push(`${pathname}?${params.toString()}`);
  }, [pageSize, pathname, router, searchParams]);

  // Update URL when role filter changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (roleFilter) {
      params.set('role', roleFilter);
    } else {
      params.delete('role');
    }
    params.set('page', '1'); // Reset to page 1 when changing filter
    router.push(`${pathname}?${params.toString()}`);
  }, [roleFilter, pathname, router, searchParams]);

  // Helper function to convert API response to PaginationType
  const convertToPaginationType = (data: {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  }): PaginationType => ({
    total: data.totalCount,
    currentPage: data.pageNumber,
    pageSize: data.pageSize,
    totalPage: data.totalPages,
    hasNextPage: data.pageNumber < data.totalPages,
    hasPreviousPage: data.pageNumber > 1,
  });
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [lockDays, setLockDays] = useState(7);
  const [lockReason, setLockReason] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [roleIdMap, setRoleIdMap] = useState<Map<string, string>>(new Map());

  const lockReasonTemplates = [
    'Vi phạm điều khoản sử dụng',
    'Hành vi spam hoặc lạm dụng',
    'Nội dung không phù hợp',
    'Gian lận hoặc hoạt động nghi ngờ',
  ];

  const queryClient = useQueryClient();
  const queryKey = ['users', { page, search: debouncedSearchTerm, pageSize, role: roleFilter }];

  // Fetch roles for role change feature and filters
  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await userManagementService.getRoles();
      const map = new Map<string, string>();
      response.forEach((role: RoleResponse) => {
        map.set(role.name, role.id);
      });
      setRoleIdMap(map);
      return response;
    },
  });
  const { data: usersData, isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      const params: PaginationParams = {
        pageNumber: page,
        pageSize: pageSize,
        search: debouncedSearchTerm || undefined,
      };
      if (roleFilter) {
        params.role = roleFilter;
      }
      return userManagementService.getUsers(params);
    },
  });

  // Lock user mutation
  const lockMutation = useMutation({
    mutationFn: (request: LockUserRequest) => {
      return userManagementService.lockUser(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setLockDialogOpen(false);
      setSelectedUser(null);
      setLockDays(7);
      setLockReason('');
      toast.success('Tài khoản đã được khóa thành công.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể khóa tài khoản.');
    },
  });

  // Unlock user mutation
  const unlockMutation = useMutation({
    mutationFn: (request: UnlockUserRequest) => {
      return userManagementService.unlockUser(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setUnlockDialogOpen(false);
      setSelectedUser(null);
      toast.success('Tài khoản đã được mở khóa thành công.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể mở khóa tài khoản.');
    },
  });

  // Change role mutation (Admin only)
  const changeRoleMutation = useMutation({
    mutationFn: (request: { userId: string; roleId: string }) =>
      userManagementService.changeRole(request.userId, { roleId: request.roleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setChangeRoleDialogOpen(false);
      setSelectedUser(null);
      setSelectedRole('');
      toast.success('Vai trò người dùng đã được thay đổi thành công.');
    },
    onError: (error: Error) => {
      // Check if error is AxiosError with response data
      if ('response' in error && error.response) {
        const responseData = (error.response as { data?: { code?: string; message?: string } })
          .data;

        if (responseData?.code === 'INVALID_ACTION') {
          toast.error('Không được quyền chỉnh sửa tài khoản admin');
          return;
        }

        if (responseData?.message) {
          toast.error(responseData.message);
          return;
        }
      }

      toast.error(error.message || 'Không thể thay đổi vai trò người dùng.');
    },
  });

  const handleLock = (user: User) => {
    // Prevent user from locking themselves
    if (currentUser && user.id === currentUser.id) {
      toast.error('Không được quyền khóa tài khoản của chính mình');
      return;
    }

    setSelectedUser(user);
    setLockDialogOpen(true);
  };

  const handleUnlock = (user: User) => {
    setSelectedUser(user);
    setUnlockDialogOpen(true);
  };

  const handleChangeRole = (user: User) => {
    // Prevent changing Admin user role
    if (user.role === 'Admin') {
      toast.error('Không được quyền thay đổi vai trò của người dùng Admin');
      return;
    }

    setSelectedUser(user);
    setSelectedRole(user.role || '');
    setChangeRoleDialogOpen(true);
  };

  const confirmLock = () => {
    if (selectedUser && lockDays >= 1 && lockReason.trim().length >= 3) {
      lockMutation.mutate({
        userId: selectedUser.id,
        day: lockDays,
        reason: lockReason,
      });
    }
  };

  const confirmUnlock = () => {
    if (selectedUser) {
      unlockMutation.mutate({
        userId: selectedUser.id,
      });
    }
  };

  const confirmChangeRole = () => {
    if (selectedUser && selectedRole) {
      const roleId = roleIdMap.get(selectedRole);
      if (roleId) {
        changeRoleMutation.mutate({
          userId: selectedUser.id,
          roleId,
        });
      } else {
        toast.error('Không tìm thấy ID của vai trò được chọn.');
      }
    }
  };

  const handleUserDetail = (user: User) => {
    setSelectedUser(user);
    router.push(`/profile/${user.userName}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const getStatusBadge = (status: string, user?: User) => {
    switch (status) {
      case 'Verified':
        return <Badge className="flex content-center bg-[#99b94a] text-white">Đã xác thực</Badge>;
      case 'Unverified':
        return <Badge variant="secondary">Chưa xác thực</Badge>;
      case 'Locked':
        return (
          <Badge
            variant="danger"
            title={user?.lockReason ? `Lý do: ${user.lockReason}` : 'Tài khoản đã khóa'}
            className="cursor-pointer"
          >
            Đã khóa
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format date helper
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';

    try {
      // Ensure the date string is interpreted as UTC by appending 'Z' if not present
      const utcDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
      const date = new Date(utcDateString);

      // Check if date is valid
      if (isNaN(date.getTime())) return 'N/A';

      return new Intl.DateTimeFormat(undefined, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
    } catch {
      return 'N/A';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Search Bar and Filters */}
      <div className="mb-6 flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        {/* Search Input */}
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pr-10 pl-10"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Xóa tìm kiếm"
                title="Xóa tìm kiếm"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Vai trò:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="min-w-[140px] gap-2">
                {roleFilter || 'Tất cả'}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setRoleFilter('')}
                className={!roleFilter ? 'bg-[#99b94a]/10 text-[#99b94a]' : ''}
              >
                Tất cả
              </DropdownMenuItem>
              {rolesData?.map((role: RoleResponse) => (
                <DropdownMenuItem
                  key={role.id}
                  onClick={() => setRoleFilter(role.name)}
                  className={roleFilter === role.name ? 'bg-[#99b94a]/10 text-[#99b94a]' : ''}
                >
                  {role.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai Trò</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead>Ngày Tạo</TableHead>
              <TableHead>Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersData?.items?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {debouncedSearchTerm ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Search className="size-8 text-gray-400" />
                      <p className="text-gray-500">
                        Không tìm thấy người dùng nào với từ khóa &ldquo;{debouncedSearchTerm}
                        &rdquo;
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      {isLoading ? 'Đang tải...' : 'Không có người dùng nào'}
                    </p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              usersData?.items?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="pl-6">
                    <button
                      onClick={() => handleUserDetail(user)}
                      className="cursor-pointer font-medium text-[#99b94a] transition-colors hover:underline"
                    >
                      {`${user.firstName} ${user.lastName}`}
                    </button>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleUserDetail(user)}
                      className="cursor-pointer text-blue-600 transition-colors hover:underline"
                    >
                      {user.email}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-medium">
                      {user.role || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status, user)}</TableCell>
                  <TableCell>{formatDate(user.createdAtUTC)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangeRole(user)}
                        className="text-blue-600 hover:bg-blue-50"
                        title="Thay đổi vai trò"
                      >
                        Đổi Vai Trò
                      </Button>
                      <div className="pl-5">
                        {user.status === 'Locked' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnlock(user)}
                            className="text-green-600 hover:bg-green-50"
                          >
                            <Unlock className="mr-1 h-4 w-4" />
                            Mở Khóa
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLock(user)}
                            disabled={currentUser?.id === user.id}
                            className={
                              currentUser?.id === user.id
                                ? 'cursor-not-allowed text-red-600 opacity-50'
                                : 'text-red-600 hover:bg-red-50'
                            }
                            title={currentUser?.id === user.id ? 'Không được khóa chính mình' : ''}
                          >
                            <Lock className="mr-1 h-4 w-4" />
                            Khóa
                          </Button>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Search Results Info */}
      {usersData && (
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="text-sm text-gray-500">
            {debouncedSearchTerm ? (
              <>
                Tìm thấy <span className="font-medium">{usersData?.totalCount || 0}</span> kết quả
                cho &ldquo;{debouncedSearchTerm}&rdquo;
              </>
            ) : (
              <>
                Hiển thị <span className="font-medium">{usersData.items.length}</span> trên tổng số{' '}
                <span className="font-medium">{usersData.totalCount}</span> người dùng
              </>
            )}
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hiển thị:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="min-w-[100px] gap-2">
                  {pageSize} mục
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {[10, 20, 50].map((size) => (
                  <DropdownMenuItem
                    key={size}
                    onClick={() => setPageSize(size)}
                    className={pageSize === size ? 'bg-[#99b94a]/10 text-[#99b94a]' : ''}
                  >
                    {size} mục
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Pagination */}
      {usersData && usersData.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination pagination={convertToPaginationType(usersData)} />
        </div>
      )}

      {/* Lock User Dialog */}
      <Dialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Khóa Tài Khoản Người Dùng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn khóa tài khoản của {selectedUser?.firstName}{' '}
              {selectedUser?.lastName} không? Vui lòng chọn số ngày khóa tài khoản.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="days" className="mb-3">
                Số ngày khóa (tối thiểu 2 ngày)
              </Label>
              <Input
                id="days"
                type="number"
                min="1"
                value={lockDays}
                onChange={(e) => setLockDays(parseInt(e.target.value) || 1)}
                placeholder="Nhập số ngày khóa tài khoản"
              />
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between">
                <Label htmlFor="reason" className="">
                  Lý do khóa <span className="text-red-500">*</span>
                </Label>
                <span
                  className={`text-xs font-medium ${
                    lockReason.length < 3
                      ? 'text-red-500'
                      : lockReason.length < 50
                        ? 'text-amber-500'
                        : 'text-green-500'
                  }`}
                >
                  {lockReason.length} / 512
                </span>
              </div>
              <textarea
                id="reason"
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value.slice(0, 512))}
                placeholder="Mô tả chi tiết lý do khóa tài khoản (tối thiểu 3 ký tự)"
                className={`w-full rounded-md border p-3 text-sm transition-colors ${
                  lockReason.trim().length < 3
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-white focus:outline-none'
                    : 'border-gray-300 focus:border-[#99b94a] focus:outline-none'
                }`}
                rows={3}
              />
              {lockReason.length < 3 && lockReason.length > 0 && (
                <div className="mt-2 text-xs text-red-500">
                  Cần thêm {3 - lockReason.length} ký tự nữa
                </div>
              )}

              {/* Quick templates */}
              <div className="mt-3">
                <p className="mb-2 text-xs font-medium text-gray-600">Gợi ý lý do:</p>
                <div className="flex flex-wrap gap-2">
                  {lockReasonTemplates.map((template) => (
                    <button
                      key={template}
                      onClick={() => setLockReason(template)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                        lockReason === template
                          ? 'bg-[#99b94a] text-white'
                          : 'border border-gray-300 bg-white text-gray-700 hover:border-[#99b94a] hover:text-[#99b94a]'
                      }`}
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLockDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={confirmLock}
              disabled={lockDays < 1 || lockReason.trim().length < 3 || lockMutation.isPending}
              title={
                lockDays < 1
                  ? 'Số ngày phải từ 1 trở lên'
                  : lockReason.trim().length < 3
                    ? 'Lý do khóa phải từ 3 ký tự trở lên'
                    : ''
              }
            >
              {lockMutation.isPending ? 'Đang khóa...' : 'Khóa Tài Khoản'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlock User Dialog */}
      <Dialog open={unlockDialogOpen} onOpenChange={setUnlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#99b94a]">Mở Khóa Tài Khoản Người Dùng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn mở khóa tài khoản của {selectedUser?.firstName}{' '}
              {selectedUser?.lastName} không?
            </DialogDescription>
          </DialogHeader>

          {selectedUser?.status === 'Locked' && (
            <div className="space-y-3 rounded-lg bg-red-50 p-4">
              {selectedUser.lockReason && (
                <div>
                  <p className="text-sm font-semibold text-red-900">Lý do khóa:</p>
                  <p className="mt-1 text-sm text-red-800">{selectedUser.lockReason}</p>
                </div>
              )}
              {selectedUser.lockoutEnd && (
                <div>
                  <p className="text-sm font-semibold text-red-900">Mở khóa vào:</p>
                  <p className="mt-1 text-sm text-red-800">
                    {new Date(selectedUser.lockoutEnd).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setUnlockDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              className="bg-[#99b94a] text-white hover:bg-[#88a83a]"
              onClick={confirmUnlock}
              disabled={unlockMutation.isPending}
            >
              {unlockMutation.isPending ? 'Đang mở khóa...' : 'Mở Khóa Tài Khoản'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={changeRoleDialogOpen} onOpenChange={setChangeRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#99b94a]">Thay Đổi Vai Trò Người Dùng</DialogTitle>
            <DialogDescription>
              Thay đổi vai trò của {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="role" className="mb-3 text-[#99b94a]">
                Chọn Vai Trò Mới
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span>{selectedRole || 'Chọn vai trò'}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[--radix-dropdown-menu-trigger-width]"
                >
                  {rolesData?.map((role: RoleResponse) => (
                    <DropdownMenuItem
                      key={role.id}
                      onClick={() => setSelectedRole(role.name)}
                      className={selectedRole === role.name ? 'bg-[#99b94a]/10 text-[#99b94a]' : ''}
                    >
                      {role.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {selectedRole && (
              <div className="rounded-lg bg-[#99b94a]/10 p-3">
                <p className="text-sm text-[#99b94a]">
                  Bạn đang thay đổi vai trò của người dùng thành <strong>{selectedRole}</strong>.
                  Điều này sẽ cập nhật quyền truy cập của họ theo vai trò mới.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeRoleDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              className="bg-[#99b94a] hover:bg-[#7a8f3a]"
              onClick={confirmChangeRole}
              disabled={!selectedRole || changeRoleMutation.isPending}
            >
              {changeRoleMutation.isPending ? 'Đang thay đổi...' : 'Thay Đổi Vai Trò'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
