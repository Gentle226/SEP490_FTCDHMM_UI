'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Lock, Plus, Unlock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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

import {
  CreateModeratorRequest,
  LockUserRequest,
  PaginationParams,
  UnlockUserRequest,
  User,
  userManagementService,
} from '../services/user-management.service';

interface UserManagementTableProps {
  userType: 'customers' | 'moderators';
  title: string;
  canCreate?: boolean;
}

export function UserManagementTable({
  userType,
  title,
  canCreate = false,
}: UserManagementTableProps) {
  const [page, setPage] = useState(1);
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [lockDays, setLockDays] = useState(7);
  const [newModeratorEmail, setNewModeratorEmail] = useState('');

  const queryClient = useQueryClient();
  const queryKey = [userType, { page }];

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      const params: PaginationParams = { page: page, pageSize: 10 };
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
        `${userType === 'customers' ? 'Khách hàng' : 'Moderator'} đã được khóa thành công.`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể khóa người dùng.');
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
        `${userType === 'customers' ? 'Khách hàng' : 'Moderator'} đã được mở khóa thành công.`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Không thể mở khóa người dùng.');
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
    if (selectedUser && lockDays >= 2) {
      lockMutation.mutate({
        userId: selectedUser.Id,
        day: lockDays,
      });
    }
  };

  const confirmUnlock = () => {
    if (selectedUser) {
      unlockMutation.mutate({
        userId: selectedUser.Id,
      });
    }
  };

  const handleCreateModerator = () => {
    if (newModeratorEmail.trim()) {
      createModeratorMutation.mutate({
        email: newModeratorEmail.trim(),
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return <Badge variant="default">Đã xác thực</Badge>;
      case 'Unverified':
        return <Badge variant="secondary">Chưa xác thực</Badge>;
      case 'Locked':
        return <Badge variant="danger">Đã khóa</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tạo Moderator
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo Tài Khoản Moderator Mới</DialogTitle>
                <DialogDescription>
                  Nhập địa chỉ email cho tài khoản moderator mới. Mật khẩu tạm thời sẽ được gửi đến
                  email này.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Địa Chỉ Email</Label>
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead>Ngày Tạo</TableHead>
              <TableHead>Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersData?.Items?.map((user) => (
              <TableRow key={user.Id}>
                <TableCell>{`${user.FirstName} ${user.LastName}`}</TableCell>
                <TableCell>{user.Email}</TableCell>
                <TableCell>{getStatusBadge(user.Status)}</TableCell>
                <TableCell>{new Date(user.CreatedDateUTC).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {user.Status === 'Locked' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnlock(user)}
                        disabled={unlockMutation.isPending}
                      >
                        <Unlock className="mr-1 h-3 w-3" />
                        Mở Khóa
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLock(user)}
                        disabled={lockMutation.isPending}
                      >
                        <Lock className="mr-1 h-3 w-3" />
                        Khóa
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {usersData && usersData.TotalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
            Trước
          </Button>
          <span className="flex items-center px-4">
            Trang {page} / {usersData.TotalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === usersData.TotalPages}
          >
            Tiếp
          </Button>
        </div>
      )}

      {/* Lock User Dialog */}
      <Dialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Khóa Tài Khoản Người Dùng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn khóa tài khoản của {selectedUser?.FirstName}{' '}
              {selectedUser?.LastName} không? Vui lòng chọn số ngày khóa tài khoản.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="days">Số ngày khóa (tối thiểu 2 ngày)</Label>
              <Input
                id="days"
                type="number"
                min="2"
                value={lockDays}
                onChange={(e) => setLockDays(parseInt(e.target.value) || 2)}
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
              disabled={lockDays < 2 || lockMutation.isPending}
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
              Bạn có chắc chắn muốn mở khóa tài khoản của {selectedUser?.FirstName}{' '}
              {selectedUser?.LastName} không?
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
