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
  const [lockReason, setLockReason] = useState('');
  const [newModeratorEmail, setNewModeratorEmail] = useState('');

  const queryClient = useQueryClient();
  const queryKey = [userType, { page }];

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      const params: PaginationParams = { pageNumber: page, pageSize: 10 };
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
      setLockReason('');
      toast.success(
        `${userType === 'customers' ? 'Customer' : 'Moderator'} has been locked successfully.`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to lock user.');
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
        `${userType === 'customers' ? 'Customer' : 'Moderator'} has been unlocked successfully.`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unlock user.');
    },
  });

  // Create moderator mutation
  const createModeratorMutation = useMutation({
    mutationFn: (request: CreateModeratorRequest) => userManagementService.createModerator(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [userType] });
      setCreateDialogOpen(false);
      setNewModeratorEmail('');
      toast.success('Moderator account has been created successfully.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create moderator account.');
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
    if (selectedUser && lockReason.trim()) {
      lockMutation.mutate({
        userId: selectedUser.id,
        reason: lockReason.trim(),
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
        return <Badge variant="default">Verified</Badge>;
      case 'Unverified':
        return <Badge variant="secondary">Unverified</Badge>;
      case 'Locked':
        return <Badge variant="danger">Locked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
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
                Create Moderator
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Moderator Account</DialogTitle>
                <DialogDescription>
                  Enter the email address for the new moderator account. A temporary password will
                  be sent to this email.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
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
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateModerator}
                  disabled={!newModeratorEmail.trim() || createModeratorMutation.isPending}
                >
                  {createModeratorMutation.isPending ? 'Creating...' : 'Create Account'}
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersData?.data?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                <TableCell>{new Date(user.createdDateUTC).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {user.status === 'Locked' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnlock(user)}
                        disabled={unlockMutation.isPending}
                      >
                        <Unlock className="mr-1 h-3 w-3" />
                        Unlock
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLock(user)}
                        disabled={lockMutation.isPending}
                      >
                        <Lock className="mr-1 h-3 w-3" />
                        Lock
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
      {usersData && usersData.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {usersData.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === usersData.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Lock User Dialog */}
      <Dialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lock User Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to lock {selectedUser?.firstName} {selectedUser?.lastName}
              &apos;s account? Please provide a reason for locking this account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for locking</Label>
              <Input
                id="reason"
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                placeholder="Enter reason for locking this account"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLockDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmLock}
              disabled={!lockReason.trim() || lockMutation.isPending}
            >
              {lockMutation.isPending ? 'Locking...' : 'Lock Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlock User Dialog */}
      <Dialog open={unlockDialogOpen} onOpenChange={setUnlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock User Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to unlock {selectedUser?.firstName} {selectedUser?.lastName}
              &apos;s account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnlockDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmUnlock} disabled={unlockMutation.isPending}>
              {unlockMutation.isPending ? 'Unlocking...' : 'Unlock Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
