'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Lock, MoreHorizontal, Plus, Search, SquareUserRound, Unlock, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
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
  DialogTrigger,
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

import {
  CreateModeratorRequest,
  LockUserRequest,
  PaginationParams,
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

interface UserManagementTableProps {
  userType: 'customers' | 'moderators';
  title: ReactNode;
  canCreate?: boolean;
}

export function UserManagementTable({
  userType,
  title,
  canCreate = false,
}: UserManagementTableProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSearch = searchParams.get('search') || '';

  const [page, setPage] = useState(currentPage);
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Sync state with URL params
  useEffect(() => {
    setPage(currentPage);
    setSearchTerm(currentSearch);
  }, [currentPage, currentSearch]);

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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [lockDays, setLockDays] = useState(7);
  const [newModeratorEmail, setNewModeratorEmail] = useState('');

  const queryClient = useQueryClient();
  const queryKey = [userType, { page, search: debouncedSearchTerm }];

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      const params: PaginationParams = {
        pageNumber: page,
        pageSize: 10,
        search: debouncedSearchTerm || undefined,
      };
      return userType === 'customers'
        ? userManagementService.getCustomers(params)
        : userManagementService.getModerators(params);
    },
  });

  // Lock user mutation
  const lockMutation = useMutation({
    mutationFn: (request: LockUserRequest) => {
      return userType === 'customers'
        ? userManagementService.lockCustomer(request)
        : userManagementService.lockModerator(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [userType] });
      setLockDialogOpen(false);
      setSelectedUser(null);
      setLockDays(7);
      toast.success(
        `Tài khoản ${userType === 'customers' ? 'Khách hàng' : 'Moderator'} đã được khóa thành công.`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể khóa tài khoản.');
    },
  });

  // Unlock user mutation
  const unlockMutation = useMutation({
    mutationFn: (request: UnlockUserRequest) => {
      return userType === 'customers'
        ? userManagementService.unlockCustomer(request)
        : userManagementService.unlockModerator(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [userType] });
      setUnlockDialogOpen(false);
      setSelectedUser(null);
      toast.success(
        `Tài khoản ${userType === 'customers' ? 'Khách hàng' : 'Moderator'} đã được mở khóa thành công.`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể mở khóa tài khoản.');
    },
  });

  // Create moderator mutation
  const createModeratorMutation = useMutation({
    mutationFn: (request: CreateModeratorRequest) => userManagementService.createModerator(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [userType] });
      setCreateDialogOpen(false);
      setNewModeratorEmail('');
      toast.success('Tài khoản Moderator đã được tạo thành công.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể tạo tài khoản moderator.');
    },
  });

  const handleLock = (user: User) => {
    setSelectedUser(user);
    setLockDialogOpen(true);
  };

  const handleUnlock = (user: User) => {
    setSelectedUser(user);
    setUnlockDialogOpen(true);
  };

  const confirmLock = () => {
    if (selectedUser && lockDays >= 1) {
      lockMutation.mutate({
        userId: selectedUser.id,
        day: lockDays,
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

  const handleUserDetail = (user: User) => {
    setSelectedUser(user);
    router.push(`/profile/${user.id}`);
  };

  const handleCreateModerator = () => {
    if (newModeratorEmail.trim()) {
      createModeratorMutation.mutate({
        email: newModeratorEmail.trim(),
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return <Badge className="flex content-center bg-[#99b94a] text-white">Đã xác thực</Badge>;
      case 'Unverified':
        return <Badge variant="secondary">Chưa xác thực</Badge>;
      case 'Locked':
        return <Badge variant="danger">Đã khóa</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format date helper
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) return 'N/A';

      return new Intl.DateTimeFormat('vi-VN', {
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        {canCreate && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#99b94a] hover:bg-[#7a8f3a]">
                <Plus className="mr-2 h-4 w-4" />
                Tạo Moderator
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-[#99b94a]">Tạo Tài Khoản Moderator Mới</DialogTitle>
                <DialogDescription>
                  Nhập địa chỉ email cho tài khoản moderator mới. Mật khẩu tạm thời sẽ được gửi đến
                  email này.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="mb-3 text-[#99b94a]">
                    Địa Chỉ Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newModeratorEmail}
                    onChange={(e) => setNewModeratorEmail(e.target.value)}
                    placeholder="moderator@example.com"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button
                  className="bg-[#99b94a] hover:bg-[#7a8f3a]"
                  onClick={handleCreateModerator}
                  disabled={!newModeratorEmail.trim() || createModeratorMutation.isPending}
                >
                  {createModeratorMutation.isPending ? 'Đang tạo...' : 'Tạo Tài Khoản'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex w-full justify-end">
        <div className="flex w-1/4 items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={`Tìm kiếm ${userType === 'customers' ? 'khách hàng' : 'moderator'}...`}
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
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead>Ngày Tạo</TableHead>
              <TableHead>Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersData?.items?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {debouncedSearchTerm ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Search className="size-8 text-gray-400" />
                      <p className="text-gray-500">
                        Không tìm thấy {userType === 'customers' ? 'khách hàng' : 'moderator'} nào
                        với từ khóa &ldquo;{debouncedSearchTerm}&rdquo;
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      {isLoading
                        ? 'Đang tải...'
                        : `Không có ${userType === 'customers' ? 'khách hàng' : 'moderator'} nào`}
                    </p>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              usersData?.items?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="pl-6">{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{formatDate(user.createdAtUTC)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUserDetail(user)}>
                          <SquareUserRound className="mr-2 h-4 w-4 text-[#99b94a]" />
                          Xem Hồ Sơ
                        </DropdownMenuItem>
                        {user.status === 'Locked' ? (
                          <DropdownMenuItem onClick={() => handleUnlock(user)}>
                            <Unlock className="mr-2 h-4 w-4 text-[#99b94a]" />
                            Mở Khóa
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleLock(user)}>
                            <Lock className="mr-2 h-4 w-4 text-[#99b94a]" />
                            Khóa Tài Khoản
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Search Results Info */}
      {usersData && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {debouncedSearchTerm ? (
              <>
                Tìm thấy <span className="font-medium">{usersData?.totalCount || 0}</span> kết quả
                cho &ldquo;{debouncedSearchTerm}&rdquo;
              </>
            ) : (
              <>
                Hiển thị <span className="font-medium">{usersData.items.length}</span> trên tổng số{' '}
                <span className="font-medium">{usersData.totalCount}</span>{' '}
                {userType === 'customers' ? 'khách hàng' : 'moderator'}
              </>
            )}
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
                Số ngày khóa (tối thiểu 1 ngày)
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLockDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={confirmLock}
              disabled={lockDays < 1 || lockMutation.isPending}
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
            <DialogTitle>Mở Khóa Tài Khoản Người Dùng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn mở khóa tài khoản của {selectedUser?.firstName}{' '}
              {selectedUser?.lastName} không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnlockDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={confirmUnlock} disabled={unlockMutation.isPending}>
              {unlockMutation.isPending ? 'Đang mở khóa...' : 'Mở Khóa Tài Khoản'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
